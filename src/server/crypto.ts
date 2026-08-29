/**
 * Security & Cryptography Utilities for Cloudflare Workers & Modern Runtimes
 * Uses standard Web Crypto API (SubtleCrypto) - 100% compatible with Cloudflare Workers.
 */

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  role: 'OWNER' | 'SUPER_ADMIN';
  exp: number; // Expiry timestamp in ms
  iat: number; // Issued-at timestamp in ms
}

// Convert BufferSource to hex string
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Hash password using PBKDF2 with SHA-256 and a 16-byte random salt.
 * Output format: "pbkdf2:sha256:100000:saltHex:hashHex"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const saltHex = bufToHex(salt.buffer);
  const hashHex = bufToHex(derivedBits);

  return `pbkdf2:sha256:${iterations}:${saltHex}:${hashHex}`;
}

/**
 * Verify password against stored PBKDF2 hash or bootstrap hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !password) return false;

  // 1. Standard PBKDF2 verification
  if (storedHash.startsWith('pbkdf2:sha256:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 5) return false;
    const iterations = parseInt(parts[2], 10);
    const salt = hexToBuf(parts[3]);
    const expectedHashHex = parts[4];

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const actualHashHex = bufToHex(derivedBits);
    return constantTimeCompare(actualHashHex, expectedHashHex);
  }

  // 2. Safe transition for initial bootstrap accounts (e.g. hytex123)
  return constantTimeCompare(password, storedHash);
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate HMAC-SHA256 Signed Session Token
 */
export async function createSessionToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>,
  secretKey: string,
  expiresInSeconds: number = 7 * 24 * 3600 // 7 days default
): Promise<string> {
  const now = Date.now();
  const tokenPayload: AuthTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds * 1000,
  };

  const enc = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(tokenPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const message = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey || 'kannaku-saas-production-session-key-fallback-2026'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${message}.${sigB64}`;
}

/**
 * Verify HMAC-SHA256 Signed Session Token
 */
export async function verifySessionToken(
  token: string,
  secretKey: string
): Promise<AuthTokenPayload | null> {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const message = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretKey || 'kannaku-saas-production-session-key-fallback-2026'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert Base64URL to binary
    const sigBase64 = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const sigBinary = atob(sigBase64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(message));
    if (!isValid) return null;

    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload: AuthTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Simple in-memory rate limiter for Workers
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}
