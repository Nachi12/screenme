import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import {
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
} from '@screenme/shared';
import { env } from '../config/env.js';
import {
  clearAuthCookie,
  setAuthCookie,
  signAuthToken,
} from '../middleware/auth.middleware.js';
import { UserModel } from '../models/User.model.js';
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sendSuccess } from '../utils/response.js';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = RegisterRequestSchema.parse(req.body);
    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordHash });

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    setAuthCookie(res, token);

    sendSuccess(
      res,
      {
        user: { id: user.id, name: user.name, email: user.email },
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = LoginRequestSchema.parse(req.body);
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    setAuthCookie(res, token);

    sendSuccess(res, {
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  clearAuthCookie(res);
  sendSuccess(res, { loggedOut: true });
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    sendSuccess(res, {
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = ForgotPasswordRequestSchema.parse(req.body);
    const user = await UserModel.findOne({ email });

    let devResetToken: string | undefined;
    if (user) {
      const rawToken = crypto.randomBytes(24).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      if (env.NODE_ENV !== 'production') {
        devResetToken = rawToken;
        logger.info('Issued development password reset token', {
          userId: user.id,
        });
      }
    }

    sendSuccess(res, {
      message:
        'If an account exists for that email, a password reset instruction has been issued.',
      ...(devResetToken ? { devResetToken } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = ResetPasswordRequestSchema.parse(req.body);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired password reset token.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    sendSuccess(res, { message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
}

