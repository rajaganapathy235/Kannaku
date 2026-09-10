#!/usr/bin/env node

/**
 * ==============================================================================
 * JustGST — Automated IndexNow Submission Engine
 * ==============================================================================
 * Protocol: IndexNow API (Bing, Yandex, Naver, Seznam)
 * Documentation: https://www.indexnow.org/documentation
 *
 * This script submits updated URLs (including llms.txt, comparison pages,
 * and key product landing routes) directly to IndexNow to trigger instant
 * search indexing and AI crawler discovery.
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HOST = 'justgst.in';
const BASE_URL = `https://${HOST}`;
const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/IndexNow';

// Persistent or Generated 32-hex API Key
const KEY_FILE_NAME = 'indexnow-key.json';
const KEY_STORAGE_PATH = path.join(__dirname, '..', KEY_FILE_NAME);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function getOrGenerateKey() {
  if (fs.existsSync(KEY_STORAGE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(KEY_STORAGE_PATH, 'utf8'));
      if (data.key && typeof data.key === 'string' && data.key.length >= 8) {
        return data.key;
      }
    } catch {
      // regenerate if corrupt
    }
  }

  // Generate 32-character hex key
  const newKey = crypto.randomBytes(16).toString('hex');
  fs.writeFileSync(
    KEY_STORAGE_PATH,
    JSON.stringify({ key: newKey, generatedAt: new Date().toISOString() }, null, 2),
    'utf8'
  );

  return newKey;
}

const API_KEY = getOrGenerateKey();

// Ensure the verification key text file is present in public/
try {
  const publicTxtPath = path.join(PUBLIC_DIR, `${API_KEY}.txt`);
  if (!fs.existsSync(publicTxtPath)) {
    fs.writeFileSync(publicTxtPath, API_KEY, 'utf8');
    console.log(`[+] Created IndexNow verification file: public/${API_KEY}.txt`);
  }
} catch (err) {
  console.warn(`[!] Note: Could not write to public/ directory:`, err.message);
}

// Complete list of URLs to submit
const URL_LIST = [
  // Primary AI Engine & Identity Endpoints
  `${BASE_URL}/llms.txt`,
  `${BASE_URL}/`,
  `${BASE_URL}/pricing/`,
  `${BASE_URL}/tools/free-gst-calculator/`,

  // Competitor Comparison Landing Pages
  `${BASE_URL}/compare/justgst-vs-vyapar/`,
  `${BASE_URL}/compare/justgst-vs-mybillbook/`,
  `${BASE_URL}/compare/justgst-vs-tally/`,
  `${BASE_URL}/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/`,

  // Core Product & Industry Solutions
  `${BASE_URL}/gst-billing-software/`,
  `${BASE_URL}/inventory-management-software/`,
  `${BASE_URL}/billing-software-for-retail/`,
  `${BASE_URL}/billing-software-for-wholesale/`,
  `${BASE_URL}/billing-software-for-manufacturing/`,
  `${BASE_URL}/billing-software-for-traders/`,
  `${BASE_URL}/billing-software-for-pharmacy/`,
  `${BASE_URL}/billing-software-for-supermarket/`,
  `${BASE_URL}/billing-software-for-apparel/`,
  `${BASE_URL}/billing-software-for-hardware/`,
  `${BASE_URL}/billing-software-for-electronics/`,
  `${BASE_URL}/billing-software-for-auto-parts/`,
  `${BASE_URL}/billing-software-for-footwear/`,
  `${BASE_URL}/billing-software-for-restaurants/`,
  `${BASE_URL}/billing-software-for-services/`,
];

const payload = {
  host: HOST,
  key: API_KEY,
  keyLocation: `${BASE_URL}/${API_KEY}.txt`,
  urlList: URL_LIST,
};

console.log('===========================================================');
console.log('🚀 JustGST IndexNow Automated Push Engine');
console.log('===========================================================');
console.log(`Host:        ${HOST}`);
console.log(`Key:         ${API_KEY}`);
console.log(`KeyLocation: ${payload.keyLocation}`);
console.log(`Total URLs:  ${URL_LIST.length}`);
console.log('-----------------------------------------------------------');

async function submitIndexNow() {
  try {
    const res = await fetch(INDEXNOW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'JustGST-IndexNow-Bot/1.0',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log(`HTTP Status Code: ${res.status} ${res.statusText}`);

    switch (res.status) {
      case 200:
        console.log('✅ SUCCESS: URLs submitted successfully to IndexNow.');
        break;
      case 202:
        console.log('✅ ACCEPTED: URL batch accepted by IndexNow engine. Processing indexing queue.');
        break;
      case 400:
        console.error('❌ BAD REQUEST: Invalid format in JSON request payload.');
        console.error(responseText);
        break;
      case 403:
        console.error('❌ FORBIDDEN: Key not valid or keyLocation verification file missing.');
        console.error(`Ensure ${payload.keyLocation} responds with "${API_KEY}".`);
        break;
      case 422:
        console.error('❌ UNPROCESSABLE ENTITY: URLs do not belong to host or key mismatch.');
        console.error(responseText);
        break;
      case 429:
        console.warn('⚠️ TOO MANY REQUESTS: Request rate limited. Retry in a few minutes.');
        break;
      default:
        console.log(`Response Body: ${responseText || '(Empty response)'}`);
    }
    console.log('===========================================================');
  } catch (error) {
    console.error('❌ Network Error contacting IndexNow API:', error.message);
  }
}

submitIndexNow();
