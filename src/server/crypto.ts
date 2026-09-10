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
 * Compute SHA-512 hex digest using Web Crypto API.
 * Used for PayU payment gateway forward hash and reverse verification.
 */
export async function sha512Hex(str: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-512', enc.encode(str));
  return bufToHex(digest);
}

export interface PayUForwardHashParams {
  key: string;
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
  salt: string;
}

/**
 * Generate PayU SHA-512 Hosted Checkout Forward Hash
 * Sequence: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
 */
export async function generatePayUForwardHash(params: PayUForwardHashParams): Promise<{
  hash: string;
  hashString: string;
}> {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    udf6 = '',
    udf7 = '',
    udf8 = '',
    udf9 = '',
    udf10 = '',
    salt,
  } = params;

  // Format amount to string (e.g. "99.00" or raw string)
  const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : String(amount);

  const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${salt}`;
  const hash = await sha512Hex(hashString);

  return { hash, hashString };
}

export interface PayUReverseHashParams {
  key: string;
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
  additionalCharges?: string | number;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify PayU Webhook / IPN / Browser Return Reverse SHA-512 Hash
 * Standard Sequence: sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Additional Charges Sequence: sha512(additionalCharges|salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export async function verifyPayUReverseHashPayload(
  payload: Record<string, any>,
  salt: string,
  configuredKey?: string
): Promise<{
  isValid: boolean;
  calculatedHash: string;
  receivedHash: string;
  usedAdditionalCharges: boolean;
}> {
  const cleanSalt = (salt || '').trim();
  const cleanKey = (payload.key || configuredKey || '').trim();

  if (!cleanSalt) {
    return { isValid: false, calculatedHash: '', receivedHash: '', usedAdditionalCharges: false };
  }

  const txnid = (payload.txnid || '').trim();
  const amount = payload.amount !== undefined ? String(payload.amount).trim() : '';
  // IMPORTANT: Do not .trim() productinfo — PayU's hash is computed over the exact
  // string originally sent at checkout, which often contains trailing/double spaces
  // (e.g. "Plan Name  1 Month  Monthly Access  "). Trimming here changes the hash
  // input and causes genuinely successful payments to fail verification.
  const productinfo = payload.productinfo || '';
  const firstname = (payload.firstname || '').trim();
  const email = (payload.email || '').trim();
  const status = (payload.status || payload.unmappedstatus || '').trim();
  const receivedHash = (payload.hash || '').trim().toLowerCase();

  const udf1 = payload.udf1 || '';
  const udf2 = payload.udf2 || '';
  const udf3 = payload.udf3 || '';
  const udf4 = payload.udf4 || '';
  const udf5 = payload.udf5 || '';
  const udf6 = payload.udf6 || '';
  const udf7 = payload.udf7 || '';
  const udf8 = payload.udf8 || '';
  const udf9 = payload.udf9 || '';
  const udf10 = payload.udf10 || '';
  const additionalCharges = payload.additionalCharges;

  // 1. Standard reverse hash sequence:
  // sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  const standardSequence = `${cleanSalt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${cleanKey}`;
  const calcHash = await sha512Hex(standardSequence);

  if (receivedHash && constantTimeCompare(calcHash.toLowerCase(), receivedHash)) {
    return {
      isValid: true,
      calculatedHash: calcHash,
      receivedHash,
      usedAdditionalCharges: false,
    };
  }

  // 2. Additional charges sequence if present:
  // sha512(additionalCharges|salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  if (additionalCharges !== undefined && additionalCharges !== null && additionalCharges !== '') {
    const chargesSequence = `${additionalCharges}|${cleanSalt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${cleanKey}`;
    const calcChargesHash = await sha512Hex(chargesSequence);

    if (receivedHash && constantTimeCompare(calcChargesHash.toLowerCase(), receivedHash)) {
      return {
        isValid: true,
        calculatedHash: calcChargesHash,
        receivedHash,
        usedAdditionalCharges: true,
      };
    }
  }

  return {
    isValid: false,
    calculatedHash: calcHash,
    receivedHash,
    usedAdditionalCharges: false,
  };
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
    enc.encode(secretKey || 'kannaku-dev-only-insecure-fallback-key'),
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
      enc.encode(secretKey || 'kannaku-dev-only-insecure-fallback-key'),
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
 * In-memory rate limiter with automated expiration cleanup and memory bounds.
 * Note: Cloudflare Workers run distributed edge isolates; this provides per-isolate protection.
 */
const MAX_RATE_LIMIT_ENTRIES = 5000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function cleanupExpiredRateLimits(now: number): void {
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetAt) {
      rateLimitMap.delete(k);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Periodic/capacity-based cleanup to prevent unbounded memory growth
  if (rateLimitMap.size > 100) {
    cleanupExpiredRateLimits(now);
  }

  // Hard upper limit on map size to prevent memory exhaustion DoS
  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }

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
