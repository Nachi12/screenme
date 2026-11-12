import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      guestSessionId?: string;
    }
  }
}

export const AUTH_COOKIE_NAME = 'screenme_token';
export const GUEST_COOKIE_NAME = 'screenme_guest';

export function signAuthToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): AuthUserPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.userId === 'string' &&
      typeof decoded.email === 'string' &&
      typeof decoded.name === 'string'
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function signGuestSession(sessionId: string): string {
  const sig = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(sessionId)
    .digest('hex');
  return `${sessionId}.${sig}`;
}

function verifyGuestSession(rawCookie: string): string | null {
  const parts = rawCookie.split('.');
  if (parts.length !== 2) return null;
  const [sessionId, sig] = parts;
  if (!sessionId || !sig) return null;
  const expected = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(sessionId)
    .digest('hex');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  return crypto.timingSafeEqual(sigBuf, expectedBuf) ? sessionId : null;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const cookieToken =
    typeof req.cookies?.[AUTH_COOKIE_NAME] === 'string'
      ? req.cookies[AUTH_COOKIE_NAME]
      : undefined;
  const headerAuth = req.headers.authorization;
  const bearerToken =
    headerAuth && headerAuth.startsWith('Bearer ')
      ? headerAuth.slice(7).trim()
      : undefined;
  const token = cookieToken ?? bearerToken;

  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      req.user = payload;
      return next();
    }
  }

  const rawGuest =
    typeof req.cookies?.[GUEST_COOKIE_NAME] === 'string'
      ? req.cookies[GUEST_COOKIE_NAME]
      : undefined;
  const existingGuestId = rawGuest ? verifyGuestSession(rawGuest) : null;

  if (existingGuestId) {
    req.guestSessionId = existingGuestId;
  } else {
    const newGuestId = crypto.randomUUID();
    req.guestSessionId = newGuestId;
    res.cookie(GUEST_COOKIE_NAME, signGuestSession(newGuestId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.COOKIE_SECURE,
      maxAge: env.GUEST_REPORT_TTL_HOURS * 60 * 60 * 1000,
      path: '/',
    });
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken =
    typeof req.cookies?.[AUTH_COOKIE_NAME] === 'string'
      ? req.cookies[AUTH_COOKIE_NAME]
      : undefined;
  const headerAuth = req.headers.authorization;
  const bearerToken =
    headerAuth && headerAuth.startsWith('Bearer ')
      ? headerAuth.slice(7).trim()
      : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    return next(new UnauthorizedError('Please sign in to access this resource.'));
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return next(new UnauthorizedError('Your session has expired. Please sign in again.'));
  }

  req.user = payload;
  next();
}

