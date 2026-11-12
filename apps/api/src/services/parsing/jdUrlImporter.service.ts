import dns from 'node:dns/promises';
import net from 'node:net';
import { ValidationError } from '../../utils/errors.js';

const SUPPORTED_JOB_HOSTS = [
  'boards.greenhouse.io',
  'job-boards.greenhouse.io',
  'jobs.lever.co',
  'jobs.ashbyhq.com',
  'internshala.com',
  'www.internshala.com',
  'wellfound.com',
  'www.wellfound.com',
];

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a = 0, b = 0] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower.startsWith('::ffff:')) {
      const mappedV4 = lower.slice(7);
      if (net.isIPv4(mappedV4)) {
        return isPrivateIp(mappedV4);
      }
      return true;
    }
    return (
      lower === '::' ||
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80')
    );
  }
  return true;
}

function stripHtmlToText(html: string): { title?: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim();

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<\/(p|div|li|h1|h2|h3|h4|br|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, text: cleaned.slice(0, 20000) };
}

export async function importJobDescriptionFromUrl(rawUrl: string): Promise<{
  imported: boolean;
  title?: string;
  rawText?: string;
  fallbackReason?: string;
}> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new ValidationError('Invalid job posting URL format.');
  }

  if (parsedUrl.protocol !== 'https:') {
    return {
      imported: false,
      fallbackReason: 'Only HTTPS URLs from supported job boards can be imported. Please paste the job description manually.',
    };
  }

  const host = parsedUrl.hostname.toLowerCase();
  const isSupported = SUPPORTED_JOB_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
  if (!isSupported) {
    return {
      imported: false,
      fallbackReason: `Automatic import is restricted to supported public job boards (Greenhouse, Lever, Ashby, Internshala, Wellfound). Please paste the JD text directly.`,
    };
  }

  try {
    const resolved = await dns.lookup(host, { all: true });
    if (resolved.some((addr) => isPrivateIp(addr.address))) {
      return {
        imported: false,
        fallbackReason: 'Target host resolved to a restricted network address. Please paste the job description manually.',
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ScreenMe-JD-Importer/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'error',
      });

      if (!response.ok) {
        return {
          imported: false,
          fallbackReason: `Could not fetch job posting (HTTP ${response.status}). Please copy and paste the job description text below.`,
        };
      }

      const html = await response.text();
      if (html.length > 1_500_000) {
        return {
          imported: false,
          fallbackReason: 'Job page exceeded maximum import size. Please paste the job description manually.',
        };
      }

      const extracted = stripHtmlToText(html);
      if (extracted.text.length < 100) {
        return {
          imported: false,
          fallbackReason: 'This job page requires client-side rendering or login. Please paste the job description manually.',
        };
      }

      return {
        imported: true,
        title: extracted.title,
        rawText: extracted.text,
      };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return {
      imported: false,
      fallbackReason: 'Unable to reach the job posting URL right now. Please paste the job description manually.',
    };
  }
}

