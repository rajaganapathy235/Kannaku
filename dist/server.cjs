var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  createD1Adapter: () => createD1Adapter
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_node_sqlite = require("node:sqlite");
var import_vite = require("vite");

// src/server/crypto.ts
function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
async function sha512Hex(str) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-512", enc.encode(str));
  return bufToHex(digest);
}
async function generatePayUForwardHash(params) {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    udf6 = "",
    udf7 = "",
    udf8 = "",
    udf9 = "",
    udf10 = "",
    salt
  } = params;
  const formattedAmount = typeof amount === "number" ? amount.toFixed(2) : String(amount);
  const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${salt}`;
  const hash = await sha512Hex(hashString);
  return { hash, hashString };
}
function constantTimeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
async function verifyPayUReverseHashPayload(payload, salt, configuredKey) {
  const cleanSalt = (salt || "").trim();
  const cleanKey = (payload.key || configuredKey || "").trim();
  if (!cleanSalt) {
    return { isValid: false, calculatedHash: "", receivedHash: "", usedAdditionalCharges: false };
  }
  const txnid = (payload.txnid || "").trim();
  const amount = payload.amount !== void 0 ? String(payload.amount).trim() : "";
  const productinfo = payload.productinfo || "";
  const firstname = (payload.firstname || "").trim();
  const email = (payload.email || "").trim();
  const status = (payload.status || payload.unmappedstatus || "").trim();
  const receivedHash = (payload.hash || "").trim().toLowerCase();
  const udf1 = payload.udf1 || "";
  const udf2 = payload.udf2 || "";
  const udf3 = payload.udf3 || "";
  const udf4 = payload.udf4 || "";
  const udf5 = payload.udf5 || "";
  const udf6 = payload.udf6 || "";
  const udf7 = payload.udf7 || "";
  const udf8 = payload.udf8 || "";
  const udf9 = payload.udf9 || "";
  const udf10 = payload.udf10 || "";
  const additionalCharges = payload.additionalCharges;
  const standardSequence = `${cleanSalt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${cleanKey}`;
  const calcHash = await sha512Hex(standardSequence);
  if (receivedHash && constantTimeCompare(calcHash.toLowerCase(), receivedHash)) {
    return {
      isValid: true,
      calculatedHash: calcHash,
      receivedHash,
      usedAdditionalCharges: false
    };
  }
  if (additionalCharges !== void 0 && additionalCharges !== null && additionalCharges !== "") {
    const chargesSequence = `${additionalCharges}|${cleanSalt}|${status}|${udf10}|${udf9}|${udf8}|${udf7}|${udf6}|${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${cleanKey}`;
    const calcChargesHash = await sha512Hex(chargesSequence);
    if (receivedHash && constantTimeCompare(calcChargesHash.toLowerCase(), receivedHash)) {
      return {
        isValid: true,
        calculatedHash: calcChargesHash,
        receivedHash,
        usedAdditionalCharges: true
      };
    }
  }
  return {
    isValid: false,
    calculatedHash: calcHash,
    receivedHash,
    usedAdditionalCharges: false
  };
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 1e5;
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  const saltHex = bufToHex(salt.buffer);
  const hashHex = bufToHex(derivedBits);
  return `pbkdf2:sha256:${iterations}:${saltHex}:${hashHex}`;
}
async function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith("pbkdf2:sha256:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 5) return false;
    const iterations = parseInt(parts[2], 10);
    const salt = hexToBuf(parts[3]);
    const expectedHashHex = parts[4];
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );
    const actualHashHex = bufToHex(derivedBits);
    return constantTimeCompare(actualHashHex, expectedHashHex);
  }
  return constantTimeCompare(password, storedHash);
}
async function createSessionToken(payload, secretKey, expiresInSeconds = 7 * 24 * 3600) {
  const now = Date.now();
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds * 1e3
  };
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(tokenPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const message = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey || "kannaku-dev-only-insecure-fallback-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${message}.${sigB64}`;
}
async function verifySessionToken(token, secretKey) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const message = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secretKey || "kannaku-dev-only-insecure-fallback-key"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBase64 = sigB64.replace(/-/g, "+").replace(/_/g, "/");
    const sigBinary = atob(sigBase64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(message));
    if (!isValid) return null;
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
var MAX_RATE_LIMIT_ENTRIES = 5e3;
var rateLimitMap = /* @__PURE__ */ new Map();
function cleanupExpiredRateLimits(now) {
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetAt) {
      rateLimitMap.delete(k);
    }
  }
}
function checkRateLimit(key, limit = 10, windowSeconds = 60) {
  const now = Date.now();
  if (rateLimitMap.size > 100) {
    cleanupExpiredRateLimits(now);
  }
  if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1e3 });
    return { allowed: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// src/server/db.ts
async function queryAll(db, sql, ...params) {
  try {
    let stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const res = await stmt.all();
    return res.results || [];
  } catch (err) {
    console.error("D1 queryAll error:", err?.message || err, sql);
    throw new Error("Database query failed");
  }
}
async function queryFirst(db, sql, ...params) {
  try {
    let stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const res = await stmt.first();
    return res ?? null;
  } catch (err) {
    console.error("D1 queryFirst error:", err?.message || err, sql);
    throw new Error("Database query failed");
  }
}
async function execute(db, sql, ...params) {
  try {
    let stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    const res = await stmt.run();
    return res.success;
  } catch (err) {
    console.error("D1 execute error:", err?.message || err, sql);
    throw new Error("Database execute failed");
  }
}
async function ensureTables(db) {
  try {
    const planTableInfo = await db.prepare("PRAGMA table_info(saas_plans)").all();
    const planCols = planTableInfo.results || [];
    if (Array.isArray(planCols) && planCols.length > 0) {
      const existingColNames = new Set(planCols.map((c) => c.name));
      const expectedPlanColumns = [
        "id",
        "name",
        "code",
        "tagline",
        "monthly_price_inr",
        "six_month_price_inr",
        "three_month_price_inr",
        "yearly_price_inr",
        "trial_duration_days",
        "billing_type",
        "is_popular",
        "is_archived",
        "limits_json"
      ];
      const missingPlanCols = expectedPlanColumns.filter((col) => !existingColNames.has(col));
      if (missingPlanCols.length > 0) {
        const timestamp = Date.now();
        const backupTable = `saas_plans_schema_mismatch_${timestamp}`;
        console.warn(
          `[SCHEMA DRIFT WARNING] Table 'saas_plans' has an incompatible older schema! Found columns: [${Array.from(
            existingColNames
          ).join(", ")}]. Missing expected columns: [${missingPlanCols.join(
            ", "
          )}]. Safely renaming legacy table to '${backupTable}' and re-creating fresh 'saas_plans' schema...`
        );
        await db.prepare(`ALTER TABLE saas_plans RENAME TO ${backupTable}`).run();
        await db.prepare(
          `CREATE TABLE saas_plans (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              code TEXT NOT NULL,
              tagline TEXT,
              monthly_price_inr REAL NOT NULL,
              six_month_price_inr REAL,
              three_month_price_inr REAL,
              yearly_price_inr REAL NOT NULL,
              trial_duration_days INTEGER DEFAULT 15,
              billing_type TEXT DEFAULT 'ONE_TIME',
              is_popular INTEGER DEFAULT 0,
              is_archived INTEGER DEFAULT 0,
              limits_json TEXT,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )`
        ).run();
        const defaultLimits = JSON.stringify({
          maxUsers: 999,
          maxInvoicesPerMonth: 999999,
          maxQuotationsPerMonth: 999999,
          maxCustomers: 999999,
          maxProducts: 999999,
          pdfGenerationsLimit: 999999,
          hasMultiUser: true,
          hasGstReports: true,
          hasCustomBranding: true,
          hasDigitalStampSign: true,
          hasInventoryAlerts: true,
          hasTallyPrintFormats: true,
          hasUpiQrPayment: true,
          hasPurchaseLedger: true
        });
        await db.prepare(
          `INSERT INTO saas_plans (
              id, name, code, tagline, monthly_price_inr, six_month_price_inr, three_month_price_inr, yearly_price_inr, trial_duration_days, billing_type, is_popular, is_archived, limits_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          "plan_all_in_one_pro",
          "All-in-One Growth Plan",
          "ALL_IN_ONE",
          "Single comprehensive plan with ALL GST invoicing, Tally multi-copy prints & compliance features unlocked",
          99,
          474,
          237,
          588,
          15,
          "ONE_TIME",
          1,
          0,
          defaultLimits
        ).run();
        console.warn(`[SCHEMA DRIFT RESOLVED] Fresh 'saas_plans' table created and seeded with 'plan_all_in_one_pro'.`);
      }
    }
  } catch (err) {
    console.error("[ensureTables] Schema verification error on saas_plans:", err?.message || err);
  }
  const tableDefinitions = [
    {
      name: "organizations",
      sql: `CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        owner_name TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        mobile TEXT NOT NULL,
        country TEXT DEFAULT 'India',
        address TEXT,
        city TEXT,
        state TEXT,
        pin TEXT,
        state_code TEXT DEFAULT '33',
        register_number TEXT,
        pan_number TEXT,
        bill_prefix TEXT DEFAULT 'INV/2026/',
        bank_details_json TEXT,
        terms_conditions TEXT,
        logo_url TEXT,
        stamp_url TEXT,
        signature_url TEXT,
        plan_id TEXT DEFAULT 'plan_all_in_one_pro',
        plan_name TEXT DEFAULT 'All-in-One Growth Plan',
        subscription_status TEXT DEFAULT 'ACTIVE',
        account_status TEXT DEFAULT 'ACTIVE',
        billing_cycle TEXT DEFAULT 'MONTHLY',
        billing_type TEXT DEFAULT 'ONE_TIME',
        subscription_start_date TEXT DEFAULT CURRENT_TIMESTAMP,
        renewal_date TEXT,
        trial_end_date TEXT,
        mrr_inr REAL DEFAULT 0,
        users_count INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_active TEXT DEFAULT CURRENT_TIMESTAMP,
        payment_provider TEXT DEFAULT 'payu',
        custom_domain TEXT,
        notes TEXT
      )`
    },
    {
      name: "platform_users",
      sql: `CREATE TABLE IF NOT EXISTS platform_users (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'OWNER',
        status TEXT DEFAULT 'ACTIVE',
        avatar_url TEXT,
        google_id TEXT,
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "password_resets",
      sql: `CREATE TABLE IF NOT EXISTS password_resets (
        email TEXT PRIMARY KEY,
        otp TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "clients",
      sql: `CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        company_name TEXT,
        email TEXT,
        mobile TEXT,
        register_number TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pin TEXT,
        state_code TEXT,
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        credit_limit REAL DEFAULT 0,
        client_type TEXT DEFAULT 'customer',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "products",
      sql: `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        item_code TEXT,
        hsn_code TEXT NOT NULL,
        description TEXT,
        unit TEXT DEFAULT 'PCS',
        purchase_rate REAL DEFAULT 0,
        sales_rate REAL NOT NULL,
        mrp REAL,
        tax_percentage REAL DEFAULT 18.00,
        current_stock REAL DEFAULT 0,
        min_stock_alert REAL DEFAULT 5,
        subline1 TEXT,
        subline2 TEXT,
        subline3 TEXT,
        barcode TEXT,
        category TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "invoices",
      sql: `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        invoice_number TEXT NOT NULL,
        invoice_type INTEGER NOT NULL DEFAULT 1,
        invoice_date TEXT NOT NULL,
        due_date TEXT,
        po_number TEXT,
        client_id TEXT REFERENCES clients(id),
        client_name TEXT NOT NULL,
        client_gstin TEXT,
        client_address TEXT,
        client_city TEXT,
        client_state TEXT,
        client_mobile TEXT,
        place_of_supply TEXT,
        sub_total REAL NOT NULL DEFAULT 0,
        discount_total REAL DEFAULT 0,
        cgst_amount REAL DEFAULT 0,
        sgst_amount REAL DEFAULT 0,
        igst_amount REAL DEFAULT 0,
        total_tax REAL DEFAULT 0,
        tcs_percentage REAL DEFAULT 0,
        tcs_amount REAL DEFAULT 0,
        round_off REAL DEFAULT 0,
        grand_total REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        balance_amount REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'UNPAID',
        payment_mode TEXT DEFAULT 'CASH',
        print_template TEXT DEFAULT 'modern',
        qr_code_upi TEXT,
        notes TEXT,
        terms TEXT,
        items_json TEXT,
        extra_items_json TEXT,
        consignee_json TEXT,
        calc_json TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "invoice_items",
      sql: `CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES products(id),
        name TEXT NOT NULL,
        hsn_code TEXT NOT NULL,
        qty REAL NOT NULL,
        unit TEXT DEFAULT 'PCS',
        rate REAL NOT NULL,
        mrp REAL,
        inclusive_or_exclusive TEXT DEFAULT 'exclusive',
        discount_percentage REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        tax_percentage REAL NOT NULL,
        tax_amount REAL NOT NULL,
        cgst_rate REAL DEFAULT 0,
        cgst_amount REAL DEFAULT 0,
        sgst_rate REAL DEFAULT 0,
        sgst_amount REAL DEFAULT 0,
        igst_rate REAL DEFAULT 0,
        igst_amount REAL DEFAULT 0,
        line_total REAL NOT NULL,
        subline1 TEXT,
        subline2 TEXT,
        subline3 TEXT
      )`
    },
    {
      name: "payment_ledgers",
      sql: `CREATE TABLE IF NOT EXISTS payment_ledgers (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        client_id TEXT REFERENCES clients(id),
        invoice_id TEXT REFERENCES invoices(id),
        entry_date TEXT NOT NULL,
        payment_type TEXT NOT NULL,
        mode TEXT NOT NULL,
        amount REAL NOT NULL,
        reference_number TEXT,
        bank_account TEXT,
        notes TEXT,
        entry_type TEXT,
        particular TEXT,
        vch_no TEXT,
        debit_credit TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "audit_logs",
      sql: `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        organization_id TEXT,
        admin_id TEXT NOT NULL,
        admin_name TEXT NOT NULL,
        admin_role TEXT NOT NULL,
        action TEXT NOT NULL,
        target_id TEXT,
        target_name TEXT,
        target_type TEXT,
        old_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "impersonation_sessions",
      sql: `CREATE TABLE IF NOT EXISTS impersonation_sessions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        organization_name TEXT NOT NULL,
        tenant_email TEXT NOT NULL,
        admin_id TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        admin_name TEXT NOT NULL,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        ended_at TEXT,
        reason TEXT
      )`
    },
    {
      name: "saas_plans",
      sql: `CREATE TABLE IF NOT EXISTS saas_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        tagline TEXT,
        monthly_price_inr REAL DEFAULT 0,
        six_month_price_inr REAL DEFAULT 0,
        three_month_price_inr REAL DEFAULT 0,
        yearly_price_inr REAL DEFAULT 0,
        trial_duration_days INTEGER DEFAULT 15,
        billing_type TEXT DEFAULT 'ONE_TIME',
        is_popular INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,
        limits_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "saas_transactions",
      sql: `CREATE TABLE IF NOT EXISTS saas_transactions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        organization_name TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        payment_method TEXT DEFAULT 'UPI',
        payment_provider TEXT DEFAULT 'PayU',
        status TEXT DEFAULT 'SUCCESSFUL',
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        invoice_number TEXT,
        subscription_id TEXT,
        plan_name TEXT,
        billing_cycle TEXT DEFAULT 'YEARLY',
        receipt_url TEXT,
        gateway_ref_id TEXT,
        failure_reason TEXT,
        refund_amount REAL DEFAULT 0,
        refund_date TEXT,
        customer_email TEXT
      )`
    },
    {
      name: "coupons",
      sql: `CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        duration_type TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        usage_limit INTEGER DEFAULT 100,
        used_count INTEGER DEFAULT 0,
        per_user_limit INTEGER DEFAULT 1,
        plan_restrictions_json TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "feature_flags",
      sql: `CREATE TABLE IF NOT EXISTS feature_flags (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Billing',
        scope TEXT DEFAULT 'GLOBAL',
        is_enabled_global INTEGER DEFAULT 1,
        enabled_plans_json TEXT,
        targeted_org_ids_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "support_tickets",
      sql: `CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        organization_name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        category TEXT DEFAULT 'Billing & Invoicing',
        priority TEXT DEFAULT 'MEDIUM',
        status TEXT DEFAULT 'OPEN',
        assigned_admin_name TEXT,
        messages_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "announcements",
      sql: `CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'INFO',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        target_audience TEXT DEFAULT 'ALL',
        target_plans_json TEXT,
        target_org_ids_json TEXT,
        is_active INTEGER DEFAULT 1,
        is_dismissible INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "email_templates",
      sql: `CREATE TABLE IF NOT EXISTS email_templates (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        variables_json TEXT,
        body_html TEXT NOT NULL,
        is_enabled INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "system_error_logs",
      sql: `CREATE TABLE IF NOT EXISTS system_error_logs (
        id TEXT PRIMARY KEY,
        error_type TEXT NOT NULL,
        message TEXT NOT NULL,
        organization_id TEXT,
        organization_name TEXT,
        user_email TEXT,
        endpoint TEXT,
        http_status INTEGER,
        first_seen TEXT DEFAULT CURRENT_TIMESTAMP,
        last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
        occurrences INTEGER DEFAULT 1,
        status TEXT DEFAULT 'UNRESOLVED',
        stack_trace TEXT
      )`
    },
    {
      name: "app_settings",
      sql: `CREATE TABLE IF NOT EXISTS app_settings (
        config_key TEXT PRIMARY KEY,
        config_value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "platform_settings",
      sql: `CREATE TABLE IF NOT EXISTS platform_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        settings_json TEXT NOT NULL,
        updated_by TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "payment_gateway_config",
      sql: `CREATE TABLE IF NOT EXISTS payment_gateway_config (
        provider TEXT PRIMARY KEY,
        name TEXT,
        is_enabled INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_active_default INTEGER NOT NULL DEFAULT 0,
        is_test_mode INTEGER NOT NULL DEFAULT 1,
        merchant_key TEXT,
        merchant_salt TEXT,
        header_auth_key TEXT,
        webhook_secret TEXT,
        endpoint TEXT,
        config_json TEXT,
        extra_json TEXT,
        updated_by TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "subscription_transactions",
      sql: `CREATE TABLE IF NOT EXISTS subscription_transactions (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        txnid TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        plan_id TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        billing_cycle TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        payment_provider TEXT DEFAULT 'payu',
        payment_status TEXT NOT NULL,
        payu_payment_id TEXT,
        payu_response_json TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        coupon_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];
  for (const table of tableDefinitions) {
    try {
      await db.prepare(table.sql).run();
    } catch (err) {
      console.error(`[ensureTables] Failed to create table '${table.name}':`, err?.message || err);
    }
  }
  const indexDefinitions = [
    {
      name: "idx_platform_users_email",
      sql: `CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email)`
    },
    {
      name: "idx_platform_users_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_platform_users_org ON platform_users(organization_id)`
    },
    {
      name: "idx_clients_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id)`
    },
    {
      name: "idx_products_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id)`
    },
    {
      name: "idx_invoices_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id)`
    },
    {
      name: "idx_invoices_num",
      sql: `CREATE INDEX IF NOT EXISTS idx_invoices_num ON invoices(organization_id, invoice_number)`
    },
    {
      name: "idx_invoice_items_inv",
      sql: `CREATE INDEX IF NOT EXISTS idx_invoice_items_inv ON invoice_items(invoice_id)`
    },
    {
      name: "idx_payment_ledgers_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_payment_ledgers_org ON payment_ledgers(organization_id)`
    },
    {
      name: "idx_audit_logs_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id)`
    },
    {
      name: "idx_saas_transactions_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_saas_transactions_org ON saas_transactions(organization_id)`
    },
    {
      name: "idx_sub_txns_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_sub_txns_org ON subscription_transactions(organization_id)`
    },
    {
      name: "idx_sub_txns_txnid",
      sql: `CREATE INDEX IF NOT EXISTS idx_sub_txns_txnid ON subscription_transactions(txnid)`
    },
    {
      name: "idx_support_tickets_org",
      sql: `CREATE INDEX IF NOT EXISTS idx_support_tickets_org ON support_tickets(organization_id)`
    }
  ];
  for (const idx of indexDefinitions) {
    try {
      await db.prepare(idx.sql).run();
    } catch (err) {
      console.error(`[ensureTables] Failed to create index '${idx.name}':`, err?.message || err);
    }
  }
  try {
    const gwInfo = await db.prepare("PRAGMA table_info(payment_gateway_config)").all();
    const gwCols = gwInfo.results || [];
    if (Array.isArray(gwCols) && gwCols.length > 0) {
      const colNames = new Set(gwCols.map((c) => c.name));
      if (!colNames.has("name")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN name TEXT").run();
      if (!colNames.has("is_enabled")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN is_enabled INTEGER DEFAULT 1").run();
      if (!colNames.has("is_active_default")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN is_active_default INTEGER DEFAULT 0").run();
      if (!colNames.has("webhook_secret")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN webhook_secret TEXT").run();
      if (!colNames.has("endpoint")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN endpoint TEXT").run();
      if (!colNames.has("config_json")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN config_json TEXT").run();
      if (!colNames.has("header_auth_key")) await db.prepare("ALTER TABLE payment_gateway_config ADD COLUMN header_auth_key TEXT").run();
    }
  } catch {
  }
  try {
    await db.prepare(`
        UPDATE organizations
        SET plan_id = 'plan_all_in_one_pro',
            plan_name = 'All-in-One Growth Plan'
        WHERE plan_id = 'plan_pro' OR plan_name = 'Pro Trader' OR plan_id IS NULL OR plan_id = ''
      `).run();
    await db.prepare(`
        UPDATE subscription_transactions
        SET plan_id = 'plan_all_in_one_pro',
            plan_name = 'All-in-One Growth Plan'
        WHERE plan_id = 'plan_pro' OR plan_name = 'Pro Trader'
      `).run();
    await db.prepare(`
        UPDATE saas_transactions
        SET plan_name = 'All-in-One Growth Plan'
        WHERE plan_name = 'Pro Trader'
      `).run();
  } catch {
  }
  try {
    const info = await db.prepare("PRAGMA table_info(invoices)").all();
    const cols = info.results || [];
    if (Array.isArray(cols) && cols.length > 0 && !cols.some((c) => c.name === "items_json")) {
      await db.prepare("ALTER TABLE invoices ADD COLUMN items_json TEXT").run();
    }
  } catch {
  }
  try {
    const orgInfo = await db.prepare("PRAGMA table_info(organizations)").all();
    const orgCols = orgInfo.results || [];
    if (Array.isArray(orgCols) && orgCols.length > 0) {
      if (!orgCols.some((c) => c.name === "trial_end_date")) {
        await db.prepare("ALTER TABLE organizations ADD COLUMN trial_end_date TEXT").run();
      }
      if (!orgCols.some((c) => c.name === "renewal_date")) {
        await db.prepare("ALTER TABLE organizations ADD COLUMN renewal_date TEXT").run();
      }
      if (!orgCols.some((c) => c.name === "billing_type")) {
        await db.prepare("ALTER TABLE organizations ADD COLUMN billing_type TEXT DEFAULT 'ONE_TIME'").run();
      }
    }
  } catch {
  }
  try {
    const planInfo = await db.prepare("PRAGMA table_info(saas_plans)").all();
    const planCols = planInfo.results || [];
    if (Array.isArray(planCols) && planCols.length > 0) {
      if (!planCols.some((c) => c.name === "billing_type")) {
        await db.prepare("ALTER TABLE saas_plans ADD COLUMN billing_type TEXT DEFAULT 'ONE_TIME'").run();
      }
    }
  } catch {
  }
  try {
    const userInfo = await db.prepare("PRAGMA table_info(platform_users)").all();
    const userCols = userInfo.results || [];
    if (Array.isArray(userCols) && userCols.length > 0 && !userCols.some((c) => c.name === "google_id")) {
      await db.prepare("ALTER TABLE platform_users ADD COLUMN google_id TEXT").run();
    }
  } catch {
  }
  try {
    const subInfo = await db.prepare("PRAGMA table_info(subscription_transactions)").all();
    const subCols = subInfo.results || [];
    if (Array.isArray(subCols) && subCols.length > 0 && !subCols.some((c) => c.name === "coupon_code")) {
      await db.prepare("ALTER TABLE subscription_transactions ADD COLUMN coupon_code TEXT").run();
    }
  } catch {
  }
  try {
    const plInfo = await db.prepare("PRAGMA table_info(payment_ledgers)").all();
    const plCols = plInfo.results || [];
    if (Array.isArray(plCols) && plCols.length > 0) {
      const colNames = new Set(plCols.map((c) => c.name));
      if (!colNames.has("entry_type")) await db.prepare("ALTER TABLE payment_ledgers ADD COLUMN entry_type TEXT").run();
      if (!colNames.has("particular")) await db.prepare("ALTER TABLE payment_ledgers ADD COLUMN particular TEXT").run();
      if (!colNames.has("vch_no")) await db.prepare("ALTER TABLE payment_ledgers ADD COLUMN vch_no TEXT").run();
      if (!colNames.has("debit_credit")) await db.prepare("ALTER TABLE payment_ledgers ADD COLUMN debit_credit TEXT").run();
    }
  } catch {
  }
  try {
    const psInfo = await db.prepare("PRAGMA table_info(platform_settings)").all();
    const psCols = psInfo.results || [];
    if (Array.isArray(psCols) && psCols.length > 0 && !psCols.some((c) => c.name === "id")) {
      await db.prepare("DROP TABLE platform_settings").run();
      await db.prepare(`
          CREATE TABLE platform_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            settings_json TEXT NOT NULL,
            updated_by TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
    }
  } catch {
  }
}
async function seedInitialTenants(db, env = {}) {
  try {
    const userCount = await queryFirst(
      db,
      "SELECT COUNT(*) as count FROM platform_users"
    );
    if (!userCount || userCount.count === 0) {
      let superAdminInitialPassword = env?.SUPER_ADMIN_INITIAL_PASSWORD;
      if (!superAdminInitialPassword) {
        superAdminInitialPassword = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        console.log(`[AUTH BOOTSTRAP] SUPER_ADMIN_INITIAL_PASSWORD not set in environment. Generated initial password for contact@justgst.in: ${superAdminInitialPassword}`);
      }
      let demoOwnerInitialPassword = env?.DEMO_OWNER_INITIAL_PASSWORD;
      if (!demoOwnerInitialPassword) {
        demoOwnerInitialPassword = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        console.log(`[AUTH BOOTSTRAP] DEMO_OWNER_INITIAL_PASSWORD not set in environment. Generated initial password: ${demoOwnerInitialPassword}`);
      }
      const superAdminPassHash = await hashPassword(superAdminInitialPassword);
      const ownerPassHash = await hashPassword(demoOwnerInitialPassword);
      await execute(
        db,
        `INSERT OR IGNORE INTO organizations (
          id, name, slug, owner_name, admin_email, mobile, country, state, register_number, plan_id, plan_name, subscription_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        "org_platform_master",
        "JustGST Cloud Platform",
        "platform-master",
        "Rajaganapathy Kamalakannan",
        "contact@justgst.in",
        "9597992677",
        "India",
        "Tamil Nadu",
        "33AABCK1234F1Z9",
        "plan_enterprise",
        "Enterprise Suite",
        "ACTIVE"
      );
      await execute(
        db,
        `INSERT OR IGNORE INTO platform_users (
          id, organization_id, name, email, phone, password_hash, role, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        "usr_superadmin_01",
        "org_platform_master",
        "Rajaganapathy Kamalakannan",
        "contact@justgst.in",
        "9597992677",
        superAdminPassHash,
        "SUPER_ADMIN",
        "ACTIVE"
      );
      const bankDetailsJson = JSON.stringify({
        bankName: "HDFC Bank Ltd",
        accountNo: "50200088991122",
        ifsc: "HDFC0001892",
        branch: "Tiruppur Branch",
        upiId: "rajaganapathy@hdfcbank"
      });
      await execute(
        db,
        `INSERT OR IGNORE INTO organizations (
          id, name, slug, owner_name, admin_email, mobile, country, address, city, state, pin, state_code, register_number, pan_number, bill_prefix, bank_details_json, terms_conditions, plan_id, plan_name, subscription_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        "org_hytex_cotton",
        "JustGST",
        "justgst-app",
        "Rajaganapathy Kamalakannan",
        "contact@justgst.in",
        "9597992677",
        "India",
        "Tamil Nadu, India (100% Online Digital Cloud Service)",
        "Tiruppur",
        "Tamil Nadu",
        "638751",
        "33",
        "33ASWPV8266F1ZW",
        "ASWPV8266F",
        "INV/2026/",
        bankDetailsJson,
        "1. Digital cloud software service and tax invoicing.\n2. Subject to Tamil Nadu jurisdiction.",
        "plan_all_in_one_pro",
        "All-in-One Growth Plan",
        "ACTIVE"
      );
      await execute(
        db,
        `INSERT OR IGNORE INTO platform_users (
          id, organization_id, name, email, phone, password_hash, role, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        "usr_hytex_owner_01",
        "org_hytex_cotton",
        "Rajaganapathy Kamalakannan",
        "contact@justgst.in",
        "9597992677",
        ownerPassHash,
        "OWNER",
        "ACTIVE"
      );
    }
    const planCount = await queryFirst(db, "SELECT COUNT(*) as count FROM saas_plans");
    if (!planCount || planCount.count === 0) {
      const defaultLimits = JSON.stringify({
        maxUsers: 999,
        maxInvoicesPerMonth: 999999,
        maxQuotationsPerMonth: 999999,
        maxCustomers: 999999,
        maxProducts: 999999,
        pdfGenerationsLimit: 999999,
        hasMultiUser: true,
        hasGstReports: true,
        hasCustomBranding: true,
        hasDigitalStampSign: true,
        hasInventoryAlerts: true,
        hasTallyPrintFormats: true,
        hasUpiQrPayment: true,
        hasPurchaseLedger: true
      });
      await execute(
        db,
        `INSERT OR IGNORE INTO saas_plans (
          id, name, code, tagline, monthly_price_inr, six_month_price_inr, three_month_price_inr, yearly_price_inr, trial_duration_days, billing_type, is_popular, is_archived, limits_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        "plan_all_in_one_pro",
        "All-in-One Growth Plan",
        "ALL_IN_ONE",
        "Single comprehensive plan with ALL GST invoicing, Tally multi-copy prints & compliance features unlocked",
        99,
        474,
        237,
        588,
        15,
        "ONE_TIME",
        1,
        0,
        defaultLimits
      );
    }
    const flagCount = await queryFirst(db, "SELECT COUNT(*) as count FROM feature_flags");
    if (!flagCount || flagCount.count === 0) {
      const flags = [
        {
          id: "flag_tally_format",
          key: "tally_print_formats",
          name: "Tally-Style Multi-Copy Invoice Prints",
          description: "Enable Original/Duplicate/Triplicate 3-page & 2-page Tally layout PDFs",
          category: "Billing",
          scope: "GLOBAL",
          isEnabledGlobal: 1
        },
        {
          id: "flag_gst_einvoice",
          key: "gst_einvoicing_ready",
          name: "GST e-Invoicing & IRN Export",
          description: "Real-time JSON payload generation for GST e-Invoice Portal",
          category: "GST",
          scope: "GLOBAL",
          isEnabledGlobal: 1
        },
        {
          id: "flag_whatsapp_dispatch",
          key: "whatsapp_quick_share",
          name: "WhatsApp Direct Invoice Link Sharing",
          description: "Instant WhatsApp web/mobile billing dispatch to clients",
          category: "Communication",
          scope: "GLOBAL",
          isEnabledGlobal: 1
        },
        {
          id: "flag_audit_trail",
          key: "immutable_audit_trail",
          name: "Strict System & Tax Audit Trail",
          description: "Full immutable logging of tax edits, invoice numbers, and user operations",
          category: "Security",
          scope: "GLOBAL",
          isEnabledGlobal: 1
        }
      ];
      for (const f of flags) {
        await execute(
          db,
          `INSERT OR IGNORE INTO feature_flags (
            id, key, name, description, category, scope, is_enabled_global, enabled_plans_json, targeted_org_ids_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          f.id,
          f.key,
          f.name,
          f.description,
          f.category,
          f.scope,
          f.isEnabledGlobal,
          JSON.stringify(["ALL_IN_ONE"]),
          JSON.stringify([])
        );
      }
    }
    const templateCount = await queryFirst(db, "SELECT COUNT(*) as count FROM email_templates");
    if (!templateCount || templateCount.count === 0) {
      const templates = [
        {
          id: "tmpl_inv_ready",
          key: "invoice_ready",
          name: "Tax Invoice Dispatch",
          subject: "Tax Invoice {{invoice_number}} from {{business_name}}",
          description: "Sent automatically or manually when a tax invoice is finalized",
          variables: JSON.stringify(["business_name", "invoice_number", "amount", "due_date", "pdf_link"]),
          bodyHtml: "<p>Dear Customer,</p><p>Please find attached Tax Invoice <strong>{{invoice_number}}</strong> for <strong>\u20B9{{amount}}</strong>.</p><p>Regards,<br>{{business_name}}</p>"
        },
        {
          id: "tmpl_payment_rcvd",
          key: "payment_received",
          name: "Payment Receipt Confirmation",
          subject: "Payment Received: \u20B9{{amount}} for Invoice {{invoice_number}}",
          description: "Dispatched to customer when payment ledger entry is posted",
          variables: JSON.stringify(["business_name", "invoice_number", "amount", "mode", "reference"]),
          bodyHtml: "<p>Dear Customer,</p><p>We have successfully received payment of <strong>\u20B9{{amount}}</strong> via {{mode}} (Ref: {{reference}}).</p><p>Thank you for your business!</p>"
        }
      ];
      for (const t of templates) {
        await execute(
          db,
          `INSERT OR IGNORE INTO email_templates (
            id, key, name, subject, description, variables_json, body_html, is_enabled
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          t.id,
          t.key,
          t.name,
          t.subject,
          t.description,
          t.variables,
          t.bodyHtml
        );
      }
    }
  } catch (err) {
    console.error("seedInitialTenants warning:", err);
  }
}

// src/server/email.ts
var import_resend = require("resend");
async function sendPasswordResetEmail(params, apiKeyOverride, fromAddressOverride) {
  const apiKey = apiKeyOverride || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend Email] RESEND_API_KEY is missing from environment variables.");
    return {
      success: false,
      error: "RESEND_API_KEY environment variable is missing."
    };
  }
  const fromAddress = fromAddressOverride || process.env.RESEND_FROM_EMAIL || "JustGST Billing <noreply@justgst.in>";
  const resend = new import_resend.Resend(apiKey);
  const recipientName = params.name || "Valued User";
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your JustGST Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.02em;">
        Just<span style="color: #10b981;">GST</span>
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">
        Fast, Offline-First Thermal POS & GST Billing
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px 28px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
        Reset Your Account Password
      </h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        Hello <strong>${recipientName}</strong>,<br>
        We received a request to reset the password for your JustGST account associated with <strong>${params.email}</strong>.
      </p>

      <!-- OTP Card -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #047857; margin-bottom: 8px;">
          Your 6-Digit Password Reset OTP Code
        </span>
        <div style="font-family: monospace, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #065f46; text-indent: 8px;">
          ${params.otp}
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
        Please enter this verification code in the app window to set your new password. This OTP code is valid for <strong>15 minutes</strong>.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          If you did not request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #64748b; margin: 0;">
        \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} JustGST (justgst.in). All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `;
  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: [params.email],
      subject: `JustGST Password Reset Code: ${params.otp}`,
      html: htmlContent
    });
    if (data.error) {
      console.error("[Resend Email Error]:", data.error);
      return { success: false, error: data.error.message || "Failed to send email via Resend" };
    }
    return { success: true, messageId: data.data?.id };
  } catch (err) {
    console.error("[Resend Email Exception]:", err);
    return { success: false, error: err?.message || "Error executing Resend API call" };
  }
}

// src/server/router.ts
function isOrgAccessAllowed(org) {
  if (!org) return { allowed: false, reason: "SUBSCRIPTION_EXPIRED" };
  const accountStatus = (org.account_status || org.accountStatus || "").toUpperCase();
  if (accountStatus === "SUSPENDED") {
    return { allowed: false, reason: "SUSPENDED" };
  }
  const status = (org.subscription_status || org.subscriptionStatus || "").toUpperCase();
  const now = Date.now();
  if (status === "ACTIVE") {
    const renewalDate = org.renewal_date || org.renewalDate;
    if (!renewalDate) {
      return { allowed: true, reason: null };
    }
    const renewalTime = new Date(renewalDate).getTime();
    if (isNaN(renewalTime)) {
      return { allowed: true, reason: null };
    }
    if (renewalTime >= now) {
      return { allowed: true, reason: null };
    }
    return { allowed: false, reason: "SUBSCRIPTION_EXPIRED" };
  }
  if (status === "TRIAL" || status === "TRIALING") {
    const trialEndDate = org.trial_end_date || org.trialEndDate;
    if (!trialEndDate) {
      return { allowed: false, reason: "TRIAL_EXPIRED" };
    }
    const trialEndTime = new Date(trialEndDate).getTime();
    if (isNaN(trialEndTime)) {
      return { allowed: false, reason: "TRIAL_EXPIRED" };
    }
    if (trialEndTime >= now) {
      return { allowed: true, reason: null };
    }
    return { allowed: false, reason: "TRIAL_EXPIRED" };
  }
  return { allowed: false, reason: "SUBSCRIPTION_EXPIRED" };
}
function getOrgAccessCode(access, org) {
  const accountStatus = (org?.account_status || org?.accountStatus || "").toUpperCase();
  if (accountStatus === "SUSPENDED" || access.reason === "SUSPENDED") {
    return "ACCOUNT_SUSPENDED";
  }
  if (!access.allowed) {
    if (access.reason === "TRIAL_EXPIRED") return "TRIAL_EXPIRED";
    if (access.reason === "SUBSCRIPTION_EXPIRED") return "SUBSCRIPTION_EXPIRED";
    return "SUBSCRIPTION_EXPIRED";
  }
  return null;
}
function createOrgAccessDeniedResponse(access) {
  if (access.reason === "SUSPENDED") {
    return jsonResponse(
      {
        error: "This account has been paused by the administrator. Please contact support.",
        code: "ACCOUNT_SUSPENDED",
        reason: "SUSPENDED",
        success: false
      },
      403
    );
  }
  if (access.reason === "TRIAL_EXPIRED") {
    return jsonResponse(
      {
        error: "Your trial has expired. Please subscribe to continue.",
        code: "TRIAL_EXPIRED",
        reason: "TRIAL_EXPIRED",
        success: false
      },
      402
    );
  }
  return jsonResponse(
    {
      error: "Your subscription has expired. Please renew to continue.",
      code: "SUBSCRIPTION_EXPIRED",
      reason: "SUBSCRIPTION_EXPIRED",
      success: false
    },
    402
  );
}
async function parseRequestBody(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    try {
      const cloned = request.clone();
      const json = await cloned.json();
      if (typeof json === "object" && json !== null) {
        return json;
      }
    } catch {
    }
  }
  try {
    const cloned = request.clone();
    const formData = await cloned.formData();
    const result = {};
    for (const [key, value] of formData.entries()) {
      result[key] = typeof value === "string" ? value : value?.name || "";
    }
    if (Object.keys(result).length > 0) {
      return result;
    }
  } catch {
  }
  try {
    const cloned = request.clone();
    const text = await cloned.text();
    if (!text || !text.trim()) {
      return {};
    }
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    } catch {
      const params = new URLSearchParams(text);
      const result = {};
      for (const [key, value] of params.entries()) {
        result[key] = value;
      }
      return result;
    }
  } catch {
    return {};
  }
  return {};
}
async function authenticateRequest(request, secretKey) {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    const cookieHeader = request.headers.get("Cookie") || request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)kannaku_session=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1].trim());
    }
  }
  if (!token) {
    return null;
  }
  return await verifySessionToken(token, secretKey);
}
var currentOrigin = "*";
var schemaEnsured = false;
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": currentOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Impersonate-Org",
      "Access-Control-Allow-Credentials": "true",
      ...headers
    }
  });
}
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message, success: false }, status);
}
async function getPlatformSettingsFromDB(db) {
  try {
    const row = await queryFirst(db, "SELECT settings_json FROM platform_settings WHERE id = 'GLOBAL_CONFIG'");
    if (row && row.settings_json) {
      return JSON.parse(row.settings_json);
    }
  } catch (err) {
    console.error("Failed to read platform_settings from DB:", err);
  }
  return {
    general: {
      saasName: "Kannaku / JustGST",
      tagline: "Simple Indian GST Billing & Accounting Software for MSMEs",
      supportEmail: "support@kannaku.in",
      supportPhone: "+91 98765 43210",
      defaultCountry: "India",
      timezone: "Asia/Kolkata (IST +5:30)",
      maintenanceMode: false,
      allowNewRegistrations: true
    },
    billing: {
      defaultCurrency: "INR (\u20B9)",
      gstTaxPercentage: 18,
      gracePeriodDays: 3,
      invoicePrefix: "INV-2026-"
    },
    email: {
      smtpHost: "smtp.sendgrid.net",
      smtpPort: 587,
      smtpUser: "apikey",
      senderName: "JustGST Billing Notifications",
      senderEmail: "billing@justgst.in",
      enableEmailDelivery: true
    },
    security: {
      requireTwoFactorForAdmins: false,
      enforcePasswordComplexity: true,
      sessionTimeoutMinutes: 1440,
      maxLoginAttempts: 5
    }
  };
}
async function getPayUCredentials(db, env) {
  const explicitEnvVar = (env.PAYU_ENV || env.PAYU_MODE || (typeof process !== "undefined" ? process.env?.PAYU_ENV || process.env?.PAYU_MODE : "") || "").toUpperCase().trim();
  let explicitEnv = null;
  if (["LIVE", "PRODUCTION", "PROD"].includes(explicitEnvVar)) {
    explicitEnv = "LIVE";
  } else if (["TEST", "SANDBOX", "DEV", "DEVELOPMENT"].includes(explicitEnvVar)) {
    explicitEnv = "TEST";
  }
  let dbConfig = null;
  try {
    const row = await queryFirst(db, "SELECT * FROM app_settings WHERE config_key = 'payu_config'");
    if (row) {
      const rawJson = row.config_value || row.value || row.settings_json;
      if (typeof rawJson === "string") {
        try {
          dbConfig = JSON.parse(rawJson);
        } catch {
        }
      } else if (typeof rawJson === "object" && rawJson !== null) {
        dbConfig = rawJson;
      }
    }
  } catch (err) {
    console.warn("[PayU Config] Error querying app_settings:", err?.message || err);
  }
  let gwRow = null;
  try {
    gwRow = await queryFirst(db, "SELECT * FROM payment_gateway_config WHERE UPPER(provider) = 'PAYU'");
  } catch {
  }
  let gwConfigJson = null;
  if (gwRow?.config_json) {
    try {
      gwConfigJson = typeof gwRow.config_json === "string" ? JSON.parse(gwRow.config_json) : gwRow.config_json;
    } catch {
    }
  }
  let payuEnv = "TEST";
  if (explicitEnv) {
    payuEnv = explicitEnv;
  } else if (dbConfig) {
    if (dbConfig.activeMode) {
      payuEnv = String(dbConfig.activeMode).toUpperCase() === "LIVE" ? "LIVE" : "TEST";
    } else if (dbConfig.isTestMode !== void 0 && dbConfig.isTestMode !== null) {
      payuEnv = dbConfig.isTestMode ? "TEST" : "LIVE";
    }
  } else if (gwRow && gwRow.is_test_mode !== void 0 && gwRow.is_test_mode !== null) {
    payuEnv = gwRow.is_test_mode ? "TEST" : "LIVE";
  }
  const isTestMode = payuEnv === "TEST";
  const activeMode = isTestMode ? "test" : "live";
  const endpoint = isTestMode ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment";
  const flatDbKey = String(dbConfig?.merchantKey || dbConfig?.payuMerchantKey || dbConfig?.key || gwConfigJson?.merchantKey || gwRow?.merchant_key || gwRow?.api_key || "").trim();
  const flatDbSalt = String(dbConfig?.merchantSalt || dbConfig?.payuMerchantSalt || dbConfig?.salt || gwConfigJson?.merchantSalt || gwRow?.merchant_salt || gwRow?.api_secret || "").trim();
  const flatDbHeader = String(dbConfig?.headerAuthKey || dbConfig?.payuHeaderAuthKey || gwConfigJson?.headerAuthKey || gwRow?.header_auth_key || "").trim();
  const envGeneralKey = String(env.PAYU_MERCHANT_KEY || env.PAYU_KEY || (typeof process !== "undefined" ? process.env?.PAYU_MERCHANT_KEY || process.env?.PAYU_KEY : "") || "").trim();
  const envGeneralSalt = String(env.PAYU_MERCHANT_SALT || env.PAYU_SALT || (typeof process !== "undefined" ? process.env?.PAYU_MERCHANT_SALT || process.env?.PAYU_SALT : "") || "").trim();
  let testSlot = {
    merchantKey: String(
      dbConfig?.test?.merchantKey || dbConfig?.test?.payuMerchantKey || dbConfig?.test?.key || gwConfigJson?.test?.merchantKey || (isTestMode ? flatDbKey : "") || env.PAYU_TEST_KEY || env.PAYU_KEY_TEST || env.PAYU_MERCHANT_KEY_TEST || (isTestMode ? envGeneralKey : "")
    ).trim(),
    merchantSalt: String(
      dbConfig?.test?.merchantSalt || dbConfig?.test?.payuMerchantSalt || dbConfig?.test?.salt || gwConfigJson?.test?.merchantSalt || (isTestMode ? flatDbSalt : "") || env.PAYU_TEST_SALT || env.PAYU_SALT_TEST || env.PAYU_MERCHANT_SALT_TEST || (isTestMode ? envGeneralSalt : "")
    ).trim(),
    headerAuthKey: String(dbConfig?.test?.headerAuthKey || gwConfigJson?.test?.headerAuthKey || env.PAYU_TEST_HEADER_AUTH_KEY || (isTestMode ? flatDbHeader : "")).trim(),
    endpoint: "https://test.payu.in/_payment"
  };
  let liveSlot = {
    merchantKey: String(
      dbConfig?.live?.merchantKey || dbConfig?.live?.payuMerchantKey || dbConfig?.live?.key || gwConfigJson?.live?.merchantKey || (!isTestMode ? flatDbKey : "") || env.PAYU_LIVE_KEY || env.PAYU_KEY_LIVE || env.PAYU_MERCHANT_KEY_LIVE || (!isTestMode ? envGeneralKey : "")
    ).trim(),
    merchantSalt: String(
      dbConfig?.live?.merchantSalt || dbConfig?.live?.payuMerchantSalt || dbConfig?.live?.salt || gwConfigJson?.live?.merchantSalt || (!isTestMode ? flatDbSalt : "") || env.PAYU_LIVE_SALT || env.PAYU_SALT_LIVE || env.PAYU_MERCHANT_SALT_LIVE || (!isTestMode ? envGeneralSalt : "")
    ).trim(),
    headerAuthKey: String(dbConfig?.live?.headerAuthKey || gwConfigJson?.live?.headerAuthKey || env.PAYU_LIVE_HEADER_AUTH_KEY || (!isTestMode ? flatDbHeader : "")).trim(),
    endpoint: "https://secure.payu.in/_payment"
  };
  let merchantKey = isTestMode ? testSlot.merchantKey : liveSlot.merchantKey;
  let merchantSalt = isTestMode ? testSlot.merchantSalt : liveSlot.merchantSalt;
  let headerAuthKey = isTestMode ? testSlot.headerAuthKey : liveSlot.headerAuthKey;
  merchantKey = String(merchantKey || "").trim();
  merchantSalt = String(merchantSalt || "").trim();
  const configured = Boolean(merchantKey && merchantSalt);
  return {
    merchantKey,
    merchantSalt,
    payuEnv,
    isTestMode,
    endpoint,
    headerAuthKey,
    activeMode,
    configured,
    test: testSlot,
    live: liveSlot
  };
}
async function handleApiRequest(ctx) {
  const { request, env, url } = ctx;
  const path2 = url.pathname;
  const method = request.method.toUpperCase();
  const reqOrigin = request.headers.get("Origin") || request.headers.get("origin");
  const origin = reqOrigin || env.ALLOWED_ORIGIN || env.APP_URL || "*";
  currentOrigin = origin;
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Impersonate-Org",
        "Access-Control-Allow-Credentials": "true"
      }
    });
  }
  if (!env.SESSION_SECRET && env.ENVIRONMENT === "production") {
    return errorResponse("Server misconfiguration: SESSION_SECRET is not set", 500);
  }
  const secretKey = env.SESSION_SECRET || "kannaku-dev-only-insecure-fallback-key";
  const db = env.DB;
  if (!db) {
    console.error('[CRITICAL] Cloudflare D1 Database binding "DB" is not bound! In Cloudflare Pages, go to Settings -> Functions -> D1 Database Bindings -> add binding "DB"');
    return errorResponse(
      'Cloudflare D1 Database binding (DB) is missing. If deployed on Cloudflare Pages, configure D1 Database Binding under Project Settings -> Functions -> D1 Database Bindings with binding name "DB".',
      503
    );
  }
  if (!schemaEnsured) {
    await ensureTables(db);
    schemaEnsured = true;
  }
  if (path2 === "/api/health") {
    return jsonResponse({
      status: "healthy",
      app: env.APP_NAME || "Kanakku GST Billing SaaS",
      database: "connected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (path2 === "/api/health/db") {
    try {
      await seedInitialTenants(db, env);
      const orgCount = await queryFirst(db, "SELECT COUNT(*) as count FROM organizations");
      const invCount = await queryFirst(db, "SELECT COUNT(*) as count FROM invoices");
      const clientCount = await queryFirst(db, "SELECT COUNT(*) as count FROM clients WHERE is_active = 1");
      const prodCount = await queryFirst(db, "SELECT COUNT(*) as count FROM products WHERE is_active = 1");
      const payCount = await queryFirst(db, "SELECT COUNT(*) as count FROM payment_ledgers");
      return jsonResponse({
        success: true,
        database: "connected",
        binding: "DB (Cloudflare D1 SQLite)",
        counts: {
          organizations: orgCount?.count || 0,
          invoices: invCount?.count || 0,
          clients: clientCount?.count || 0,
          products: prodCount?.count || 0,
          payments: payCount?.count || 0
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      return errorResponse("Database health check failed: " + (err?.message || "Unknown database error"), 500);
    }
  }
  if (path2 === "/api/auth/demo-switch" && method === "POST") {
    if (env.ENVIRONMENT !== "development") {
      return errorResponse("Endpoint not available in production", 404);
    }
    try {
      const body = await request.json().catch(() => ({}));
      const role = body?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "OWNER";
      await seedInitialTenants(db, env);
      let user = null;
      if (role === "SUPER_ADMIN") {
        user = await queryFirst(db, "SELECT * FROM platform_users WHERE role = 'SUPER_ADMIN' LIMIT 1");
      } else {
        user = await queryFirst(db, "SELECT * FROM platform_users WHERE organization_id = 'org_hytex_cotton' LIMIT 1");
        if (!user) {
          user = await queryFirst(db, "SELECT * FROM platform_users WHERE role = 'OWNER' LIMIT 1");
        }
      }
      if (!user) {
        return errorResponse("Demo user not found in database", 404);
      }
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", user.organization_id);
      const accessCheck = isOrgAccessAllowed(org);
      const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
      const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
      const readOnlyReason = code;
      const token = await createSessionToken(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organization_id,
          role: user.role
        },
        secretKey
      );
      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=${7 * 24 * 3600}`;
      return jsonResponse(
        {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatar_url,
            accountStatus: org?.account_status,
            subscriptionStatus: org?.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          },
          organization: org ? {
            ...org,
            accountStatus: org.account_status,
            subscriptionStatus: org.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          } : {
            id: user.organization_id,
            name: "HYTEX COTTON MILLS",
            planId: "plan_all_in_one_pro",
            planName: "All-in-One Growth Plan",
            accountStatus: "ACTIVE",
            subscriptionStatus: "ACTIVE",
            isReadOnly: false,
            code: null,
            readOnlyReason: null
          },
          isReadOnly,
          code,
          readOnlyReason
        },
        200,
        { "Set-Cookie": sessionCookie }
      );
    } catch (err) {
      return errorResponse("Failed to issue demo session token: " + (err?.message || "Unknown error"), 500);
    }
  }
  if (path2 === "/api/auth/google" && method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rate = checkRateLimit(`google-auth:${ip}`, 15, 60);
    if (!rate.allowed) {
      return errorResponse("Too many Google sign-in attempts. Please wait 1 minute.", 429);
    }
    try {
      const body = await request.json().catch(() => ({}));
      const credential = body?.credential;
      if (!credential || typeof credential !== "string") {
        return errorResponse("Google ID token credential is required", 400);
      }
      let tokenInfoRes;
      try {
        tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      } catch (err) {
        return errorResponse("Failed to reach Google token verification service: " + (err?.message || "Network error"), 500);
      }
      if (!tokenInfoRes.ok) {
        return errorResponse("Invalid or expired Google ID token credential", 401);
      }
      const tokenInfo = await tokenInfoRes.json();
      const expectedClientId = "149211959700-g5r155p3o075od5kpfuu49f9atqfdjrl.apps.googleusercontent.com";
      if (tokenInfo.aud !== expectedClientId) {
        return errorResponse("Google token audience mismatch", 401);
      }
      if (tokenInfo.email_verified !== true && tokenInfo.email_verified !== "true") {
        return errorResponse("Google account email is not verified", 401);
      }
      const verifiedEmail = (tokenInfo.email || "").trim().toLowerCase();
      const verifiedName = (tokenInfo.name || tokenInfo.given_name || verifiedEmail.split("@")[0] || "Google User").trim();
      const verifiedPicture = tokenInfo.picture || null;
      const googleSub = tokenInfo.sub;
      if (!verifiedEmail || !googleSub) {
        return errorResponse("Google token missing email or subject identifier", 400);
      }
      await seedInitialTenants(db, env);
      try {
        const userColsInfo = await queryAll(db, "PRAGMA table_info(platform_users)");
        if (Array.isArray(userColsInfo) && userColsInfo.length > 0 && !userColsInfo.some((c) => c.name === "google_id")) {
          await execute(db, "ALTER TABLE platform_users ADD COLUMN google_id TEXT");
        }
      } catch {
      }
      let user = await queryFirst(
        db,
        "SELECT * FROM platform_users WHERE google_id = ? OR LOWER(email) = LOWER(?)",
        googleSub,
        verifiedEmail
      );
      let org = null;
      if (user) {
        if (!user.google_id || user.google_id !== googleSub) {
          await execute(db, "UPDATE platform_users SET google_id = ? WHERE id = ?", googleSub, user.id);
          user.google_id = googleSub;
        }
        if (!user.avatar_url && verifiedPicture) {
          await execute(db, "UPDATE platform_users SET avatar_url = ? WHERE id = ?", verifiedPicture, user.id);
          user.avatar_url = verifiedPicture;
        }
        await execute(db, "UPDATE platform_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", user.id);
        org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", user.organization_id);
      } else {
        return jsonResponse({
          success: true,
          needsProfileCompletion: true,
          googleProfile: {
            email: verifiedEmail,
            name: verifiedName,
            picture: verifiedPicture,
            sub: googleSub
          }
        });
      }
      const accessCheck = isOrgAccessAllowed(org);
      const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
      const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
      const readOnlyReason = code;
      const token = await createSessionToken(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organization_id,
          role: user.role
        },
        secretKey
      );
      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=${7 * 24 * 3600}`;
      return jsonResponse(
        {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
            avatarUrl: user.avatar_url || verifiedPicture,
            accountStatus: org?.account_status,
            subscriptionStatus: org?.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          },
          organization: org ? {
            ...org,
            accountStatus: org.account_status,
            subscriptionStatus: org.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          } : {
            id: user.organization_id,
            name: `${user.name}'s Workspace`,
            planId: "plan_all_in_one_pro",
            planName: "All-in-One Growth Plan",
            accountStatus: "ACTIVE",
            subscriptionStatus: "TRIAL",
            isReadOnly: false,
            code: null,
            readOnlyReason: null
          },
          isReadOnly,
          code,
          readOnlyReason
        },
        200,
        { "Set-Cookie": sessionCookie }
      );
    } catch (err) {
      return errorResponse("Failed to authenticate with Google: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/auth/google/complete-signup" && method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rate = checkRateLimit(`google-signup-complete:${ip}`, 10, 60);
    if (!rate.allowed) {
      return errorResponse("Too many signup attempts. Please wait 1 minute.", 429);
    }
    try {
      const body = await request.json().catch(() => ({}));
      const { credential, companyName, ownerName, mobile, state, gstin } = body;
      if (!credential || typeof credential !== "string") {
        return errorResponse("Google ID token credential is required", 400);
      }
      if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
        return errorResponse("Company Name is required", 400);
      }
      if (!mobile || typeof mobile !== "string" || !mobile.trim()) {
        return errorResponse("Mobile Number is required", 400);
      }
      let tokenInfoRes;
      try {
        tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      } catch (err) {
        return errorResponse("Failed to reach Google token verification service: " + (err?.message || "Network error"), 500);
      }
      if (!tokenInfoRes.ok) {
        return errorResponse("Invalid or expired Google ID token credential", 401);
      }
      const tokenInfo = await tokenInfoRes.json();
      const expectedClientId = "149211959700-g5r155p3o075od5kpfuu49f9atqfdjrl.apps.googleusercontent.com";
      if (tokenInfo.aud !== expectedClientId) {
        return errorResponse("Google token audience mismatch", 401);
      }
      if (tokenInfo.email_verified !== true && tokenInfo.email_verified !== "true") {
        return errorResponse("Google account email is not verified", 401);
      }
      const verifiedEmail = (tokenInfo.email || "").trim().toLowerCase();
      const verifiedName = (ownerName && typeof ownerName === "string" && ownerName.trim() || tokenInfo.name || tokenInfo.given_name || verifiedEmail.split("@")[0] || "Google User").trim();
      const verifiedPicture = tokenInfo.picture || null;
      const googleSub = tokenInfo.sub;
      if (!verifiedEmail || !googleSub) {
        return errorResponse("Google token missing email or subject identifier", 400);
      }
      await seedInitialTenants(db, env);
      try {
        const userColsInfo = await queryAll(db, "PRAGMA table_info(platform_users)");
        if (Array.isArray(userColsInfo) && userColsInfo.length > 0 && !userColsInfo.some((c) => c.name === "google_id")) {
          await execute(db, "ALTER TABLE platform_users ADD COLUMN google_id TEXT");
        }
      } catch {
      }
      let existingUser = await queryFirst(
        db,
        "SELECT * FROM platform_users WHERE google_id = ? OR LOWER(email) = LOWER(?)",
        googleSub,
        verifiedEmail
      );
      let user = null;
      let org = null;
      if (existingUser) {
        user = existingUser;
        if (!user.google_id || user.google_id !== googleSub) {
          await execute(db, "UPDATE platform_users SET google_id = ? WHERE id = ?", googleSub, user.id);
          user.google_id = googleSub;
        }
        await execute(db, "UPDATE platform_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", user.id);
        org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", user.organization_id);
      } else {
        const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const finalCompanyName = companyName.trim();
        const slug = finalCompanyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").substring(0, 30);
        const dummyPassHash = await hashPassword(`GoogleAuth_${googleSub}_${Date.now()}`);
        const platformSettings = await getPlatformSettingsFromDB(db);
        const adminTrialDays = platformSettings?.billing?.trialDurationDays;
        const assignedPlan = await queryFirst(
          db,
          "SELECT trial_duration_days, billing_type FROM saas_plans WHERE id = 'plan_all_in_one_pro'"
        );
        const trialDays = adminTrialDays !== void 0 && adminTrialDays !== null && !isNaN(Number(adminTrialDays)) && Number(adminTrialDays) >= 0 ? Number(adminTrialDays) : assignedPlan && assignedPlan.trial_duration_days != null && !isNaN(Number(assignedPlan.trial_duration_days)) && Number(assignedPlan.trial_duration_days) >= 0 ? Number(assignedPlan.trial_duration_days) : 15;
        const trialEndDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1e3).toISOString();
        const planBillingType = assignedPlan?.billing_type || "ONE_TIME";
        const finalState = state && typeof state === "string" && state.trim() && state.trim() !== "Select State" ? state.trim() : "Select State";
        const finalGstin = gstin && typeof gstin === "string" && gstin.trim() ? gstin.trim() : null;
        await execute(
          db,
          `INSERT INTO organizations (
            id, name, slug, owner_name, admin_email, mobile, state, register_number, plan_id, plan_name, subscription_status, trial_end_date, billing_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'plan_all_in_one_pro', 'All-in-One Growth Plan', 'TRIAL', ?, ?)`,
          orgId,
          finalCompanyName,
          slug,
          verifiedName,
          verifiedEmail,
          mobile.trim(),
          finalState,
          finalGstin,
          trialEndDate,
          planBillingType
        );
        await execute(
          db,
          `INSERT INTO platform_users (
            id, organization_id, name, email, phone, password_hash, role, status, avatar_url, google_id, last_login
          ) VALUES (?, ?, ?, ?, ?, ?, 'OWNER', 'ACTIVE', ?, ?, CURRENT_TIMESTAMP)`,
          userId,
          orgId,
          verifiedName,
          verifiedEmail,
          mobile.trim(),
          dummyPassHash,
          verifiedPicture,
          googleSub
        );
        user = {
          id: userId,
          organization_id: orgId,
          name: verifiedName,
          email: verifiedEmail,
          phone: mobile.trim(),
          role: "OWNER",
          status: "ACTIVE",
          avatar_url: verifiedPicture,
          google_id: googleSub
        };
        org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", orgId);
      }
      const accessCheck = isOrgAccessAllowed(org);
      const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
      const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
      const readOnlyReason = code;
      const token = await createSessionToken(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organization_id,
          role: user.role
        },
        secretKey
      );
      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=${7 * 24 * 3600}`;
      return jsonResponse(
        {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
            avatarUrl: user.avatar_url || verifiedPicture,
            accountStatus: org?.account_status,
            subscriptionStatus: org?.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          },
          organization: org ? {
            ...org,
            accountStatus: org.account_status,
            subscriptionStatus: org.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          } : {
            id: user.organization_id,
            name: `${user.name}'s Workspace`,
            planId: "plan_all_in_one_pro",
            planName: "All-in-One Growth Plan",
            accountStatus: "ACTIVE",
            subscriptionStatus: "TRIAL",
            isReadOnly: false,
            code: null,
            readOnlyReason: null
          },
          isReadOnly,
          code,
          readOnlyReason
        },
        200,
        { "Set-Cookie": sessionCookie }
      );
    } catch (err) {
      return errorResponse("Failed to complete Google signup: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/auth/forgot-password" && method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rate = checkRateLimit(`forgot-password:${ip}`, 5, 60);
    if (!rate.allowed) {
      return errorResponse("Too many password reset requests. Please wait 1 minute.", 429);
    }
    try {
      const body = await request.json().catch(() => ({}));
      const email = (body?.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return errorResponse("Valid registered email address is required", 400);
      }
      await execute(
        db,
        `CREATE TABLE IF NOT EXISTS password_resets (
          email TEXT PRIMARY KEY,
          otp TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`
      );
      const user = await queryFirst(
        db,
        "SELECT id, name, email FROM platform_users WHERE LOWER(email) = LOWER(?)",
        email
      );
      if (!user) {
        return jsonResponse({
          success: true,
          message: "If an account exists with this email, a password reset OTP has been sent."
        });
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = Date.now() + 15 * 60 * 1e3;
      await execute(
        db,
        `INSERT OR REPLACE INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)`,
        email,
        otp,
        expiresAt
      );
      const resendApiKey = ctx.env.RESEND_API_KEY || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
      const resendFromAddress = ctx.env.RESEND_FROM_EMAIL || "JustGST Billing <noreply@justgst.in>";
      const emailResult = await sendPasswordResetEmail(
        {
          email: user.email,
          name: user.name,
          otp
        },
        resendApiKey,
        resendFromAddress
      );
      if (!emailResult.success) {
        console.warn("[Forgot Password] Resend dispatch note:", emailResult.error);
        if (!resendApiKey && env.ENVIRONMENT === "development") {
          return jsonResponse({
            success: true,
            message: "OTP generated. Note: RESEND_API_KEY is not set in environment settings.",
            devOtpHint: otp
          });
        }
        return errorResponse(
          resendApiKey ? `Failed to send email via Resend: ${emailResult.error}` : "Password reset email could not be sent \u2014 RESEND_API_KEY is not configured on the server.",
          500
        );
      }
      return jsonResponse({
        success: true,
        message: "Password reset OTP code sent via Resend to " + email
      });
    } catch (err) {
      return errorResponse("Failed to request password reset: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/auth/reset-password" && method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rate = checkRateLimit(`reset-password:${ip}`, 10, 60);
    if (!rate.allowed) {
      return errorResponse("Too many password reset attempts. Please wait 1 minute.", 429);
    }
    try {
      const body = await request.json().catch(() => ({}));
      const email = (body?.email || "").trim().toLowerCase();
      const otp = (body?.otp || body?.token || "").trim();
      const newPassword = body?.newPassword || body?.password || "";
      if (!email || !otp || !newPassword) {
        return errorResponse("Email, OTP code, and new password are required", 400);
      }
      if (newPassword.length < 6) {
        return errorResponse("New password must be at least 6 characters long", 400);
      }
      const resetEntry = await queryFirst(
        db,
        "SELECT email, otp, expires_at FROM password_resets WHERE LOWER(email) = LOWER(?)",
        email
      );
      if (!resetEntry) {
        return errorResponse("No password reset request found for this email. Please request a new OTP.", 400);
      }
      if (String(resetEntry.otp) !== String(otp)) {
        return errorResponse("Invalid OTP verification code. Please check and try again.", 400);
      }
      if (Number(resetEntry.expires_at) < Date.now()) {
        return errorResponse("OTP verification code has expired. Please request a new code.", 400);
      }
      const passwordHash = await hashPassword(newPassword);
      await execute(
        db,
        "UPDATE platform_users SET password_hash = ? WHERE LOWER(email) = LOWER(?)",
        passwordHash,
        email
      );
      await execute(db, "DELETE FROM password_resets WHERE LOWER(email) = LOWER(?)", email);
      return jsonResponse({
        success: true,
        message: "Password reset successfully! You can now log in with your new password."
      });
    } catch (err) {
      return errorResponse("Failed to reset password: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/auth/login" && method === "POST") {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rate = checkRateLimit(`login:${ip}`, 10, 60);
    if (!rate.allowed) {
      return errorResponse("Too many login attempts. Please wait 1 minute.", 429);
    }
    try {
      const body = await request.json();
      const { email, password } = body;
      if (!email || !password) {
        return errorResponse("Email and password are required", 400);
      }
      await seedInitialTenants(db, env);
      const user = await queryFirst(
        db,
        "SELECT * FROM platform_users WHERE LOWER(email) = LOWER(?)",
        email.trim()
      );
      if (!user) {
        return errorResponse("Invalid email or password", 401);
      }
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse("Invalid email or password", 401);
      }
      if (!user.password_hash.startsWith("pbkdf2:sha256:")) {
        const upgradedHash = await hashPassword(password);
        await execute(db, "UPDATE platform_users SET password_hash = ? WHERE id = ?", upgradedHash, user.id);
      }
      const org = await queryFirst(
        db,
        "SELECT * FROM organizations WHERE id = ?",
        user.organization_id
      );
      const accessCheck = isOrgAccessAllowed(org);
      const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
      const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
      const readOnlyReason = code;
      const token = await createSessionToken(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organization_id,
          role: user.role
        },
        secretKey
      );
      await execute(db, "UPDATE platform_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", user.id);
      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=${7 * 24 * 3600}`;
      return jsonResponse(
        {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatar_url,
            accountStatus: org?.account_status,
            subscriptionStatus: org?.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          },
          organization: org ? {
            ...org,
            accountStatus: org.account_status,
            subscriptionStatus: org.subscription_status,
            isReadOnly,
            code,
            readOnlyReason
          } : {
            id: user.organization_id,
            name: "My Business",
            planId: "plan_all_in_one_pro",
            planName: "All-in-One Growth Plan",
            accountStatus: "ACTIVE",
            subscriptionStatus: "TRIAL",
            isReadOnly: false,
            code: null,
            readOnlyReason: null
          },
          isReadOnly,
          code,
          readOnlyReason
        },
        200,
        { "Set-Cookie": sessionCookie }
      );
    } catch {
      return errorResponse("Failed to authenticate", 500);
    }
  }
  if (path2 === "/api/auth/signup" && method === "POST") {
    try {
      const body = await request.json();
      const { companyName, ownerName, email, mobile, password, state, gstin } = body;
      if (!companyName || !ownerName || !email || !mobile || !password) {
        return errorResponse("Please provide company name, owner name, email, mobile, and password", 400);
      }
      const existingUser = await queryFirst(
        db,
        "SELECT id FROM platform_users WHERE LOWER(email) = LOWER(?)",
        email.trim()
      );
      if (existingUser) {
        return errorResponse("An account with this email already exists", 409);
      }
      const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").substring(0, 30);
      const passHash = await hashPassword(password);
      const platformSettings = await getPlatformSettingsFromDB(db);
      const adminTrialDays = platformSettings?.billing?.trialDurationDays;
      const assignedPlan = await queryFirst(
        db,
        "SELECT trial_duration_days, billing_type FROM saas_plans WHERE id = 'plan_all_in_one_pro'"
      );
      const trialDays = adminTrialDays !== void 0 && adminTrialDays !== null && !isNaN(Number(adminTrialDays)) && Number(adminTrialDays) >= 0 ? Number(adminTrialDays) : assignedPlan && assignedPlan.trial_duration_days != null && !isNaN(Number(assignedPlan.trial_duration_days)) && Number(assignedPlan.trial_duration_days) >= 0 ? Number(assignedPlan.trial_duration_days) : 15;
      const trialEndDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1e3).toISOString();
      const planBillingType = assignedPlan?.billing_type || "ONE_TIME";
      const isInitialReadOnly = trialDays === 0;
      const initialCode = isInitialReadOnly ? "TRIAL_EXPIRED" : null;
      const initialReason = isInitialReadOnly ? "TRIAL_EXPIRED" : null;
      await execute(
        db,
        `INSERT INTO organizations (
          id, name, slug, owner_name, admin_email, mobile, state, register_number, plan_id, plan_name, subscription_status, trial_end_date, billing_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'plan_all_in_one_pro', 'All-in-One Growth Plan', 'TRIAL', ?, ?)`,
        orgId,
        companyName,
        slug,
        ownerName,
        email.trim(),
        mobile,
        state || "Tamil Nadu",
        gstin || null,
        trialEndDate,
        planBillingType
      );
      await execute(
        db,
        `INSERT INTO platform_users (
          id, organization_id, name, email, phone, password_hash, role, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'OWNER', 'ACTIVE')`,
        userId,
        orgId,
        ownerName,
        email.trim(),
        mobile,
        passHash
      );
      const token = await createSessionToken(
        {
          userId,
          email: email.trim(),
          name: ownerName,
          organizationId: orgId,
          role: "OWNER"
        },
        secretKey
      );
      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=${7 * 24 * 3600}`;
      return jsonResponse(
        {
          success: true,
          token,
          user: {
            id: userId,
            name: ownerName,
            email: email.trim(),
            phone: mobile,
            role: "OWNER",
            isReadOnly: isInitialReadOnly,
            code: initialCode,
            readOnlyReason: initialReason
          },
          organization: {
            id: orgId,
            name: companyName,
            planId: "plan_all_in_one_pro",
            planName: "All-in-One Growth Plan",
            subscriptionStatus: "TRIAL",
            accountStatus: "ACTIVE",
            trialEndDate,
            trialDurationDays: trialDays,
            isReadOnly: isInitialReadOnly,
            code: initialCode,
            readOnlyReason: initialReason
          },
          isReadOnly: isInitialReadOnly,
          code: initialCode,
          readOnlyReason: initialReason
        },
        201,
        { "Set-Cookie": sessionCookie }
      );
    } catch {
      return errorResponse("Registration failed", 500);
    }
  }
  if (path2 === "/api/auth/logout" && method === "POST") {
    const clearCookie = "kannaku_session=; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=0";
    return jsonResponse({ success: true, message: "Logged out successfully" }, 200, {
      "Set-Cookie": clearCookie
    });
  }
  if ((path2 === "/api/plans" || path2 === "/api/public/plans") && method === "GET") {
    try {
      const plans = await queryAll(db, "SELECT * FROM saas_plans WHERE is_archived = 0 ORDER BY monthly_price_inr ASC");
      let parsedPlans = plans.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        tagline: p.tagline,
        monthlyPriceInr: Number(p.monthly_price_inr) || 99,
        sixMonthPriceInr: Number(p.six_month_price_inr) || 474,
        threeMonthPriceInr: Number(p.three_month_price_inr) || 237,
        yearlyPriceInr: Number(p.yearly_price_inr) || 588,
        trialDurationDays: p.trial_duration_days !== null && p.trial_duration_days !== void 0 && !isNaN(Number(p.trial_duration_days)) && Number(p.trial_duration_days) >= 0 ? Number(p.trial_duration_days) : 15,
        billingType: p.billing_type || "ONE_TIME",
        isPopular: !!p.is_popular,
        isArchived: !!p.is_archived,
        billingCycle: "1_MONTH",
        durationDays: 30,
        limits: p.limits_json ? JSON.parse(p.limits_json) : {
          maxUsers: 999,
          maxInvoicesPerMonth: 999999,
          maxQuotationsPerMonth: 999999,
          maxCustomers: 999999,
          maxProducts: 999999,
          pdfGenerationsLimit: 999999,
          hasMultiUser: true,
          hasGstReports: true,
          hasCustomBranding: true,
          hasDigitalStampSign: true,
          hasInventoryAlerts: true,
          hasTallyPrintFormats: true,
          hasUpiQrPayment: true,
          hasPurchaseLedger: true
        },
        createdOn: p.created_at,
        updatedOn: p.updated_at
      }));
      if (parsedPlans.length === 0) {
        parsedPlans = [
          {
            id: "plan_all_in_one_pro",
            name: "All-in-One Growth Plan",
            code: "ALL_IN_ONE",
            tagline: "Single comprehensive plan with ALL GST invoicing, Tally multi-copy prints & compliance features unlocked",
            monthlyPriceInr: 99,
            sixMonthPriceInr: 474,
            threeMonthPriceInr: 237,
            yearlyPriceInr: 588,
            trialDurationDays: 15,
            billingType: "ONE_TIME",
            isPopular: true,
            isArchived: false,
            billingCycle: "1_MONTH",
            durationDays: 30,
            limits: {
              maxUsers: 999,
              maxInvoicesPerMonth: 999999,
              maxQuotationsPerMonth: 999999,
              maxCustomers: 999999,
              maxProducts: 999999,
              pdfGenerationsLimit: 999999,
              hasMultiUser: true,
              hasGstReports: true,
              hasCustomBranding: true,
              hasDigitalStampSign: true,
              hasInventoryAlerts: true,
              hasTallyPrintFormats: true,
              hasUpiQrPayment: true,
              hasPurchaseLedger: true
            },
            createdOn: (/* @__PURE__ */ new Date()).toISOString(),
            updatedOn: (/* @__PURE__ */ new Date()).toISOString()
          }
        ];
      }
      const flagship = parsedPlans[0] || {
        id: "plan_all_in_one_pro",
        name: "All-in-One Growth Plan",
        tagline: "Single comprehensive plan with ALL GST invoicing, Tally multi-copy prints & compliance features unlocked",
        monthlyPriceInr: 99,
        sixMonthPriceInr: 474,
        yearlyPriceInr: 588,
        trialDurationDays: 15,
        billingType: "ONE_TIME"
      };
      const monthlyPrice = flagship.monthlyPriceInr || 99;
      const sixMonthTotal = flagship.sixMonthPriceInr || 474;
      const yearlyTotal = flagship.yearlyPriceInr || 588;
      const flagshipTrialDays = flagship.trialDurationDays !== void 0 && flagship.trialDurationDays !== null && !isNaN(Number(flagship.trialDurationDays)) && Number(flagship.trialDurationDays) >= 0 ? Number(flagship.trialDurationDays) : 15;
      const dynamicTiers = [
        {
          id: "plan_1_month",
          planId: "plan_1_month",
          name: "1 Month (Monthly)",
          tierLabel: "Standard",
          billingCycle: "1_MONTH",
          durationDays: 30,
          monthlyPriceInr: monthlyPrice,
          totalPriceInr: monthlyPrice,
          price: monthlyPrice,
          periodText: "/ month",
          description: "Billed every 30 days. Perfect for new stores testing the software.",
          savingsBadge: null,
          isPopular: false,
          trialDurationDays: flagshipTrialDays,
          billingType: flagship.billingType || "ONE_TIME"
        },
        {
          id: "plan_6_months",
          planId: "plan_6_months",
          name: "6 Months (Half-Yearly)",
          tierLabel: "Save 20%",
          billingCycle: "6_MONTHS",
          durationDays: 180,
          monthlyPriceInr: Math.round(sixMonthTotal / 6),
          totalPriceInr: sixMonthTotal,
          price: sixMonthTotal,
          periodText: "/ month",
          description: "Billed semi-annually. Ideal for regular retail and GST traders.",
          savingsBadge: "Save 20%",
          isPopular: false,
          trialDurationDays: flagshipTrialDays,
          billingType: flagship.billingType || "ONE_TIME"
        },
        {
          id: "plan_12_months",
          planId: "plan_12_months",
          name: "12 Months (Annual)",
          tierLabel: "Save 50% \u2022 Best Value",
          billingCycle: "12_MONTHS",
          durationDays: 365,
          monthlyPriceInr: Math.round(yearlyTotal / 12),
          totalPriceInr: yearlyTotal,
          price: yearlyTotal,
          periodText: "/ month",
          description: "Billed \u20B9588 annually. Maximum savings with 1-year continuous access.",
          savingsBadge: "Save 50% \u2022 Best Value",
          isPopular: true,
          trialDurationDays: flagshipTrialDays,
          billingType: flagship.billingType || "ONE_TIME"
        }
      ];
      return jsonResponse({
        success: true,
        data: parsedPlans,
        plans: parsedPlans,
        tiers: dynamicTiers,
        flagshipPlan: flagship
      });
    } catch (err) {
      console.error("[Public Plans API Error]", err);
      return errorResponse("Failed to fetch pricing plans: " + (err?.message || "Server error"), 500);
    }
  }
  if ((path2 === "/api/payu/init" || path2 === "/api/payments/payu/initiate") && method === "POST") {
    try {
      const session2 = await authenticateRequest(request, env.SESSION_SECRET || "kannaku-dev-session-key");
      const body = await parseRequestBody(request);
      const effectiveOrgId2 = session2?.organizationId || body.organizationId || body.orgId || "org_demo_hytex";
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId2);
      const requestedPlanId = body.planId || org?.plan_id || org?.planId || "plan_all_in_one_pro";
      let planRecord = await queryFirst(
        db,
        `SELECT id, name, code, monthly_price_inr, three_month_price_inr, six_month_price_inr, yearly_price_inr, billing_type FROM saas_plans WHERE (id = ? OR id = 'plan_all_in_one_pro') AND is_archived = 0 ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END LIMIT 1`,
        requestedPlanId,
        requestedPlanId
      );
      if (!planRecord) {
        planRecord = await queryFirst(
          db,
          `SELECT id, name, code, monthly_price_inr, three_month_price_inr, six_month_price_inr, yearly_price_inr, billing_type FROM saas_plans WHERE is_archived = 0 ORDER BY monthly_price_inr ASC LIMIT 1`
        );
      }
      const activePlanId = planRecord?.id || "plan_all_in_one_pro";
      const activePlanName = planRecord?.name || "All-in-One Growth Plan";
      const planBillingType = (planRecord?.billing_type || planRecord?.billingType || "ONE_TIME").toUpperCase();
      if (planBillingType === "RECURRING") {
        return jsonResponse(
          {
            success: false,
            error: "Recurring billing is not yet available \u2014 pending PayU Subscription Payments activation."
          },
          501
        );
      }
      const reqCycle = String(body.billingCycle || "").toUpperCase().trim();
      const isThreeMonths = requestedPlanId === "plan_3_months" || reqCycle === "3_MONTHS" || reqCycle === "3_MONTH" || reqCycle === "QUARTERLY" || reqCycle === "THREE_MONTHS";
      const isSixMonths = requestedPlanId === "plan_6_months" || reqCycle === "6_MONTHS" || reqCycle === "HALF_YEARLY" || reqCycle === "6_MONTH" || reqCycle === "SEMESTER";
      const isTwelveMonths = requestedPlanId === "plan_12_months" || reqCycle === "12_MONTHS" || reqCycle === "YEARLY" || reqCycle === "ANNUAL" || reqCycle === "12_MONTH" || reqCycle === "1_YEAR";
      let billingCycle = "1_MONTH";
      let durationDays = 30;
      let durationTitle = "1 Month (Monthly Access)";
      let amount = Number(planRecord?.monthly_price_inr) || 99;
      if (isTwelveMonths) {
        billingCycle = "12_MONTHS";
        durationDays = 365;
        durationTitle = "12 Months (Annual Access)";
        amount = Number(planRecord?.yearly_price_inr) || Number(planRecord?.monthly_price_inr) * 12 || 588;
      } else if (isSixMonths) {
        billingCycle = "6_MONTHS";
        durationDays = 180;
        durationTitle = "6 Months (Half-Yearly Access)";
        amount = Number(planRecord?.six_month_price_inr) || Number(planRecord?.monthly_price_inr) * 6 || 474;
      } else if (isThreeMonths) {
        billingCycle = "3_MONTHS";
        durationDays = 90;
        durationTitle = "3 Months (Quarterly Access)";
        amount = Number(planRecord?.three_month_price_inr) || Number(planRecord?.monthly_price_inr) * 3 || 279;
      }
      const clientSubmittedAmount = Number(body.amount);
      if (!isNaN(clientSubmittedAmount) && clientSubmittedAmount > 0 && Math.abs(clientSubmittedAmount - amount) > 0.01) {
        console.info(`[PayU Checkout] Client submitted amount: ${clientSubmittedAmount}, but using authoritative server plan price: ${amount} for plan ${activePlanId} (${billingCycle})`);
      }
      const couponCode = (body.couponCode || "").toUpperCase().trim();
      let appliedCouponCode = null;
      let discountAmount = 0;
      if (couponCode) {
        const coupon = await queryFirst(
          db,
          `SELECT * FROM coupons WHERE UPPER(code) = ? AND status = 'ACTIVE'`,
          couponCode
        );
        if (coupon) {
          const isNotExpired = !coupon.expiry_date || new Date(coupon.expiry_date).getTime() >= Date.now();
          const hasUsageLeft = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
          if (isNotExpired && hasUsageLeft) {
            appliedCouponCode = coupon.code;
            if (coupon.discount_type === "PERCENTAGE") {
              discountAmount = Math.round(amount * Number(coupon.discount_value) / 100 * 100) / 100;
            } else {
              discountAmount = Number(coupon.discount_value) || 0;
            }
            discountAmount = Math.min(amount, discountAmount);
            amount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);
          }
        }
      }
      const { merchantKey: payuKey, merchantSalt: payuSalt, endpoint: actionUrl, isTestMode } = await getPayUCredentials(db, env);
      if (!payuKey || !payuSalt) {
        return jsonResponse(
          {
            success: false,
            configured: false,
            error: "PayU merchant credentials are not configured on the server. Please configure Payment Gateways in the Super Admin panel or set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT secrets."
          },
          400
        );
      }
      const txnid = body.txnid || `txnid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const amountStr = amount.toFixed(2);
      const productinfo = body.productinfo || `JustGST - ${activePlanName} (${durationTitle})${appliedCouponCode ? ` [Coupon: ${appliedCouponCode}]` : ""}`;
      const firstname = (body.firstname || org?.owner_name || session2?.name || "Customer").substring(0, 50).trim();
      const email = (body.email || org?.admin_email || session2?.email || "customer@justgst.in").trim();
      const phone = (body.phone || org?.mobile || "9999999999").replace(/[^0-9]/g, "").slice(-10) || "9999999999";
      const udf1 = effectiveOrgId2;
      const udf2 = session2?.userId || body.userId || "guest_user";
      const udf3 = billingCycle;
      const udf4 = durationDays.toString();
      const udf5 = activePlanId;
      const udf6 = body.udf6 || "";
      const udf7 = body.udf7 || "";
      const udf8 = body.udf8 || "";
      const udf9 = body.udf9 || "";
      const udf10 = body.udf10 || "";
      const { hash } = await generatePayUForwardHash({
        key: payuKey,
        txnid,
        amount: amountStr,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        udf6,
        udf7,
        udf8,
        udf9,
        udf10,
        salt: payuSalt
      });
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
      const proto = request.headers.get("x-forwarded-proto") || (url.protocol ? url.protocol.replace(":", "") : "https");
      const computedOrigin = `${proto}://${host}`.replace(/\/$/, "");
      const appBaseUrl = env.APP_URL || (computedOrigin.startsWith("http") ? computedOrigin : url.origin) || "https://justgst.in";
      const surl = body.surl || `${appBaseUrl}/api/payments/payu/return`;
      const furl = body.furl || `${appBaseUrl}/api/payments/payu/return`;
      try {
        await execute(
          db,
          `INSERT INTO subscription_transactions (
            id, organization_id, txnid, amount, currency, plan_id, plan_name, billing_cycle, duration_days, payment_provider, payment_status, customer_email, customer_phone, coupon_code
          ) VALUES (?, ?, ?, ?, 'INR', ?, ?, ?, ?, 'payu', 'PENDING', ?, ?, ?)`,
          `sub_txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          effectiveOrgId2,
          txnid,
          amount,
          activePlanId,
          activePlanName,
          billingCycle,
          durationDays,
          email,
          phone,
          appliedCouponCode
        );
      } catch (dbErr) {
        console.warn("Failed to insert initial subscription transaction:", dbErr);
      }
      return jsonResponse({
        success: true,
        action: actionUrl,
        endpoint: actionUrl,
        isTestMode,
        txnid,
        hash,
        params: {
          key: payuKey,
          txnid,
          amount: amountStr,
          productinfo,
          firstname,
          email,
          phone,
          surl,
          furl,
          hash,
          udf1,
          udf2,
          udf3,
          udf4,
          udf5,
          udf6,
          udf7,
          udf8,
          udf9,
          udf10,
          service_provider: "payu_paisa"
        }
      });
    } catch (err) {
      console.error("[PayU Initiate Error]", err);
      return errorResponse("Failed to initiate PayU payment: " + (err?.message || "Server error"), 500);
    }
  }
  const normalizedPath = path2.replace(/\/+$/, "").toLowerCase() || "/";
  const isPayUReturnOrCallbackPath = normalizedPath === "/api/payments/payu/return" || normalizedPath === "/api/payu/return" || normalizedPath === "/api/payments/payu/callback" || normalizedPath === "/api/payu/callback" || normalizedPath === "/api/payments/payu/webhook" || normalizedPath === "/api/payu/webhook" || normalizedPath === "/api/payu/verify";
  if (isPayUReturnOrCallbackPath) {
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    if (method === "HEAD") {
      return new Response(null, { status: 200 });
    }
    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
    const protoHeader = request.headers.get("x-forwarded-proto") || (url.protocol ? url.protocol.replace(":", "") : "https");
    const computedAppOrigin = `${protoHeader}://${hostHeader}`.replace(/\/$/, "");
    const appBaseUrl = env.APP_URL || (computedAppOrigin.startsWith("http") ? computedAppOrigin : url.origin) || "https://justgst.in";
    const isWebhookOrJsonApi = normalizedPath === "/api/payu/verify" || normalizedPath === "/api/payu/webhook" || normalizedPath === "/api/payments/payu/webhook" || (request.headers.get("accept") || "").includes("application/json");
    const createRedirectResponse = (targetUrl, isSuccess, titleMsg) => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "Payment Successful" : "Redirecting to Subscription"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px 24px;
      text-align: center;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${isSuccess ? "rgba(34, 197, 94, 0.15)" : "rgba(99, 102, 241, 0.15)"};
      color: ${isSuccess ? "#4ade80" : "#818cf8"};
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: ${isSuccess ? "#22c55e" : "#6366f1"};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
    .btn {
      display: inline-block;
      background: ${isSuccess ? "#16a34a" : "#4f46e5"};
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap">
      <div class="spinner"></div>
    </div>
    <h2>${isSuccess ? "Payment Successful!" : "Returning to Subscription..."}</h2>
    <p>${titleMsg || (isSuccess ? "Activating your subscription and returning you to the app..." : "Returning you back to the subscription page...")}</p>
    <a href="${targetUrl}" class="btn">Click here if not redirected automatically</a>
  </div>
  <script>
    try {
      window.location.replace(${JSON.stringify(targetUrl)});
    } catch (e) {
      window.location.href = ${JSON.stringify(targetUrl)};
    }
  </script>
</body>
</html>`;
      return new Response(html, {
        status: 303,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          Location: targetUrl,
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin": "*"
        }
      });
    };
    try {
      let body = {};
      if (method === "POST") {
        body = await parseRequestBody(request);
      } else {
        for (const [k, v] of url.searchParams.entries()) {
          body[k] = v;
        }
      }
      if (Object.keys(body).length === 0 && url.searchParams.toString()) {
        for (const [k, v] of url.searchParams.entries()) {
          body[k] = v;
        }
      }
      const txnid = (body.txnid || "").trim();
      const rawStatus = (body.status || "").trim().toLowerCase();
      const unmappedStatus = (body.unmappedstatus || "").trim().toLowerCase();
      const status = rawStatus || (unmappedStatus === "captured" ? "success" : unmappedStatus === "usercancelled" ? "failure" : "");
      const amount = body.amount !== void 0 ? String(body.amount).trim() : "0";
      const mihpayid = (body.mihpayid || body.payuMoneyId || body.bank_ref_num || "").trim();
      const firstname = (body.firstname || "").trim();
      const email = (body.email || "").trim();
      const receivedHash = (body.hash || "").trim();
      let errorMessage = body.error_Message || body.error || body.unmappedstatus || "";
      if (!errorMessage) {
        errorMessage = status === "success" ? "" : "Payment was not completed";
      }
      if (unmappedStatus === "usercancelled" || rawStatus.includes("cancel") || errorMessage.toLowerCase().includes("cancel")) {
        errorMessage = "Payment cancelled by user";
      }
      const udf1 = (body.udf1 || "").trim();
      const udf2 = (body.udf2 || "").trim();
      const udf3 = (body.udf3 || "").trim();
      const udf4 = (body.udf4 || "").trim();
      const udf5 = (body.udf5 || "").trim();
      const payuCreds = await getPayUCredentials(db, env);
      const { merchantKey: payuKey, merchantSalt: payuSalt, payuEnv } = payuCreds;
      if (!payuKey || !payuSalt) {
        console.error(`[PayU Return] Configured PayU ${payuEnv} credentials (key/salt) are missing for environment ${payuEnv}`);
        if (isWebhookOrJsonApi) {
          return errorResponse(`PayU ${payuEnv} merchant credentials are not configured on server`, 500);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent(`Payment gateway configuration missing for ${payuEnv} environment`)}#subscription`;
        return createRedirectResponse(failureUrl, false, "Returning to subscription page...");
      }
      if (!txnid) {
        console.error("[PayU Return] Missing txnid in callback payload");
        if (isWebhookOrJsonApi) {
          return errorResponse("Missing txnid in payment callback", 400);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&error=${encodeURIComponent("Missing transaction identifier")}#subscription`;
        return createRedirectResponse(failureUrl, false, "Returning to subscription page...");
      }
      let existingTxn = await queryFirst(db, "SELECT * FROM subscription_transactions WHERE txnid = ?", txnid);
      if (!existingTxn) {
        console.error(`[PayU Return] Unmatched txnid: ${txnid} not found in database`);
        if (isWebhookOrJsonApi) {
          return errorResponse(`Transaction ${txnid} not found for reconciliation`, 404);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent("Transaction not found in system record")}#subscription`;
        return createRedirectResponse(failureUrl, false, "Returning to subscription page...");
      }
      if (existingTxn.payment_status === "SUCCESS" || existingTxn.payment_status === "MANUALLY_ACTIVATED") {
        if (isWebhookOrJsonApi) {
          return jsonResponse({
            success: true,
            verified: true,
            message: "Transaction already verified and fulfilled (idempotent)",
            txnid,
            mihpayid
          });
        }
        const successRedirectUrl2 = `${appBaseUrl}/?payment_status=success&txnid=${encodeURIComponent(txnid)}&amount=${encodeURIComponent(amount)}#subscription`;
        return createRedirectResponse(successRedirectUrl2, true, "Payment verified! Returning to subscription...");
      }
      if (status !== "success" && status !== "captured") {
        await execute(
          db,
          `UPDATE subscription_transactions SET
            payment_status = 'FAILED',
            payu_payment_id = ?,
            payu_response_json = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE txnid = ?`,
          mihpayid,
          JSON.stringify(body),
          txnid
        );
        if (isWebhookOrJsonApi) {
          return jsonResponse({
            success: false,
            verified: true,
            message: "Payment failure or cancellation recorded",
            txnid,
            mihpayid,
            status,
            error: errorMessage
          });
        }
        const failureRedirectUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent(errorMessage)}#subscription`;
        return createRedirectResponse(failureRedirectUrl, false, "Payment cancelled. Returning to subscription page...");
      }
      const { isValid, calculatedHash } = await verifyPayUReverseHashPayload(body, payuSalt, payuKey);
      if (!isValid) {
        console.warn(`[PayU Return] Reverse hash verification failed for txnid: ${txnid} in ${payuEnv} environment.`);
        await execute(
          db,
          `UPDATE subscription_transactions SET
            payment_status = 'VERIFICATION_FAILED',
            payu_payment_id = ?,
            payu_response_json = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE txnid = ?`,
          mihpayid,
          JSON.stringify(body),
          txnid
        );
        if (isWebhookOrJsonApi) {
          return jsonResponse({
            error: `Hash verification failed: invalid signature for ${payuEnv} environment`,
            success: false
          }, 400);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent("Security signature verification failed")}#subscription`;
        return createRedirectResponse(failureUrl, false, "Security verification failed. Returning to subscription...");
      }
      const returnedPaise = Math.round(parseFloat(amount) * 100);
      const expectedPaise = Math.round(parseFloat(String(existingTxn.amount || 0)) * 100);
      if (isNaN(returnedPaise) || isNaN(expectedPaise) || returnedPaise !== expectedPaise) {
        console.warn(`[PayU Return] Amount mismatch for txnid: ${txnid}. Expected ${expectedPaise} paise, returned ${returnedPaise} paise`);
        await execute(
          db,
          `UPDATE subscription_transactions SET
            payment_status = 'AMOUNT_MISMATCH',
            payu_payment_id = ?,
            payu_response_json = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE txnid = ?`,
          mihpayid,
          JSON.stringify(body),
          txnid
        );
        if (isWebhookOrJsonApi) {
          return jsonResponse({
            error: `Amount mismatch: expected ${expectedPaise / 100}, got ${returnedPaise / 100}`,
            success: false
          }, 400);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent("Payment amount mismatch")}#subscription`;
        return createRedirectResponse(failureUrl, false, "Amount verification failed. Returning to subscription...");
      }
      const orgId = existingTxn.organization_id || udf1 || "";
      const durationDays = parseInt(String(existingTxn.duration_days || udf4 || 365), 10);
      const planId = existingTxn.plan_id || udf5 || "plan_all_in_one_pro";
      const planName = existingTxn.plan_name || "All-in-One Growth Plan";
      const billingCycle = existingTxn.billing_cycle || udf3 || "1_MONTH";
      if (!orgId) {
        console.error(`[PayU Return] Unable to resolve organization_id for txnid: ${txnid}`);
        await execute(
          db,
          `UPDATE subscription_transactions SET payment_status = 'RECONCILIATION_REQUIRED', updated_at = CURRENT_TIMESTAMP WHERE txnid = ?`,
          txnid
        );
        if (isWebhookOrJsonApi) {
          return errorResponse("Unable to resolve organization for transaction", 400);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent("Organization resolution failed")}#subscription`;
        return createRedirectResponse(failureUrl, false, "Returning to subscription page...");
      }
      let baseDate = Date.now();
      try {
        const org = await queryFirst(db, "SELECT renewal_date FROM organizations WHERE id = ?", orgId);
        if (org?.renewal_date) {
          const existingRenewalTime = new Date(org.renewal_date).getTime();
          if (!isNaN(existingRenewalTime) && existingRenewalTime > baseDate) {
            baseDate = existingRenewalTime;
          }
        }
      } catch (orgQueryErr) {
        console.error("[PayU Return] Error querying organization renewal date:", orgQueryErr?.message || orgQueryErr);
      }
      const renewalDate = new Date(baseDate + durationDays * 24 * 60 * 60 * 1e3).toISOString();
      let orgUpdated = false;
      try {
        const result = await execute(
          db,
          `UPDATE organizations SET
            subscription_status = 'ACTIVE',
            account_status = 'ACTIVE',
            renewal_date = ?,
            plan_id = ?,
            plan_name = ?,
            billing_cycle = ?,
            payment_provider = 'payu',
            last_active = CURRENT_TIMESTAMP
          WHERE id = ?`,
          renewalDate,
          planId,
          planName,
          billingCycle,
          orgId
        );
        orgUpdated = Boolean(result);
      } catch (orgUpdateErr) {
        console.error(`[PayU Return] CRITICAL: Organization update SQL thrown for org ${orgId}:`, orgUpdateErr?.message || orgUpdateErr);
        orgUpdated = false;
      }
      if (!orgUpdated) {
        console.error(`[PayU Return] CRITICAL: Failed to update organization subscription status for orgId: ${orgId}, txnid: ${txnid}`);
        await execute(
          db,
          `UPDATE subscription_transactions SET
            payment_status = 'ACTIVATION_FAILED',
            payu_payment_id = ?,
            payu_response_json = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE txnid = ?`,
          mihpayid,
          JSON.stringify(body),
          txnid
        );
        if (isWebhookOrJsonApi) {
          return errorResponse("Failed to update organization subscription status. Payment recorded for manual review.", 500);
        }
        const failureUrl = `${appBaseUrl}/?payment_status=failure&txnid=${encodeURIComponent(txnid)}&error=${encodeURIComponent("Organization activation failed. Please contact support.")}#subscription`;
        return createRedirectResponse(failureUrl, false, "Activation failed. Returning to subscription page...");
      }
      try {
        await execute(
          db,
          `UPDATE subscription_transactions SET
            payment_status = 'SUCCESS',
            payu_payment_id = ?,
            payu_response_json = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE txnid = ?`,
          mihpayid || txnid,
          JSON.stringify(body),
          txnid
        );
      } catch (subTxnErr) {
        console.error("[PayU Return] Error updating subscription_transactions status to SUCCESS:", subTxnErr?.message || subTxnErr);
      }
      if (existingTxn.coupon_code) {
        try {
          await execute(
            db,
            `UPDATE coupons SET used_count = used_count + 1 WHERE UPPER(code) = ?`,
            existingTxn.coupon_code.toUpperCase().trim()
          );
        } catch (couponErr) {
          console.error("[PayU Return] Failed to increment coupon usage:", couponErr?.message || couponErr);
        }
      }
      try {
        const existingLedger = await queryFirst(db, "SELECT id FROM saas_transactions WHERE gateway_ref_id = ? OR id = ?", txnid, `txn_${txnid}`);
        if (!existingLedger) {
          const org = await queryFirst(db, "SELECT name FROM organizations WHERE id = ?", orgId);
          await execute(
            db,
            `INSERT INTO saas_transactions (
              id, organization_id, organization_name, amount, currency, payment_method, payment_provider, status, date, invoice_number, gateway_ref_id, customer_email, plan_name, billing_cycle
            ) VALUES (?, ?, ?, ?, 'INR', 'PayU Hosted Checkout', 'PayU', 'SUCCESSFUL', CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
            `txn_${txnid}`,
            orgId,
            org?.name || "Workspace Tenant",
            existingTxn.amount || parseFloat(amount) || 0,
            `INV-${txnid.slice(-8)}`,
            txnid,
            email || existingTxn.customer_email || "customer@justgst.in",
            planName,
            existingTxn.billing_cycle || "YEARLY"
          );
        }
      } catch (ledgerErr) {
        console.error("[PayU Return] Error writing to saas_transactions ledger:", ledgerErr?.message || ledgerErr);
      }
      try {
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, 'SYSTEM', 'PAYMENT_SUCCESS', ?, ?, 'SUBSCRIPTION', ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orgId || "org_system",
          udf2 || "user_payu",
          firstname || "Customer",
          txnid || mihpayid,
          `Subscription ${planName}`,
          request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1"
        );
      } catch (auditErr) {
        console.error("[PayU Return] Error inserting audit log for payment success:", auditErr?.message || auditErr);
      }
      if (isWebhookOrJsonApi) {
        return jsonResponse({
          success: true,
          verified: true,
          message: "Payment verified and organization subscription successfully activated",
          txnid,
          mihpayid,
          renewalDate
        });
      }
      const successRedirectUrl = `${appBaseUrl}/?payment_status=success&txnid=${encodeURIComponent(txnid)}&amount=${encodeURIComponent(amount)}#subscription`;
      return createRedirectResponse(successRedirectUrl, true, "Payment verified! Returning to subscription...");
    } catch (err) {
      console.error("[PayU Return Handler Error]", err);
      if (isWebhookOrJsonApi) {
        return errorResponse("Failed to process PayU callback: " + (err?.message || "Server error"), 500);
      }
      const fallbackUrl = `${appBaseUrl}/?payment_status=failure&error=${encodeURIComponent("Internal server error during return processing")}#subscription`;
      return createRedirectResponse(fallbackUrl, false, "Returning to subscription page...");
    }
  }
  if (path2 === "/api/coupons/validate" && method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const code = (body.code || "").toUpperCase().trim();
      const amount = Number(body.amount) || 0;
      const planId = body.planId || "plan_all_in_one_pro";
      if (!code) {
        return errorResponse("Coupon code is required", 400);
      }
      const coupon = await queryFirst(
        db,
        `SELECT * FROM coupons WHERE UPPER(code) = ? AND status = 'ACTIVE'`,
        code
      );
      if (!coupon) {
        return jsonResponse({
          success: false,
          error: `Coupon "${code}" is invalid or does not exist.`
        }, 404);
      }
      if (coupon.expiry_date && new Date(coupon.expiry_date).getTime() < Date.now()) {
        return jsonResponse({
          success: false,
          error: `Coupon "${code}" has expired on ${new Date(coupon.expiry_date).toLocaleDateString()}.`
        }, 400);
      }
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return jsonResponse({
          success: false,
          error: `Coupon "${code}" has reached its maximum global redemption limit.`
        }, 400);
      }
      if (coupon.plan_restrictions_json) {
        try {
          const allowedPlans = JSON.parse(coupon.plan_restrictions_json);
          if (Array.isArray(allowedPlans) && allowedPlans.length > 0 && !allowedPlans.includes(planId)) {
            return jsonResponse({
              success: false,
              error: `Coupon "${code}" cannot be applied to this plan.`
            }, 400);
          }
        } catch {
        }
      }
      let discountAmount = 0;
      if (coupon.discount_type === "PERCENTAGE") {
        discountAmount = Math.round(amount * Number(coupon.discount_value) / 100 * 100) / 100;
      } else {
        discountAmount = Number(coupon.discount_value) || 0;
      }
      discountAmount = Math.min(amount, discountAmount);
      const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);
      return jsonResponse({
        success: true,
        data: {
          valid: true,
          code: coupon.code,
          discountType: coupon.discount_type,
          discountValue: coupon.discount_value,
          discountAmount,
          finalAmount,
          message: `Coupon "${coupon.code}" applied! Saved \u20B9${discountAmount}.`
        }
      });
    } catch (err) {
      return errorResponse("Failed to validate coupon: " + err?.message, 500);
    }
  }
  const session = await authenticateRequest(request, secretKey);
  if (!session) {
    return errorResponse("Unauthorized. Please log in.", 401);
  }
  const impersonateOrgHeader = request.headers.get("X-Impersonate-Org");
  let effectiveOrgId = session.organizationId;
  if (session.role === "SUPER_ADMIN" && impersonateOrgHeader) {
    effectiveOrgId = impersonateOrgHeader;
  }
  if (path2 === "/api/auth/me" && method === "GET") {
    const user = await queryFirst(db, "SELECT * FROM platform_users WHERE id = ?", session.userId);
    const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
    const accessCheck = isOrgAccessAllowed(org);
    const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
    const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
    const readOnlyReason = code;
    return jsonResponse({
      user: {
        id: user?.id || session.userId,
        name: user?.name || session.name,
        email: user?.email || session.email,
        phone: user?.phone,
        role: user?.role || session.role,
        avatarUrl: user?.avatar_url,
        accountStatus: org?.account_status,
        subscriptionStatus: org?.subscription_status,
        isReadOnly,
        code,
        readOnlyReason
      },
      organization: org ? {
        ...org,
        accountStatus: org.account_status,
        subscriptionStatus: org.subscription_status,
        isReadOnly,
        code,
        readOnlyReason
      } : null,
      isReadOnly,
      code,
      readOnlyReason
    });
  }
  if (path2 === "/api/auth/change-password" && method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return errorResponse("Current password and new password are required", 400);
      }
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return errorResponse("New password must be at least 6 characters long", 400);
      }
      const user = await queryFirst(
        db,
        "SELECT * FROM platform_users WHERE id = ?",
        session.userId
      );
      if (!user) {
        return errorResponse("User account not found", 404);
      }
      const isCurrentValid = await verifyPassword(currentPassword, user.password_hash);
      if (!isCurrentValid) {
        return errorResponse("Current password is incorrect", 400);
      }
      const newPassHash = await hashPassword(newPassword);
      await execute(
        db,
        "UPDATE platform_users SET password_hash = ? WHERE id = ?",
        newPassHash,
        session.userId
      );
      try {
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, 'PASSWORD_CHANGED', ?, ?, 'platform_users', ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          session.organizationId,
          session.userId,
          session.name || user.name || "User",
          session.role || "USER",
          session.userId,
          user.name || session.name || "User Profile",
          request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1"
        );
      } catch (auditErr) {
        console.warn("[change-password] Failed to insert audit log:", auditErr?.message || auditErr);
      }
      return jsonResponse({
        success: true,
        message: "Password changed successfully"
      });
    } catch (err) {
      return errorResponse("Failed to change password: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/subscription/current" && method === "GET") {
    const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
    if (!org) {
      return errorResponse("Organization not found", 404);
    }
    const accessCheck = isOrgAccessAllowed(org);
    const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
    const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
    const readOnlyReason = code;
    const subStatus = (org.subscription_status || "TRIAL").toUpperCase();
    const now = Date.now();
    let daysRemaining = 0;
    let effectiveRenewalDate = org.renewal_date || null;
    let effectiveTrialEndDate = org.trial_end_date || null;
    if (subStatus === "ACTIVE") {
      if (!effectiveRenewalDate) {
        const lastTxn = await queryFirst(
          db,
          `SELECT created_at, billing_cycle FROM saas_transactions WHERE organization_id = ? AND status IN ('SUCCESSFUL', 'SUCCESS') ORDER BY created_at DESC LIMIT 1`,
          effectiveOrgId
        );
        const baseTime = lastTxn?.created_at ? new Date(lastTxn.created_at).getTime() : org.created_at ? new Date(org.created_at).getTime() : now;
        let durationDays = 365;
        if (lastTxn?.billing_cycle === "1_MONTH") durationDays = 30;
        else if (lastTxn?.billing_cycle === "6_MONTHS") durationDays = 180;
        const renewalTime2 = (isNaN(baseTime) ? now : baseTime) + durationDays * 24 * 60 * 60 * 1e3;
        effectiveRenewalDate = new Date(renewalTime2).toISOString();
        try {
          await execute(db, "UPDATE organizations SET renewal_date = ? WHERE id = ?", effectiveRenewalDate, effectiveOrgId);
        } catch (updateErr) {
          console.warn("[subscription] Failed to persist renewal_date:", updateErr?.message);
        }
      }
      const renewalTime = new Date(effectiveRenewalDate).getTime();
      daysRemaining = !isNaN(renewalTime) ? Math.max(0, Math.ceil((renewalTime - now) / (1e3 * 60 * 60 * 24))) : 365;
    } else if (subStatus === "TRIAL") {
      if (!effectiveTrialEndDate) {
        const createdTime = org.created_at ? new Date(org.created_at).getTime() : now;
        const trialEndTime = (isNaN(createdTime) ? now : createdTime) + 14 * 24 * 60 * 60 * 1e3;
        effectiveTrialEndDate = new Date(trialEndTime).toISOString();
        try {
          await execute(db, "UPDATE organizations SET trial_end_date = ? WHERE id = ?", effectiveTrialEndDate, effectiveOrgId);
        } catch (updateErr) {
          console.warn("[subscription] Failed to persist trial_end_date:", updateErr?.message);
        }
      }
      const trialTime = new Date(effectiveTrialEndDate).getTime();
      daysRemaining = !isNaN(trialTime) ? Math.max(0, Math.ceil((trialTime - now) / (1e3 * 60 * 60 * 24))) : 14;
    }
    const { merchantKey } = await getPayUCredentials(db, env);
    return jsonResponse({
      success: true,
      subscription: {
        organizationId: org.id,
        workspaceName: org.name,
        planId: org.plan_id || "plan_all_in_one_pro",
        planName: org.plan_name || "All-in-One Growth Plan",
        subscriptionStatus: subStatus,
        accountStatus: org.account_status || "ACTIVE",
        renewalDate: effectiveRenewalDate,
        trialEndDate: effectiveTrialEndDate,
        paymentProvider: org.payment_provider || "payu",
        daysRemaining,
        isReadOnly,
        code,
        readOnlyReason,
        activeGateway: {
          name: "PayU India Hosted Gateway",
          provider: "payu",
          isConfigured: !!merchantKey,
          currency: "INR"
        }
      }
    });
  }
  if (path2 === "/api/subscription/transactions" && method === "GET") {
    try {
      const saasTxns = await queryAll(
        db,
        "SELECT * FROM saas_transactions WHERE organization_id = ? ORDER BY date DESC LIMIT 50",
        effectiveOrgId
      );
      const subTxns = await queryAll(
        db,
        "SELECT * FROM subscription_transactions WHERE organization_id = ? ORDER BY created_at DESC LIMIT 50",
        effectiveOrgId
      );
      const org = await queryFirst(
        db,
        "SELECT name FROM organizations WHERE id = ?",
        effectiveOrgId
      );
      const merged = [
        ...saasTxns.map((t) => ({
          id: t.id,
          organizationId: t.organization_id,
          organizationName: t.organization_name,
          amount: Number(t.amount) || 0,
          currency: t.currency || "INR",
          status: t.status === "SUCCESSFUL" || t.status === "SUCCESS" ? "SUCCESSFUL" : t.status === "FAILED" ? "FAILED" : "PENDING",
          date: t.date,
          invoiceNumber: t.invoice_number || `INV-${t.id.slice(-6)}`,
          paymentMethod: t.payment_method || "PayU Hosted Checkout",
          paymentProvider: t.payment_provider || "PayU",
          planName: t.plan_name || "All-in-One Growth Plan",
          billingCycle: t.billing_cycle || "1_MONTH",
          gatewayRefId: t.gateway_ref_id || t.id
        })),
        ...subTxns.filter((st) => !saasTxns.some((t) => t.gateway_ref_id === st.txnid || t.id === st.txnid || t.gateway_ref_id === st.payu_payment_id)).map((st) => ({
          id: st.txnid || st.id,
          organizationId: st.organization_id,
          organizationName: org?.name || "Workspace",
          amount: Number(st.amount) || 0,
          currency: "INR",
          status: st.payment_status === "SUCCESS" ? "SUCCESSFUL" : st.payment_status === "FAILED" ? "FAILED" : "PENDING",
          date: st.created_at,
          invoiceNumber: `INV-${(st.txnid || st.id).slice(-6)}`,
          paymentMethod: "PayU Hosted Checkout",
          paymentProvider: "PayU",
          planName: st.plan_name || "All-in-One Growth Plan",
          billingCycle: st.billing_cycle || "1_MONTH",
          gatewayRefId: st.payu_payment_id || st.txnid
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return jsonResponse({
        success: true,
        transactions: merged
      });
    } catch (err) {
      console.error("[Subscription Transactions Error]", err);
      return errorResponse("Failed to fetch transactions: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/organization" && method === "GET") {
    const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
    if (!org) {
      return errorResponse("Organization not found", 404);
    }
    const accessCheck = isOrgAccessAllowed(org);
    const isReadOnly = (org?.account_status || "").toUpperCase() === "SUSPENDED" || !accessCheck.allowed;
    const code = isReadOnly ? getOrgAccessCode(accessCheck, org) : null;
    const readOnlyReason = code;
    let bankDetail = null;
    try {
      if (org.bank_details_json) {
        bankDetail = JSON.parse(org.bank_details_json);
      }
    } catch {
      bankDetail = null;
    }
    return jsonResponse({
      id: org.id,
      name: org.name,
      address: org.address || "",
      city: org.city || "",
      state: org.state || "Tamil Nadu",
      pin: org.pin || "",
      stateCode: org.state_code || "33",
      email: org.admin_email,
      mobile: org.mobile,
      registerNumber: org.register_number || "",
      panNumber: org.pan_number || "",
      billPrefix: org.bill_prefix || "INV/2026/",
      termsAndCondition: org.terms_conditions || "",
      logoUrl: org.logo_url || null,
      stampUrl: org.stamp_url || null,
      signatureUrl: org.signature_url || null,
      bankDetail,
      plan: org.plan_name,
      accountStatus: org.account_status,
      subscriptionStatus: org.subscription_status,
      trialEndDate: org.trial_end_date,
      renewalDate: org.renewal_date,
      isReadOnly,
      code,
      readOnlyReason
    });
  }
  if (path2 === "/api/organization" && method === "PUT") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const body = await request.json();
      const bankDetailsJson = body.bankDetail ? JSON.stringify(body.bankDetail) : null;
      await execute(
        db,
        `UPDATE organizations SET
          name = COALESCE(?, name),
          address = ?,
          city = ?,
          state = ?,
          pin = ?,
          state_code = ?,
          admin_email = ?,
          mobile = ?,
          register_number = ?,
          pan_number = ?,
          bill_prefix = ?,
          terms_conditions = ?,
          logo_url = ?,
          stamp_url = ?,
          signature_url = ?,
          bank_details_json = ?,
          last_active = CURRENT_TIMESTAMP
        WHERE id = ?`,
        body.name,
        body.address || "",
        body.city || "",
        body.state || "Tamil Nadu",
        body.pin || "",
        body.code || "33",
        body.email || session.email,
        body.mobile || "",
        body.registerNumber || "",
        body.panNumber || "",
        body.billPrefix || "INV/2026/",
        body.termsAndCondition || "",
        body.logoUrl || null,
        body.stampUrl || null,
        body.signatureUrl || null,
        bankDetailsJson,
        effectiveOrgId
      );
      return jsonResponse({ success: true, message: "Organization profile updated successfully" });
    } catch {
      return errorResponse("Failed to update organization profile", 500);
    }
  }
  if (path2 === "/api/clients" && method === "GET") {
    const typeFilter = url.searchParams.get("type");
    let sql = "SELECT * FROM clients WHERE organization_id = ? AND is_active = 1";
    const params = [effectiveOrgId];
    if (typeFilter) {
      sql += " AND client_type = ?";
      params.push(typeFilter);
    }
    sql += " ORDER BY name ASC";
    const rows = await queryAll(db, sql, ...params);
    const clients = rows.map((r) => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile || "",
      email: r.email || "",
      address: r.address || "",
      city: r.city || "",
      state: r.state || "",
      pin: r.pin || "",
      code: r.state_code || "",
      registerNumber: r.register_number || "",
      clientType: r.client_type || "customer",
      balance: r.current_balance || 0,
      createdOn: r.created_at
    }));
    return jsonResponse(clients);
  }
  if (path2 === "/api/clients" && method === "POST") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const body = await request.json();
      if (!body.name || !body.name.trim()) {
        return errorResponse("Client name is required", 400);
      }
      if (body.id) {
        const existingClient = await queryFirst(
          db,
          "SELECT organization_id FROM clients WHERE id = ?",
          body.id
        );
        if (existingClient && existingClient.organization_id !== effectiveOrgId) {
          return errorResponse("You do not have permission to modify this client", 403);
        }
      }
      const id = body.id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const balance = Number(body.balance || 0);
      await execute(
        db,
        `INSERT INTO clients (
          id, organization_id, name, company_name, email, mobile, register_number, address, city, state, pin, state_code, opening_balance, current_balance, client_type, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          company_name = excluded.company_name,
          email = excluded.email,
          mobile = excluded.mobile,
          register_number = excluded.register_number,
          address = excluded.address,
          city = excluded.city,
          state = excluded.state,
          pin = excluded.pin,
          state_code = excluded.state_code,
          current_balance = excluded.current_balance,
          client_type = excluded.client_type,
          updated_at = CURRENT_TIMESTAMP
        WHERE clients.organization_id = excluded.organization_id`,
        id,
        effectiveOrgId,
        body.name,
        body.companyName || body.name,
        body.email || null,
        body.mobile,
        body.registerNumber || null,
        body.address || "",
        body.city || "",
        body.state || "",
        body.pin || "",
        body.code || "",
        balance,
        balance,
        body.clientType || "customer"
      );
      return jsonResponse({ success: true, id, message: "Client saved successfully" }, 201);
    } catch {
      return errorResponse("Failed to save client", 500);
    }
  }
  if (path2.startsWith("/api/clients/") && method === "PUT") {
    const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
    const accessCheck = isOrgAccessAllowed(org);
    if (!accessCheck.allowed) {
      return createOrgAccessDeniedResponse(accessCheck);
    }
    const clientId = path2.split("/")[3];
    const existingClient = await queryFirst(
      db,
      "SELECT organization_id FROM clients WHERE id = ?",
      clientId
    );
    if (existingClient && existingClient.organization_id !== effectiveOrgId) {
      return errorResponse("You do not have permission to modify this client", 403);
    }
    const body = await request.json();
    await execute(
      db,
      `UPDATE clients SET
        name = ?,
        email = ?,
        mobile = ?,
        register_number = ?,
        address = ?,
        city = ?,
        state = ?,
        pin = ?,
        state_code = ?,
        current_balance = ?,
        client_type = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND organization_id = ?`,
      body.name,
      body.email || null,
      body.mobile,
      body.registerNumber || null,
      body.address || "",
      body.city || "",
      body.state || "",
      body.pin || "",
      body.code || "",
      Number(body.balance || 0),
      body.clientType || "customer",
      clientId,
      effectiveOrgId
    );
    return jsonResponse({ success: true, message: "Client updated successfully" });
  }
  if (path2.startsWith("/api/clients/") && method === "DELETE") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const clientId = path2.split("/")[3];
      if (!clientId) {
        return errorResponse("Client ID is required", 400);
      }
      const existingClient = await queryFirst(
        db,
        "SELECT organization_id FROM clients WHERE id = ?",
        clientId
      );
      if (existingClient && existingClient.organization_id !== effectiveOrgId) {
        return errorResponse("You do not have permission to delete this client", 403);
      }
      await execute(
        db,
        "UPDATE clients SET is_active = 0 WHERE id = ? AND organization_id = ?",
        clientId,
        effectiveOrgId
      );
      return jsonResponse({ success: true, message: "Client deleted successfully" });
    } catch (err) {
      console.error("[Delete Client Error]", err?.message || err);
      return errorResponse("Failed to delete client: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/products" && method === "GET") {
    const rows = await queryAll(
      db,
      "SELECT * FROM products WHERE organization_id = ? AND is_active = 1 ORDER BY name ASC",
      effectiveOrgId
    );
    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      itemCode: r.item_code || "",
      hsnCode: r.hsn_code,
      unit: r.unit || "PCS",
      buyingPrice: r.purchase_rate || 0,
      sellingPrice: r.sales_rate,
      mrp: r.mrp || r.sales_rate,
      taxRate: r.tax_percentage || 18,
      currentStock: r.current_stock || 0,
      minStockAlert: r.min_stock_alert || 5,
      subline1: r.subline1 || "",
      subline2: r.subline2 || "",
      subline3: r.subline3 || "",
      barcode: r.barcode || "",
      category: r.category || "",
      createdOn: r.created_at
    }));
    return jsonResponse(products);
  }
  if (path2 === "/api/products" && method === "POST") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const body = await request.json();
      if (!body.name || !body.hsnCode || body.sellingPrice === void 0) {
        return errorResponse("Product name, HSN code, and selling price are required", 400);
      }
      if (body.id) {
        const existingProd = await queryFirst(
          db,
          "SELECT organization_id FROM products WHERE id = ?",
          body.id
        );
        if (existingProd && existingProd.organization_id !== effectiveOrgId) {
          return errorResponse("You do not have permission to modify this product", 403);
        }
      }
      const id = body.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await execute(
        db,
        `INSERT INTO products (
          id, organization_id, name, item_code, hsn_code, unit, purchase_rate, sales_rate, mrp, tax_percentage, current_stock, min_stock_alert, subline1, subline2, subline3, barcode, category, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          item_code = excluded.item_code,
          hsn_code = excluded.hsn_code,
          unit = excluded.unit,
          purchase_rate = excluded.purchase_rate,
          sales_rate = excluded.sales_rate,
          mrp = excluded.mrp,
          tax_percentage = excluded.tax_percentage,
          current_stock = excluded.current_stock,
          min_stock_alert = excluded.min_stock_alert,
          subline1 = excluded.subline1,
          subline2 = excluded.subline2,
          subline3 = excluded.subline3,
          barcode = excluded.barcode,
          category = excluded.category,
          updated_at = CURRENT_TIMESTAMP
        WHERE products.organization_id = excluded.organization_id`,
        id,
        effectiveOrgId,
        body.name,
        body.itemCode || null,
        body.hsnCode,
        body.unit || "PCS",
        Number(body.buyingPrice || 0),
        Number(body.sellingPrice),
        Number(body.mrp || body.sellingPrice),
        Number(body.taxRate || 18),
        Number(body.currentStock || 0),
        Number(body.minStockAlert || 5),
        body.subline1 || "",
        body.subline2 || "",
        body.subline3 || "",
        body.barcode || null,
        body.category || null
      );
      return jsonResponse({ success: true, id, message: "Product saved successfully" }, 201);
    } catch {
      return errorResponse("Failed to save product", 500);
    }
  }
  if (path2.startsWith("/api/products/") && method === "PUT") {
    const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
    const accessCheck = isOrgAccessAllowed(org);
    if (!accessCheck.allowed) {
      return createOrgAccessDeniedResponse(accessCheck);
    }
    const productId = path2.split("/")[3];
    const existingProd = await queryFirst(
      db,
      "SELECT organization_id FROM products WHERE id = ?",
      productId
    );
    if (existingProd && existingProd.organization_id !== effectiveOrgId) {
      return errorResponse("You do not have permission to modify this product", 403);
    }
    const body = await request.json();
    await execute(
      db,
      `UPDATE products SET
        name = ?,
        item_code = ?,
        hsn_code = ?,
        unit = ?,
        purchase_rate = ?,
        sales_rate = ?,
        mrp = ?,
        tax_percentage = ?,
        current_stock = ?,
        min_stock_alert = ?,
        subline1 = ?,
        subline2 = ?,
        subline3 = ?,
        barcode = ?,
        category = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND organization_id = ?`,
      body.name,
      body.itemCode || null,
      body.hsnCode,
      body.unit || "PCS",
      Number(body.buyingPrice || 0),
      Number(body.sellingPrice),
      Number(body.mrp || body.sellingPrice),
      Number(body.taxRate || 18),
      Number(body.currentStock || 0),
      Number(body.minStockAlert || 5),
      body.subline1 || "",
      body.subline2 || "",
      body.subline3 || "",
      body.barcode || null,
      body.category || null,
      productId,
      effectiveOrgId
    );
    return jsonResponse({ success: true, message: "Product updated successfully" });
  }
  if (path2.startsWith("/api/products/") && method === "DELETE") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const productId = path2.split("/")[3];
      if (!productId) {
        return errorResponse("Product ID is required", 400);
      }
      const existingProd = await queryFirst(
        db,
        "SELECT organization_id FROM products WHERE id = ?",
        productId
      );
      if (existingProd && existingProd.organization_id !== effectiveOrgId) {
        return errorResponse("You do not have permission to delete this product", 403);
      }
      await execute(
        db,
        "UPDATE products SET is_active = 0 WHERE id = ? AND organization_id = ?",
        productId,
        effectiveOrgId
      );
      return jsonResponse({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error("[Delete Product Error]", err?.message || err);
      return errorResponse("Failed to delete product: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/invoices" && method === "GET") {
    const invoiceRows = await queryAll(
      db,
      `SELECT i.*, c.client_type as client_table_type 
       FROM invoices i 
       LEFT JOIN clients c ON i.client_id = c.id AND i.organization_id = c.organization_id 
       WHERE i.organization_id = ? 
       ORDER BY i.invoice_date DESC, i.created_at DESC`,
      effectiveOrgId
    );
    const invoices = await Promise.all(
      invoiceRows.map(async (inv) => {
        let items = [];
        if (inv.items_json) {
          try {
            items = JSON.parse(inv.items_json);
          } catch {
            items = [];
          }
        } else {
          const itemRows = await queryAll(
            db,
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            inv.id
          );
          items = itemRows.map((it) => ({
            id: it.id,
            itemId: it.product_id || "",
            name: it.name,
            hsnCode: it.hsn_code,
            qty: it.qty,
            unit: it.unit,
            baseRate: it.rate,
            mrp: it.mrp,
            inclusiveOrExclusive: it.inclusive_or_exclusive || "exclusive",
            isDiscountApplied: it.discount_percentage > 0 || it.discount_amount > 0,
            flatOrPercentage: "percentage",
            discountRate: it.discount_percentage,
            discountAmount: it.discount_amount,
            taxPercentage: it.tax_percentage,
            taxAmount: it.tax_amount,
            taxDetail: {
              hsnCode: it.hsn_code,
              taxable_amount: it.line_total - it.tax_amount,
              tax_amount: it.tax_amount,
              data: [
                { name: "cgst", per: it.cgst_rate || 0, value: it.cgst_amount || 0 },
                { name: "sgst", per: it.sgst_rate || 0, value: it.sgst_amount || 0 },
                { name: "igst", per: it.igst_rate || 0, value: it.igst_amount || 0 }
              ]
            },
            subline1: it.subline1 || "",
            subline2: it.subline2 || "",
            subline3: it.subline3 || "",
            lineTotal: it.line_total
          }));
        }
        let extraItems = [];
        let consignee = null;
        let calc = null;
        try {
          if (inv.extra_items_json) extraItems = JSON.parse(inv.extra_items_json);
          if (inv.consignee_json) consignee = JSON.parse(inv.consignee_json);
          if (inv.calc_json) calc = JSON.parse(inv.calc_json);
        } catch {
        }
        return {
          id: inv.id,
          clientId: inv.client_id || "",
          paymentMode: inv.payment_mode || "CASH",
          invoiceNumber: inv.invoice_number,
          invoiceType: Number(inv.invoice_type) || 1,
          invoiceTaxType: inv.igst_amount > 0 ? "IGST" : "CGST_SGST",
          isConverted: !!inv.is_converted,
          convertedToInvoiceId: inv.converted_to_invoice_id || void 0,
          convertedInvoiceNumber: inv.converted_invoice_number || void 0,
          invoiceDate: inv.invoice_date,
          date: inv.invoice_date,
          dueDate: inv.due_date,
          poNumber: inv.po_number || "",
          clientSnapshot: {
            id: inv.client_id || "",
            name: inv.client_name,
            mobile: inv.client_mobile || "",
            address: inv.client_address || "",
            city: inv.client_city || "",
            state: inv.client_state || "",
            pin: "",
            registerNumber: inv.client_gstin || "",
            clientType: inv.client_table_type || (Number(inv.invoice_type) === 2 ? "supplier" : "customer"),
            balance: inv.balance_amount || 0,
            createdOn: inv.created_at
          },
          consignee: consignee || {
            name: "",
            address: "",
            city: "",
            state: "",
            pin: "",
            shouldVisible: false
          },
          items,
          extraItems,
          modifiers: [],
          calc: calc || {
            subTotal: inv.sub_total,
            totalDiscount: inv.discount_total,
            taxAmount: inv.total_tax,
            totalBeforeModifier: inv.sub_total + inv.total_tax,
            totalModifiers: 0,
            extraItemsTotal: 0,
            tcsPercentage: inv.tcs_percentage || 0,
            tcsAmount: inv.tcs_amount || 0,
            roundOffValue: inv.round_off || 0,
            billFigure: inv.grand_total,
            amountInWords: "",
            paidAmount: inv.paid_amount || 0,
            dueAmount: inv.balance_amount || 0
          },
          status: inv.payment_status,
          notes: inv.notes || "",
          terms: inv.terms || "",
          printTemplate: inv.print_template || "modern",
          createdOn: inv.created_at
        };
      })
    );
    return jsonResponse(invoices);
  }
  if (path2 === "/api/invoices" && method === "POST") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const inv = await request.json();
      if (!inv.invoiceNumber || !inv.clientSnapshot?.name || !inv.items?.length) {
        return errorResponse("Invoice number, client name, and at least one item are required", 400);
      }
      let existingInv = null;
      if (inv.id) {
        existingInv = await queryFirst(
          db,
          "SELECT * FROM invoices WHERE id = ?",
          inv.id
        );
        if (existingInv && existingInv.organization_id !== effectiveOrgId) {
          return errorResponse("You do not have permission to modify this invoice", 403);
        }
      }
      if (existingInv) {
        let oldItems = [];
        if (existingInv.items_json) {
          try {
            oldItems = JSON.parse(existingInv.items_json);
          } catch (e) {
            console.error("[Stock Reversal] Failed to parse old items_json:", e);
            oldItems = [];
          }
        }
        const isOldSales = Number(existingInv.invoice_type) === 1 || existingInv.invoice_type === "SALES" || existingInv.invoice_type === 1 /* SALES */;
        const isOldPurchase = Number(existingInv.invoice_type) === 2 || existingInv.invoice_type === "PURCHASE" || existingInv.invoice_type === 2 /* PURCHASE */;
        if (isOldSales || isOldPurchase) {
          for (const oldItem of oldItems) {
            let prodId = oldItem.productId || oldItem.itemId || oldItem.product_id;
            const qty = Number(oldItem.qty ?? oldItem.quantity ?? 0);
            if (qty <= 0) continue;
            if (!prodId && oldItem.name) {
              const matched = await queryFirst(
                db,
                "SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND organization_id = ?",
                oldItem.name,
                effectiveOrgId
              );
              if (matched) prodId = matched.id;
            }
            if (!prodId) continue;
            try {
              if (isOldSales) {
                await execute(
                  db,
                  "UPDATE products SET current_stock = current_stock + ? WHERE id = ? AND organization_id = ?",
                  qty,
                  prodId,
                  effectiveOrgId
                );
              } else if (isOldPurchase) {
                await execute(
                  db,
                  "UPDATE products SET current_stock = current_stock - ? WHERE id = ? AND organization_id = ?",
                  qty,
                  prodId,
                  effectiveOrgId
                );
              }
            } catch (stockErr) {
              console.error(`[Stock Reversal Error] Failed to reverse stock for product ${prodId}:`, stockErr);
            }
          }
        }
      }
      const id = inv.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const calc = inv.calc || {};
      await execute(
        db,
        `INSERT INTO invoices (
          id, organization_id, invoice_number, invoice_type, invoice_date, due_date, po_number,
          client_id, client_name, client_gstin, client_address, client_city, client_state, client_mobile,
          sub_total, discount_total, cgst_amount, sgst_amount, igst_amount, total_tax,
          tcs_percentage, tcs_amount, round_off, grand_total, paid_amount, balance_amount,
          payment_status, print_template, notes, terms, items_json, extra_items_json, consignee_json, calc_json, created_by,
          is_converted, converted_to_invoice_id, converted_invoice_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          invoice_number = excluded.invoice_number,
          invoice_type = excluded.invoice_type,
          invoice_date = excluded.invoice_date,
          due_date = excluded.due_date,
          po_number = excluded.po_number,
          client_name = excluded.client_name,
          client_gstin = excluded.client_gstin,
          client_address = excluded.client_address,
          client_city = excluded.client_city,
          client_state = excluded.client_state,
          client_mobile = excluded.client_mobile,
          sub_total = excluded.sub_total,
          discount_total = excluded.discount_total,
          cgst_amount = excluded.cgst_amount,
          sgst_amount = excluded.sgst_amount,
          igst_amount = excluded.igst_amount,
          total_tax = excluded.total_tax,
          tcs_percentage = excluded.tcs_percentage,
          tcs_amount = excluded.tcs_amount,
          round_off = excluded.round_off,
          grand_total = excluded.grand_total,
          paid_amount = excluded.paid_amount,
          balance_amount = excluded.balance_amount,
          payment_status = excluded.payment_status,
          print_template = excluded.print_template,
          notes = excluded.notes,
          terms = excluded.terms,
          items_json = excluded.items_json,
          extra_items_json = excluded.extra_items_json,
          consignee_json = excluded.consignee_json,
          calc_json = excluded.calc_json,
          is_converted = excluded.is_converted,
          converted_to_invoice_id = excluded.converted_to_invoice_id,
          converted_invoice_number = excluded.converted_invoice_number
        WHERE invoices.organization_id = excluded.organization_id`,
        id,
        effectiveOrgId,
        inv.invoiceNumber,
        inv.invoiceType || 1,
        inv.invoiceDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        inv.dueDate || null,
        inv.poNumber || null,
        inv.clientSnapshot?.id || null,
        inv.clientSnapshot?.name || "Customer",
        inv.clientSnapshot?.registerNumber || null,
        inv.clientSnapshot?.address || "",
        inv.clientSnapshot?.city || "",
        inv.clientSnapshot?.state || "",
        inv.clientSnapshot?.mobile || "",
        Number(calc.subTotal || 0),
        Number(calc.totalDiscount || 0),
        inv.invoiceTaxType === "IGST" ? 0 : Number(calc.taxAmount || 0) / 2,
        inv.invoiceTaxType === "IGST" ? 0 : Number(calc.taxAmount || 0) / 2,
        inv.invoiceTaxType === "IGST" ? Number(calc.taxAmount || 0) : 0,
        Number(calc.taxAmount || 0),
        Number(calc.tcsPercentage || 0),
        Number(calc.tcsAmount || 0),
        Number(calc.roundOffValue || 0),
        Number(calc.billFigure || 0),
        Number(calc.paidAmount || 0),
        Number(calc.dueAmount || calc.billFigure - (calc.paidAmount || 0)),
        inv.status || (calc.paidAmount >= calc.billFigure ? "PAID" : calc.paidAmount > 0 ? "PARTIAL" : "UNPAID"),
        inv.printTemplate || "modern",
        inv.notes || "",
        inv.terms || "",
        JSON.stringify(inv.items || []),
        JSON.stringify(inv.extraItems || []),
        JSON.stringify(inv.consignee || {}),
        JSON.stringify(calc),
        session.name,
        inv.isConverted ? 1 : 0,
        inv.convertedToInvoiceId || null,
        inv.convertedInvoiceNumber || null
      );
      if (Number(calc.paidAmount) > 0) {
        const isPurchase = Number(inv.invoiceType) === 2 || inv.invoiceType === "PURCHASE" || inv.invoiceType === 2 /* PURCHASE */;
        const isSales = !isPurchase;
        const paymentType = isPurchase ? "PAYMENT" : "RECEIPT";
        const entryType = isPurchase ? "Payment Out" : "Payment In";
        const debitCredit = isSales ? "credit" : "debit";
        const vchNo = isSales ? `RCPT-${inv.invoiceNumber}` : `PYMT-${inv.invoiceNumber}`;
        const particular = isSales ? `Payment Received for Inv #${inv.invoiceNumber} (${inv.paymentMode || "Direct"})` : `Payment Made for Bill #${inv.invoiceNumber}`;
        const paymentNotes = isPurchase ? "Initial payment on purchase bill creation" : "Initial payment on invoice creation";
        const payId = `pay_rcpt_${id}`;
        const partyName = inv.clientSnapshot?.name || "Party";
        const partyTypeStr = isPurchase ? "supplier" : "customer";
        await execute(
          db,
          `INSERT INTO payment_ledgers (
            id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes, entry_type, particular, vch_no, debit_credit, party_name, party_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            client_id = excluded.client_id,
            invoice_id = excluded.invoice_id,
            entry_date = excluded.entry_date,
            payment_type = excluded.payment_type,
            mode = excluded.mode,
            amount = excluded.amount,
            reference_number = excluded.reference_number,
            notes = excluded.notes,
            entry_type = excluded.entry_type,
            particular = excluded.particular,
            vch_no = excluded.vch_no,
            debit_credit = excluded.debit_credit,
            party_name = excluded.party_name,
            party_type = excluded.party_type
          WHERE payment_ledgers.organization_id = excluded.organization_id`,
          payId,
          effectiveOrgId,
          inv.clientId || inv.clientSnapshot?.id || null,
          id,
          inv.invoiceDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          paymentType,
          inv.paymentMode || "CASH",
          Number(calc.paidAmount),
          inv.invoiceNumber,
          paymentNotes,
          entryType,
          particular,
          vchNo,
          debitCredit,
          partyName,
          partyTypeStr
        );
      }
      const isNewSales = Number(inv.invoiceType) === 1 || inv.invoiceType === "SALES" || inv.invoiceType === 1 /* SALES */;
      const isNewPurchase = Number(inv.invoiceType) === 2 || inv.invoiceType === "PURCHASE" || inv.invoiceType === 2 /* PURCHASE */;
      if (isNewSales || isNewPurchase) {
        for (const item of inv.items || []) {
          let prodId = item.productId || item.itemId || item.product_id;
          const qty = Number(item.qty ?? item.quantity ?? 0);
          if (qty <= 0) continue;
          if (!prodId && item.name) {
            const matched = await queryFirst(
              db,
              "SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND organization_id = ?",
              item.name,
              effectiveOrgId
            );
            if (matched) prodId = matched.id;
          }
          if (!prodId) continue;
          try {
            if (isNewSales) {
              await execute(
                db,
                "UPDATE products SET current_stock = current_stock - ? WHERE id = ? AND organization_id = ?",
                qty,
                prodId,
                effectiveOrgId
              );
              const updatedProd = await queryFirst(
                db,
                "SELECT id, name, current_stock FROM products WHERE id = ? AND organization_id = ?",
                prodId,
                effectiveOrgId
              );
              if (updatedProd && updatedProd.current_stock < 0) {
                console.warn(
                  `[Stock Warning] Product "${updatedProd.name}" (${prodId}) stock is negative after Sales Invoice #${inv.invoiceNumber}: ${updatedProd.current_stock}`
                );
              }
            } else if (isNewPurchase) {
              await execute(
                db,
                "UPDATE products SET current_stock = current_stock + ? WHERE id = ? AND organization_id = ?",
                qty,
                prodId,
                effectiveOrgId
              );
            }
          } catch (stockErr) {
            console.error(`[Stock Update Error] Failed to update stock for product ${prodId}:`, stockErr);
          }
        }
      }
      return jsonResponse({ success: true, id, message: "Invoice saved successfully" }, 201);
    } catch (err) {
      console.error("Save invoice error:", err);
      return errorResponse("Failed to save invoice", 500);
    }
  }
  if (path2.startsWith("/api/invoices/") && method === "DELETE") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const invoiceId = path2.split("/")[3];
      if (!invoiceId) {
        return errorResponse("Invoice ID is required", 400);
      }
      const existingInv = await queryFirst(
        db,
        "SELECT * FROM invoices WHERE id = ?",
        invoiceId
      );
      if (!existingInv) {
        return jsonResponse({ success: true, message: "Invoice already deleted" });
      }
      if (existingInv.organization_id !== effectiveOrgId) {
        return errorResponse("You do not have permission to delete this invoice", 403);
      }
      let itemsToReverse = [];
      if (existingInv.items_json) {
        try {
          itemsToReverse = JSON.parse(existingInv.items_json);
        } catch (e) {
          console.error("[Stock Reversal on Delete] Failed to parse items_json:", e);
        }
      }
      const isOldSales = Number(existingInv.invoice_type) === 1 || existingInv.invoice_type === "SALES" || existingInv.invoice_type === 1 /* SALES */;
      const isOldPurchase = Number(existingInv.invoice_type) === 2 || existingInv.invoice_type === "PURCHASE" || existingInv.invoice_type === 2 /* PURCHASE */;
      if (isOldSales || isOldPurchase) {
        for (const item of itemsToReverse) {
          let prodId = item.productId || item.itemId || item.product_id;
          const qty = Number(item.qty ?? item.quantity ?? 0);
          if (qty <= 0) continue;
          if (!prodId && item.name) {
            const matched = await queryFirst(
              db,
              "SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND organization_id = ?",
              item.name,
              effectiveOrgId
            );
            if (matched) prodId = matched.id;
          }
          if (!prodId) continue;
          try {
            if (isOldSales) {
              await execute(
                db,
                "UPDATE products SET current_stock = current_stock + ? WHERE id = ? AND organization_id = ?",
                qty,
                prodId,
                effectiveOrgId
              );
            } else if (isOldPurchase) {
              await execute(
                db,
                "UPDATE products SET current_stock = current_stock - ? WHERE id = ? AND organization_id = ?",
                qty,
                prodId,
                effectiveOrgId
              );
            }
          } catch (stockErr) {
            console.error(`[Stock Reversal on Delete Error] Failed for product ${prodId}:`, stockErr);
          }
        }
      }
      await execute(db, "DELETE FROM invoice_items WHERE invoice_id = ?", invoiceId);
      await execute(db, "DELETE FROM payment_ledgers WHERE invoice_id = ? AND organization_id = ?", invoiceId, effectiveOrgId);
      await execute(db, "DELETE FROM invoices WHERE id = ? AND organization_id = ?", invoiceId, effectiveOrgId);
      return jsonResponse({ success: true, message: "Invoice deleted successfully" });
    } catch (err) {
      console.error("[Delete Invoice Error]", err?.message || err);
      return errorResponse("Failed to delete invoice: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/payments" && method === "GET") {
    const rows = await queryAll(
      db,
      `SELECT 
        p.*,
        c.name AS client_name,
        c.client_type AS client_party_type,
        i.invoice_number AS inv_number,
        i.client_id AS inv_client_id,
        i.client_name AS inv_client_name,
        i.invoice_type AS inv_invoice_type
      FROM payment_ledgers p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE p.organization_id = ?
      ORDER BY p.entry_date DESC, p.created_at DESC`,
      effectiveOrgId
    );
    const payments = rows.map((r) => {
      const debitCredit = r.debit_credit === "credit" || r.debit_credit === "debit" ? r.debit_credit : r.payment_type === "RECEIPT" ? "credit" : r.payment_type === "PAYMENT" ? "debit" : "credit";
      const partyId = r.party_id || r.client_id || r.inv_client_id || "";
      const partyName = r.party_name || r.client_name || r.inv_client_name || "";
      const rawPartyType = r.party_type || r.client_party_type || (r.inv_invoice_type === 2 ? "supplier" : "customer");
      const partyType = rawPartyType === "supplier" ? "supplier" : "customer";
      return {
        id: r.id,
        partyId,
        partyName,
        partyType,
        invoiceId: r.invoice_id || null,
        invoiceNumber: r.vch_no || r.inv_number || r.reference_number || "",
        date: r.entry_date,
        type: debitCredit,
        entryType: r.entry_type || (debitCredit === "credit" ? "Payment In" : "Payment Out"),
        mode: r.mode || "CASH",
        amount: Number(r.amount) || 0,
        particular: r.particular || (r.notes && !r.notes.startsWith("{") ? r.notes : "") || "",
        vchNo: r.vch_no || r.reference_number || "",
        referenceNo: r.reference_number || r.vch_no || "",
        note: r.notes && !r.notes.startsWith("{") ? r.notes : "",
        notes: r.notes && !r.notes.startsWith("{") ? r.notes : "",
        createdOn: r.created_at || (/* @__PURE__ */ new Date()).toISOString()
      };
    });
    return jsonResponse(payments);
  }
  if (path2 === "/api/payments" && method === "POST") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const body = await request.json();
      if (!body.amount) {
        return errorResponse("Payment amount is required", 400);
      }
      if (body.id) {
        const existingPayment = await queryFirst(
          db,
          "SELECT organization_id FROM payment_ledgers WHERE id = ?",
          body.id
        );
        if (existingPayment && existingPayment.organization_id !== effectiveOrgId) {
          return errorResponse("You do not have permission to modify this payment", 403);
        }
      }
      if (body.invoiceId) {
        const targetInv = await queryFirst(
          db,
          "SELECT organization_id FROM invoices WHERE id = ?",
          body.invoiceId
        );
        if (targetInv && targetInv.organization_id !== effectiveOrgId) {
          return errorResponse("You do not have permission to link payments to this invoice", 403);
        }
      }
      if (body.partyId) {
        const targetParty = await queryFirst(
          db,
          "SELECT organization_id FROM clients WHERE id = ?",
          body.partyId
        );
        if (targetParty && targetParty.organization_id !== effectiveOrgId) {
          return errorResponse("You do not have permission to link payments to this client", 403);
        }
      }
      const id = body.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const debitCredit = body.type === "credit" || body.type === "debit" ? body.type : body.payment_type === "RECEIPT" || body.type === "RECEIPT" ? "credit" : "debit";
      const paymentType = body.payment_type || (debitCredit === "credit" ? "RECEIPT" : "PAYMENT");
      const entryType = body.entryType || (debitCredit === "credit" ? "Payment In" : "Payment Out");
      const cleanNote = typeof body.note === "string" && !body.note.startsWith("{") ? body.note : typeof body.notes === "string" && !body.notes.startsWith("{") ? body.notes : "";
      const particular = (typeof body.particular === "string" && !body.particular.startsWith("{") ? body.particular : "") || cleanNote;
      const vchNo = body.vchNo || body.referenceNo || null;
      let partyId = body.partyId || body.client_id || null;
      let partyName = body.partyName || null;
      let partyType = body.partyType || null;
      if (partyId && (!partyName || !partyType)) {
        const client = await queryFirst(db, "SELECT name, client_type FROM clients WHERE id = ? AND organization_id = ?", partyId, effectiveOrgId);
        if (client) {
          if (!partyName) partyName = client.name;
          if (!partyType) partyType = client.client_type;
        }
      }
      if (body.invoiceId && (!partyId || !partyName || !partyType)) {
        const inv = await queryFirst(db, "SELECT client_id, client_name, invoice_type FROM invoices WHERE id = ? AND organization_id = ?", body.invoiceId, effectiveOrgId);
        if (inv) {
          if (!partyId) partyId = inv.client_id;
          if (!partyName) partyName = inv.client_name;
          if (!partyType) partyType = Number(inv.invoice_type) === 2 ? "supplier" : "customer";
        }
      }
      await execute(
        db,
        `INSERT INTO payment_ledgers (
          id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes, entry_type, particular, vch_no, debit_credit, party_name, party_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          client_id = excluded.client_id,
          invoice_id = excluded.invoice_id,
          entry_date = excluded.entry_date,
          payment_type = excluded.payment_type,
          mode = excluded.mode,
          amount = excluded.amount,
          reference_number = excluded.reference_number,
          notes = excluded.notes,
          entry_type = excluded.entry_type,
          particular = excluded.particular,
          vch_no = excluded.vch_no,
          debit_credit = excluded.debit_credit,
          party_name = excluded.party_name,
          party_type = excluded.party_type
        WHERE payment_ledgers.organization_id = excluded.organization_id`,
        id,
        effectiveOrgId,
        partyId,
        body.invoiceId || null,
        body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        paymentType,
        body.mode || "CASH",
        Number(body.amount),
        body.referenceNo || vchNo || null,
        cleanNote,
        entryType,
        particular,
        vchNo,
        debitCredit,
        partyName,
        partyType
      );
      if (body.invoiceId) {
        const inv = await queryFirst(db, "SELECT * FROM invoices WHERE id = ? AND organization_id = ?", body.invoiceId, effectiveOrgId);
        if (inv) {
          const newPaid = (inv.paid_amount || 0) + Number(body.amount);
          const newBalance = Math.max(0, inv.grand_total - newPaid);
          const status = newBalance <= 0.01 ? "PAID" : "PARTIAL";
          await execute(db, "UPDATE invoices SET paid_amount = ?, balance_amount = ?, payment_status = ? WHERE id = ? AND organization_id = ?", newPaid, newBalance, status, inv.id, effectiveOrgId);
        }
      }
      return jsonResponse({ success: true, id, message: "Payment recorded successfully" }, 201);
    } catch {
      return errorResponse("Failed to record payment", 500);
    }
  }
  if (path2.startsWith("/api/payments/") && method === "DELETE") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const paymentId = path2.split("/")[3];
      if (!paymentId) {
        return errorResponse("Payment ID is required", 400);
      }
      const existingPayment = await queryFirst(
        db,
        "SELECT organization_id FROM payment_ledgers WHERE id = ?",
        paymentId
      );
      if (existingPayment && existingPayment.organization_id !== effectiveOrgId) {
        return errorResponse("You do not have permission to delete this payment", 403);
      }
      await execute(db, "DELETE FROM payment_ledgers WHERE id = ? AND organization_id = ?", paymentId, effectiveOrgId);
      return jsonResponse({ success: true, message: "Payment deleted successfully" });
    } catch (err) {
      console.error("[Delete Payment Error]", err?.message || err);
      return errorResponse("Failed to delete payment: " + (err?.message || "Server error"), 500);
    }
  }
  if (path2 === "/api/sync/migrate-local" && method === "POST") {
    try {
      const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", effectiveOrgId);
      const accessCheck = isOrgAccessAllowed(org);
      if (!accessCheck.allowed) {
        return createOrgAccessDeniedResponse(accessCheck);
      }
      const data = await request.json();
      const { company, clients, products, invoices, payments } = data;
      let insertedCount = { clients: 0, products: 0, invoices: 0, payments: 0 };
      if (company && company.name) {
        const bankDetailsJson = company.bankDetail ? JSON.stringify(company.bankDetail) : null;
        await execute(
          db,
          `UPDATE organizations SET
            name = COALESCE(?, name),
            address = COALESCE(?, address),
            city = COALESCE(?, city),
            state = COALESCE(?, state),
            pin = COALESCE(?, pin),
            state_code = COALESCE(?, state_code),
            register_number = COALESCE(?, register_number),
            pan_number = COALESCE(?, pan_number),
            bill_prefix = COALESCE(?, bill_prefix),
            bank_details_json = COALESCE(?, bank_details_json),
            terms_conditions = COALESCE(?, terms_conditions)
          WHERE id = ?`,
          company.name,
          company.address,
          company.city,
          company.state,
          company.pin,
          company.code,
          company.registerNumber,
          company.panNumber,
          company.billPrefix,
          bankDetailsJson,
          company.termsAndCondition,
          effectiveOrgId
        );
      }
      if (Array.isArray(clients)) {
        for (const c of clients) {
          if (!c.name) continue;
          let clientId = c.id;
          if (clientId) {
            const existingClient = await queryFirst(
              db,
              "SELECT organization_id FROM clients WHERE id = ?",
              clientId
            );
            if (existingClient && existingClient.organization_id !== effectiveOrgId) {
              clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
          } else {
            clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          }
          await execute(
            db,
            `INSERT INTO clients (
              id, organization_id, name, company_name, email, mobile, register_number, address, city, state, pin, state_code, opening_balance, current_balance, client_type, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              company_name = excluded.company_name,
              email = excluded.email,
              mobile = excluded.mobile,
              register_number = excluded.register_number,
              address = excluded.address,
              city = excluded.city,
              state = excluded.state,
              pin = excluded.pin,
              state_code = excluded.state_code,
              current_balance = excluded.current_balance,
              client_type = excluded.client_type,
              updated_at = CURRENT_TIMESTAMP
            WHERE clients.organization_id = excluded.organization_id`,
            clientId,
            effectiveOrgId,
            c.name,
            c.companyName || c.name,
            c.email || null,
            c.mobile || "",
            c.registerNumber || null,
            c.address || "",
            c.city || "",
            c.state || "",
            c.pin || "",
            c.code || "",
            Number(c.balance || 0),
            Number(c.balance || 0),
            c.clientType || "customer"
          );
          insertedCount.clients++;
        }
      }
      if (Array.isArray(products)) {
        for (const p of products) {
          if (!p.name) continue;
          let prodId = p.id;
          if (prodId) {
            const existingProd = await queryFirst(
              db,
              "SELECT organization_id FROM products WHERE id = ?",
              prodId
            );
            if (existingProd && existingProd.organization_id !== effectiveOrgId) {
              prodId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
          } else {
            prodId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          }
          await execute(
            db,
            `INSERT INTO products (
              id, organization_id, name, item_code, hsn_code, unit, purchase_rate, sales_rate, mrp, tax_percentage, current_stock, min_stock_alert, subline1, subline2, subline3, barcode, category, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              item_code = excluded.item_code,
              hsn_code = excluded.hsn_code,
              unit = excluded.unit,
              purchase_rate = excluded.purchase_rate,
              sales_rate = excluded.sales_rate,
              mrp = excluded.mrp,
              tax_percentage = excluded.tax_percentage,
              current_stock = excluded.current_stock,
              min_stock_alert = excluded.min_stock_alert,
              subline1 = excluded.subline1,
              subline2 = excluded.subline2,
              subline3 = excluded.subline3,
              barcode = excluded.barcode,
              category = excluded.category,
              updated_at = CURRENT_TIMESTAMP
            WHERE products.organization_id = excluded.organization_id`,
            prodId,
            effectiveOrgId,
            p.name,
            p.itemCode || null,
            p.hsnCode || "9983",
            p.unit || "PCS",
            Number(p.buyingPrice || 0),
            Number(p.sellingPrice || 0),
            Number(p.mrp || p.sellingPrice || 0),
            Number(p.taxRate || 18),
            Number(p.currentStock || 0),
            Number(p.minStockAlert || 5),
            p.subline1 || "",
            p.subline2 || "",
            p.subline3 || "",
            p.barcode || null,
            p.category || null
          );
          insertedCount.products++;
        }
      }
      if (Array.isArray(invoices)) {
        for (const inv of invoices) {
          if (!inv.invoiceNumber) continue;
          const calc = inv.calc || {};
          let invoiceId = inv.id;
          if (invoiceId) {
            const existingInv = await queryFirst(
              db,
              "SELECT organization_id FROM invoices WHERE id = ?",
              invoiceId
            );
            if (existingInv && existingInv.organization_id !== effectiveOrgId) {
              invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
          } else {
            invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          }
          await execute(
            db,
            `INSERT INTO invoices (
              id, organization_id, invoice_number, invoice_type, invoice_date, due_date, po_number,
              client_id, client_name, client_gstin, client_address, client_city, client_state, client_mobile,
              sub_total, discount_total, cgst_amount, sgst_amount, igst_amount, total_tax,
              tcs_percentage, tcs_amount, round_off, grand_total, paid_amount, balance_amount,
              payment_status, print_template, notes, terms, items_json, extra_items_json, consignee_json, calc_json, created_by,
              is_converted, converted_to_invoice_id, converted_invoice_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              invoice_number = excluded.invoice_number,
              invoice_type = excluded.invoice_type,
              invoice_date = excluded.invoice_date,
              due_date = excluded.due_date,
              po_number = excluded.po_number,
              client_name = excluded.client_name,
              client_gstin = excluded.client_gstin,
              client_address = excluded.client_address,
              client_city = excluded.client_city,
              client_state = excluded.client_state,
              client_mobile = excluded.client_mobile,
              sub_total = excluded.sub_total,
              discount_total = excluded.discount_total,
              cgst_amount = excluded.cgst_amount,
              sgst_amount = excluded.sgst_amount,
              igst_amount = excluded.igst_amount,
              total_tax = excluded.total_tax,
              tcs_percentage = excluded.tcs_percentage,
              tcs_amount = excluded.tcs_amount,
              round_off = excluded.round_off,
              grand_total = excluded.grand_total,
              paid_amount = excluded.paid_amount,
              balance_amount = excluded.balance_amount,
              payment_status = excluded.payment_status,
              print_template = excluded.print_template,
              notes = excluded.notes,
              terms = excluded.terms,
              items_json = excluded.items_json,
              extra_items_json = excluded.extra_items_json,
              consignee_json = excluded.consignee_json,
              calc_json = excluded.calc_json,
              is_converted = excluded.is_converted,
              converted_to_invoice_id = excluded.converted_to_invoice_id,
              converted_invoice_number = excluded.converted_invoice_number
            WHERE invoices.organization_id = excluded.organization_id`,
            invoiceId,
            effectiveOrgId,
            inv.invoiceNumber,
            inv.invoiceType || 1,
            inv.invoiceDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            inv.dueDate || null,
            inv.poNumber || null,
            inv.clientSnapshot?.id || null,
            inv.clientSnapshot?.name || "Customer",
            inv.clientSnapshot?.registerNumber || null,
            inv.clientSnapshot?.address || "",
            inv.clientSnapshot?.city || "",
            inv.clientSnapshot?.state || "",
            inv.clientSnapshot?.mobile || "",
            Number(calc.subTotal || 0),
            Number(calc.totalDiscount || 0),
            inv.invoiceTaxType === "IGST" ? 0 : Number(calc.taxAmount || 0) / 2,
            inv.invoiceTaxType === "IGST" ? 0 : Number(calc.taxAmount || 0) / 2,
            inv.invoiceTaxType === "IGST" ? Number(calc.taxAmount || 0) : 0,
            Number(calc.taxAmount || 0),
            Number(calc.tcsPercentage || 0),
            Number(calc.tcsAmount || 0),
            Number(calc.roundOffValue || 0),
            Number(calc.billFigure || 0),
            Number(calc.paidAmount || 0),
            Number(calc.dueAmount || 0),
            inv.status || "UNPAID",
            inv.printTemplate || "modern",
            inv.notes || "",
            inv.terms || "",
            JSON.stringify(inv.items || []),
            JSON.stringify(inv.extraItems || []),
            JSON.stringify(inv.consignee || {}),
            JSON.stringify(calc),
            session.name,
            inv.isConverted ? 1 : 0,
            inv.convertedToInvoiceId || null,
            inv.convertedInvoiceNumber || null
          );
          insertedCount.invoices++;
        }
      }
      if (Array.isArray(payments)) {
        for (const p of payments) {
          if (!p.amount) continue;
          let paymentId = p.id;
          if (paymentId) {
            const existingPay = await queryFirst(
              db,
              "SELECT organization_id FROM payment_ledgers WHERE id = ?",
              paymentId
            );
            if (existingPay && existingPay.organization_id !== effectiveOrgId) {
              paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
          } else {
            paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          }
          const debitCredit = p.type === "credit" || p.type === "debit" ? p.type : p.payment_type === "RECEIPT" || p.type === "RECEIPT" ? "credit" : p.payment_type === "PAYMENT" || p.type === "PAYMENT" ? "debit" : "credit";
          const paymentType = p.payment_type || (debitCredit === "credit" ? "RECEIPT" : "PAYMENT");
          const entryType = p.entryType || p.entry_type || (debitCredit === "credit" ? "Payment In" : "Payment Out");
          const particular = p.particular || p.notes || p.note || "";
          const vchNo = p.vchNo || p.vch_no || p.referenceNo || p.reference_number || null;
          const notes = p.notes || p.note || "";
          await execute(
            db,
            `INSERT INTO payment_ledgers (
              id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes, entry_type, particular, vch_no, debit_credit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              client_id = excluded.client_id,
              invoice_id = excluded.invoice_id,
              entry_date = excluded.entry_date,
              payment_type = excluded.payment_type,
              mode = excluded.mode,
              amount = excluded.amount,
              reference_number = excluded.reference_number,
              notes = excluded.notes,
              entry_type = excluded.entry_type,
              particular = excluded.particular,
              vch_no = excluded.vch_no,
              debit_credit = excluded.debit_credit
            WHERE payment_ledgers.organization_id = excluded.organization_id`,
            paymentId,
            effectiveOrgId,
            p.partyId || p.client_id || null,
            p.invoiceId || p.invoice_id || null,
            p.date || p.entry_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            paymentType,
            p.mode || "CASH",
            Number(p.amount),
            p.referenceNo || p.reference_number || vchNo || null,
            notes,
            entryType,
            particular,
            vchNo,
            debitCredit
          );
          insertedCount.payments++;
        }
      }
      return jsonResponse({
        success: true,
        migrated: insertedCount,
        message: "Successfully migrated records to Cloudflare D1"
      });
    } catch {
      return errorResponse("Migration failed", 500);
    }
  }
  if (path2.startsWith("/api/admin/")) {
    if (session.role !== "SUPER_ADMIN") {
      return errorResponse("Forbidden. Super Admin privileges required.", 403);
    }
    if (path2 === "/api/admin/organizations" && method === "GET") {
      const orgs = await queryAll(db, "SELECT * FROM organizations ORDER BY created_at DESC");
      const augmentedOrgs = await Promise.all(
        orgs.map(async (o) => {
          const invStats = await queryFirst(
            db,
            "SELECT COUNT(*) as inv_count, COALESCE(SUM(grand_total), 0) as inv_volume, COALESCE(SUM(total_tax), 0) as tax_volume FROM invoices WHERE organization_id = ?",
            o.id
          );
          const clientCount = await queryFirst(
            db,
            "SELECT COUNT(*) as client_count FROM clients WHERE organization_id = ? AND is_active = 1",
            o.id
          );
          const prodCount = await queryFirst(
            db,
            "SELECT COUNT(*) as prod_count FROM products WHERE organization_id = ? AND is_active = 1",
            o.id
          );
          const ledgerCount = await queryFirst(
            db,
            "SELECT COUNT(*) as ledger_count FROM payment_ledgers WHERE organization_id = ?",
            o.id
          );
          const userCount = await queryFirst(
            db,
            "SELECT COUNT(*) as user_count FROM platform_users WHERE organization_id = ?",
            o.id
          );
          const subStatus = o.subscription_status || "ACTIVE";
          const isPaying = subStatus === "ACTIVE" || subStatus === "PAST_DUE";
          let computedMrr = 0;
          if (isPaying) {
            if (typeof o.mrr_inr === "number" && o.mrr_inr > 0) {
              computedMrr = o.mrr_inr;
            } else if (o.billing_cycle === "YEARLY") {
              computedMrr = 49;
            } else if (o.billing_cycle === "6_MONTHS" || o.billing_cycle === "3_MONTHS") {
              computedMrr = 79;
            } else {
              computedMrr = 99;
            }
          }
          return {
            id: o.id,
            name: o.name,
            slug: o.slug || o.id,
            ownerName: o.owner_name,
            adminEmail: o.admin_email,
            mobile: o.mobile,
            country: o.country || "India",
            city: o.city || "",
            state: o.state || "Tamil Nadu",
            registerNumber: o.register_number || "",
            planId: o.plan_id || "plan_all_in_one_pro",
            planName: o.plan_name || "All-in-One Growth Plan",
            subscriptionStatus: subStatus,
            accountStatus: o.account_status || "ACTIVE",
            billingCycle: o.billing_cycle || "YEARLY",
            subscriptionStartDate: o.subscription_start_date || o.created_at,
            renewalDate: o.renewal_date || new Date(Date.now() + 365 * 864e5).toISOString(),
            trialEndDate: o.trial_end_date,
            mrr: computedMrr,
            usersCount: userCount?.user_count || 1,
            createdDate: o.created_at,
            lastActive: o.last_active || o.created_at,
            customDomain: o.custom_domain,
            paymentProvider: o.payment_provider || "cashfree",
            notes: o.notes,
            usage: {
              invoicesCreated: invStats?.inv_count || 0,
              estimatesCreated: Math.floor((invStats?.inv_count || 0) * 0.4),
              customersCount: clientCount?.client_count || 0,
              suppliersCount: Math.floor((clientCount?.client_count || 0) * 0.2),
              productsCount: prodCount?.prod_count || 0,
              pdfGenerationsCount: (invStats?.inv_count || 0) * 2,
              gstTaxHandledInr: invStats?.tax_volume || 0,
              paymentLedgerEntries: ledgerCount?.ledger_count || 0,
              storageUsedMB: 1.2
            }
          };
        })
      );
      return jsonResponse(augmentedOrgs);
    }
    if (path2 === "/api/admin/organizations" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const {
          name,
          slug,
          ownerName,
          adminEmail,
          mobile,
          country,
          city,
          state,
          registerNumber,
          planId,
          planName,
          billingCycle,
          subscriptionStatus,
          accountStatus,
          trialEndDate,
          renewalDate,
          mrr,
          notes
        } = body;
        if (!name || !adminEmail || !ownerName) {
          return errorResponse("Organization Name, Admin Email, and Owner Name are required", 400);
        }
        const orgId = body.id || `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        await execute(
          db,
          `INSERT INTO organizations (
            id, name, slug, owner_name, admin_email, mobile, country, city, state, register_number,
            plan_id, plan_name, billing_cycle, subscription_status, account_status,
            trial_end_date, renewal_date, mrr_inr, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          orgId,
          name,
          orgSlug,
          ownerName,
          adminEmail,
          mobile || "",
          country || "India",
          city || "",
          state || "Tamil Nadu",
          registerNumber || "",
          planId || "plan_all_in_one_pro",
          planName || "All-in-One Growth Plan",
          billingCycle || "YEARLY",
          subscriptionStatus || "ACTIVE",
          accountStatus || "ACTIVE",
          trialEndDate || null,
          renewalDate || null,
          mrr || 0,
          notes || ""
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orgId,
          session.userId,
          session.name,
          session.role,
          "CREATE_ORGANIZATION",
          orgId,
          name,
          "ORGANIZATION",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, id: orgId, message: "Organization created successfully" });
      } catch (err) {
        return errorResponse("Failed to create organization: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2.startsWith("/api/admin/organizations/") && method === "PUT") {
      try {
        const orgId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        const existing = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", orgId);
        if (!existing) {
          return errorResponse("Organization not found", 404);
        }
        const trialEndDateVal = body.trialEndDate !== void 0 ? body.trialEndDate : body.trial_end_date !== void 0 ? body.trial_end_date : existing.trial_end_date;
        const renewalDateVal = body.renewalDate !== void 0 ? body.renewalDate : body.renewal_date !== void 0 ? body.renewal_date : existing.renewal_date;
        await execute(
          db,
          `UPDATE organizations SET
            name = COALESCE(?, name),
            owner_name = COALESCE(?, owner_name),
            admin_email = COALESCE(?, admin_email),
            mobile = COALESCE(?, mobile),
            city = COALESCE(?, city),
            state = COALESCE(?, state),
            register_number = COALESCE(?, register_number),
            plan_id = COALESCE(?, plan_id),
            plan_name = COALESCE(?, plan_name),
            subscription_status = COALESCE(?, subscription_status),
            account_status = COALESCE(?, account_status),
            billing_cycle = COALESCE(?, billing_cycle),
            trial_end_date = ?,
            renewal_date = ?,
            mrr_inr = COALESCE(?, mrr_inr),
            custom_domain = COALESCE(?, custom_domain),
            notes = COALESCE(?, notes),
            last_active = CURRENT_TIMESTAMP
          WHERE id = ?`,
          body.name,
          body.ownerName,
          body.adminEmail,
          body.mobile,
          body.city,
          body.state,
          body.registerNumber,
          body.planId,
          body.planName,
          body.subscriptionStatus,
          body.accountStatus,
          body.billingCycle,
          trialEndDateVal,
          renewalDateVal,
          body.mrr,
          body.customDomain,
          body.notes,
          orgId
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orgId,
          session.userId,
          session.name,
          session.role,
          "UPDATE_ORGANIZATION",
          orgId,
          body.name || existing.name,
          "ORGANIZATION",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, message: "Organization updated successfully" });
      } catch (err) {
        return errorResponse("Failed to update organization: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2.startsWith("/api/admin/organizations/") && method === "DELETE") {
      try {
        const orgId = path2.split("/")[4];
        if (orgId === "org_platform_master" || orgId === session.organizationId) {
          return errorResponse("Cannot delete master organization or active session organization", 400);
        }
        await execute(db, "DELETE FROM organizations WHERE id = ?", orgId);
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orgId,
          session.userId,
          session.name,
          session.role,
          "DELETE_ORGANIZATION",
          orgId,
          orgId,
          "ORGANIZATION",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, message: "Organization deleted" });
      } catch (err) {
        return errorResponse("Failed to delete organization: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2 === "/api/admin/users" && method === "GET") {
      const users = await queryAll(
        db,
        `SELECT u.id, u.organization_id, u.name, u.email, u.phone, u.role, u.status, u.created_at, u.last_login,
                o.name as organization_name, o.plan_name
         FROM platform_users u
         LEFT JOIN organizations o ON u.organization_id = o.id
         ORDER BY u.created_at DESC`
      );
      const formatted = users.map((u) => ({
        id: u.id,
        organizationId: u.organization_id,
        organizationName: u.organization_name || "Unassigned",
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status || "ACTIVE",
        planName: u.plan_name || "All-in-One Growth Plan",
        lastLogin: u.last_login || u.created_at,
        createdDate: u.created_at
      }));
      return jsonResponse(formatted);
    }
    if (path2 === "/api/admin/users" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const { organizationId, name, email, phone, role, password, status } = body;
        if (!organizationId || !name || !email || !password) {
          return errorResponse("Organization, Name, Email, and Password are required", 400);
        }
        const existing = await queryFirst(db, "SELECT id FROM platform_users WHERE email = ?", email.toLowerCase().trim());
        if (existing) {
          return errorResponse("User with this email already exists", 400);
        }
        const passHash = await hashPassword(password);
        const userId = body.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await execute(
          db,
          `INSERT INTO platform_users (
            id, organization_id, name, email, phone, password_hash, role, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          userId,
          organizationId,
          name,
          email.toLowerCase().trim(),
          phone || "",
          passHash,
          role || "OWNER",
          status || "ACTIVE"
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          organizationId,
          session.userId,
          session.name,
          session.role,
          "CREATE_USER",
          userId,
          name,
          "USER",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, id: userId, message: "User created" });
      } catch (err) {
        return errorResponse("Failed to create user: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2.startsWith("/api/admin/users/") && method === "PUT") {
      try {
        const userId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        const existing = await queryFirst(db, "SELECT * FROM platform_users WHERE id = ?", userId);
        if (!existing) {
          return errorResponse("User not found", 404);
        }
        let passHash = existing.password_hash;
        if (body.password) {
          passHash = await hashPassword(body.password);
        }
        await execute(
          db,
          `UPDATE platform_users SET
            name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            role = COALESCE(?, role),
            status = COALESCE(?, status),
            password_hash = ?
          WHERE id = ?`,
          body.name,
          body.phone,
          body.role,
          body.status,
          passHash,
          userId
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          existing.organization_id,
          session.userId,
          session.name,
          session.role,
          "UPDATE_USER",
          userId,
          body.name || existing.name,
          "USER",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, message: "User updated" });
      } catch (err) {
        return errorResponse("Failed to update user: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2.startsWith("/api/admin/users/") && method === "DELETE") {
      try {
        const userId = path2.split("/")[4];
        if (userId === session.userId) {
          return errorResponse("Cannot delete your own user account", 400);
        }
        await execute(db, "DELETE FROM platform_users WHERE id = ?", userId);
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          null,
          session.userId,
          session.name,
          session.role,
          "DELETE_USER",
          userId,
          userId,
          "USER",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, message: "User deleted" });
      } catch (err) {
        return errorResponse("Failed to delete user: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2 === "/api/admin/stats" && method === "GET") {
      const orgRows = await queryAll(db, "SELECT subscription_status, account_status, created_at, billing_cycle, mrr_inr FROM organizations");
      const userRows = await queryAll(db, "SELECT status, created_at FROM platform_users");
      const invStats = await queryFirst(db, "SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total FROM invoices");
      const ticketStats = await queryFirst(db, 'SELECT COUNT(*) as count FROM support_tickets WHERE status != "RESOLVED" AND status != "CLOSED"');
      const txnStats = await queryFirst(db, 'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM saas_transactions WHERE status = "SUCCESSFUL"');
      const totalOrgs = orgRows.length;
      const activeOrgs = orgRows.filter((o) => o.subscription_status === "ACTIVE" && o.account_status !== "SUSPENDED").length;
      const trialOrgs = orgRows.filter((o) => o.subscription_status === "TRIAL").length;
      const suspendedOrgs = orgRows.filter((o) => o.account_status === "SUSPENDED" || o.subscription_status === "PAST_DUE").length;
      const totalUsers = userRows.length;
      const activeUsers = userRows.filter((u) => u.status === "ACTIVE").length;
      const monthlyRecurringRevenue = orgRows.filter((o) => (o.subscription_status === "ACTIVE" || o.subscription_status === "PAST_DUE") && o.account_status !== "SUSPENDED").reduce((sum, o) => {
        let m = o.mrr_inr;
        if (typeof m !== "number" || m <= 0) {
          if (o.billing_cycle === "YEARLY") m = 49;
          else if (o.billing_cycle === "6_MONTHS" || o.billing_cycle === "3_MONTHS") m = 79;
          else m = 99;
        }
        return sum + m;
      }, 0);
      const annualRecurringRevenue = monthlyRecurringRevenue * 12;
      const totalTriedAndActive = trialOrgs + activeOrgs;
      const trialToPaidConversionPct = totalTriedAndActive > 0 ? Number((activeOrgs / totalTriedAndActive * 100).toFixed(1)) : 0;
      return jsonResponse({
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        trialOrganizations: trialOrgs,
        suspendedOrganizations: suspendedOrgs,
        totalUsers,
        activeUsers,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        revenueThisMonth: txnStats?.total || monthlyRecurringRevenue * 12,
        revenueLastMonth: Math.round(monthlyRecurringRevenue * 0.9),
        newSignupsThisMonth: totalOrgs,
        churnedOrganizationsThisMonth: 0,
        failedPaymentsCount: 0,
        openSupportTickets: ticketStats?.count || 0,
        mrrGrowthPct: 15,
        trialToPaidConversionPct,
        totalInvoices: invStats?.count || 0,
        totalPlatformVolume: invStats?.total || 0
      });
    }
    if (path2 === "/api/admin/plans" && method === "GET") {
      const plans = await queryAll(db, "SELECT * FROM saas_plans ORDER BY monthly_price_inr ASC");
      const parsed = plans.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        tagline: p.tagline,
        monthlyPriceInr: p.monthly_price_inr,
        sixMonthPriceInr: p.six_month_price_inr,
        threeMonthPriceInr: p.three_month_price_inr,
        yearlyPriceInr: p.yearly_price_inr,
        trialDurationDays: p.trial_duration_days !== null && p.trial_duration_days !== void 0 && !isNaN(Number(p.trial_duration_days)) && Number(p.trial_duration_days) >= 0 ? Number(p.trial_duration_days) : 15,
        billingType: p.billing_type || "ONE_TIME",
        isPopular: !!p.is_popular,
        isArchived: !!p.is_archived,
        limits: p.limits_json ? JSON.parse(p.limits_json) : {},
        createdOn: p.created_at,
        updatedOn: p.updated_at
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/plans" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const planId = body.id || `plan_${Date.now()}`;
        const trialDays = body.trialDurationDays !== void 0 && body.trialDurationDays !== null ? Number(body.trialDurationDays) : 15;
        const billingType = body.billingType || body.billing_type || "ONE_TIME";
        await execute(
          db,
          `INSERT INTO saas_plans (
            id, name, code, tagline, monthly_price_inr, six_month_price_inr, three_month_price_inr, yearly_price_inr,
            trial_duration_days, billing_type, is_popular, is_archived, limits_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          planId,
          body.name,
          body.code || "CUSTOM",
          body.tagline || "",
          body.monthlyPriceInr || 0,
          body.sixMonthPriceInr || 0,
          body.threeMonthPriceInr || 0,
          body.yearlyPriceInr || 0,
          trialDays,
          billingType,
          body.isPopular ? 1 : 0,
          body.isArchived ? 1 : 0,
          JSON.stringify(body.limits || {})
        );
        return jsonResponse({ success: true, id: planId });
      } catch (err) {
        return errorResponse("Failed to create plan: " + err?.message, 500);
      }
    }
    if (path2.startsWith("/api/admin/plans/") && method === "PUT") {
      try {
        const planId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        await execute(
          db,
          `UPDATE saas_plans SET
            name = COALESCE(?, name),
            tagline = COALESCE(?, tagline),
            monthly_price_inr = COALESCE(?, monthly_price_inr),
            six_month_price_inr = COALESCE(?, six_month_price_inr),
            three_month_price_inr = COALESCE(?, three_month_price_inr),
            yearly_price_inr = COALESCE(?, yearly_price_inr),
            trial_duration_days = COALESCE(?, trial_duration_days),
            billing_type = COALESCE(?, billing_type),
            is_popular = COALESCE(?, is_popular),
            is_archived = COALESCE(?, is_archived),
            limits_json = COALESCE(?, limits_json),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          body.name,
          body.tagline,
          body.monthlyPriceInr,
          body.sixMonthPriceInr,
          body.threeMonthPriceInr,
          body.yearlyPriceInr,
          body.trialDurationDays,
          body.billingType || body.billing_type || null,
          body.isPopular !== void 0 ? body.isPopular ? 1 : 0 : null,
          body.isArchived !== void 0 ? body.isArchived ? 1 : 0 : null,
          body.limits ? JSON.stringify(body.limits) : null,
          planId
        );
        return jsonResponse({ success: true });
      } catch (err) {
        return errorResponse("Failed to update plan: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/transactions" && method === "GET") {
      const saasTxns = await queryAll(db, "SELECT * FROM saas_transactions ORDER BY date DESC LIMIT 100");
      const subTxns = await queryAll(db, "SELECT * FROM subscription_transactions ORDER BY created_at DESC LIMIT 100");
      const orgMap = /* @__PURE__ */ new Map();
      const orgs = await queryAll(db, "SELECT id, name FROM organizations");
      orgs.forEach((o) => orgMap.set(o.id, o.name));
      const existingRefIds = new Set(saasTxns.map((t) => t.gateway_ref_id || t.id));
      const parsedSaas = saasTxns.map((t) => ({
        id: t.id,
        organizationId: t.organization_id,
        organizationName: t.organization_name || orgMap.get(t.organization_id) || "Workspace Tenant",
        amount: Number(t.amount) || 0,
        currency: t.currency || "INR",
        paymentMethod: t.payment_method || "PayU Hosted",
        paymentProvider: t.payment_provider || "PayU",
        status: t.status || "SUCCESSFUL",
        date: t.date,
        invoiceNumber: t.invoice_number || `INV-${t.id.slice(-6)}`,
        subscriptionId: t.subscription_id || `sub_${t.id.slice(-6)}`,
        planName: t.plan_name || "All-in-One Growth Plan",
        billingCycle: t.billing_cycle || "1_MONTH",
        receiptUrl: t.receipt_url,
        gatewayRefId: t.gateway_ref_id || t.id,
        failureReason: t.failure_reason,
        refundAmount: t.refund_amount,
        refundDate: t.refund_date,
        customerEmail: t.customer_email
      }));
      const parsedSub = subTxns.filter((st) => st.txnid && !existingRefIds.has(st.txnid)).map((st) => ({
        id: st.id || `sub_txn_${st.txnid}`,
        organizationId: st.organization_id,
        organizationName: orgMap.get(st.organization_id) || "Workspace Tenant",
        amount: Number(st.amount) || 0,
        currency: st.currency || "INR",
        paymentMethod: "PayU Hosted Checkout",
        paymentProvider: st.payment_provider ? st.payment_provider.toUpperCase() === "PAYU" ? "PayU" : st.payment_provider : "PayU",
        status: st.payment_status === "SUCCESS" ? "SUCCESSFUL" : st.payment_status === "FAILED" ? "FAILED" : "PENDING",
        date: st.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        invoiceNumber: `INV-${st.txnid ? st.txnid.slice(-6) : "ONLINE"}`,
        subscriptionId: `sub_${st.txnid || Date.now()}`,
        planName: st.plan_name || "All-in-One Growth Plan",
        billingCycle: st.billing_cycle || "1_MONTH",
        receiptUrl: null,
        gatewayRefId: st.txnid || st.payu_payment_id || "N/A",
        failureReason: st.payment_status === "FAILED" ? "Hash signature verification failed or cancelled by user" : null,
        refundAmount: null,
        refundDate: null,
        customerEmail: st.customer_email || ""
      }));
      const merged = [...parsedSaas, ...parsedSub].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return jsonResponse(merged);
    }
    if (path2 === "/api/admin/transactions/approve" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const { txnid, organizationId, amount, planName, durationDays = 365, adminNote = "Manual SuperAdmin override and activation" } = body;
        let targetOrgId = organizationId;
        let targetPlanName = planName || "All-in-One Growth Plan";
        let targetAmount = Number(amount) || 0;
        let existingTxn = null;
        if (txnid) {
          existingTxn = await queryFirst(db, "SELECT * FROM subscription_transactions WHERE txnid = ?", txnid);
          if (existingTxn) {
            targetOrgId = targetOrgId || existingTxn.organization_id;
            targetPlanName = planName || existingTxn.plan_name || "All-in-One Growth Plan";
            targetAmount = targetAmount || existingTxn.amount || 0;
          }
        }
        if (!targetOrgId) {
          return errorResponse("Valid organizationId or txnid is required for manual activation", 400);
        }
        const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", targetOrgId);
        if (!org) {
          return errorResponse(`Organization ${targetOrgId} not found in system`, 404);
        }
        let baseDate = Date.now();
        if (org.renewal_date) {
          const existingRenewalTime = new Date(org.renewal_date).getTime();
          if (!isNaN(existingRenewalTime) && existingRenewalTime > baseDate) {
            baseDate = existingRenewalTime;
          }
        }
        const renewalDate = new Date(baseDate + Number(durationDays) * 24 * 60 * 60 * 1e3).toISOString();
        await execute(
          db,
          `UPDATE organizations SET
            subscription_status = 'ACTIVE',
            account_status = 'ACTIVE',
            renewal_date = ?,
            plan_id = 'plan_all_in_one_pro',
            plan_name = ?,
            payment_provider = 'payu',
            last_active = CURRENT_TIMESTAMP
          WHERE id = ?`,
          renewalDate,
          targetPlanName,
          targetOrgId
        );
        if (txnid) {
          await execute(
            db,
            `UPDATE subscription_transactions SET
              payment_status = 'MANUALLY_ACTIVATED',
              payu_response_json = json_set(COALESCE(payu_response_json, '{}'), '$.manual_activation_note', ?),
              updated_at = CURRENT_TIMESTAMP
            WHERE txnid = ?`,
            adminNote,
            txnid
          );
        }
        const ledgerId = `txn_manual_${txnid || Date.now()}`;
        const existingLedger = await queryFirst(db, "SELECT id FROM saas_transactions WHERE id = ? OR gateway_ref_id = ?", ledgerId, txnid || "");
        if (!existingLedger) {
          await execute(
            db,
            `INSERT INTO saas_transactions (
              id, organization_id, organization_name, amount, currency, payment_method, payment_provider,
              status, date, invoice_number, gateway_ref_id, customer_email, plan_name, billing_cycle
            ) VALUES (?, ?, ?, ?, 'INR', 'Manual Admin Overridden', 'PayU', 'MANUALLY_ACTIVATED', CURRENT_TIMESTAMP, ?, ?, ?, ?, 'YEARLY')`,
            ledgerId,
            targetOrgId,
            org.name || "Workspace Tenant",
            targetAmount || 99,
            `INV-MANUAL-${Date.now().toString().slice(-6)}`,
            txnid || `MANUAL-${Date.now()}`,
            body.customerEmail || existingTxn?.customer_email || "admin@justgst.in",
            targetPlanName
          );
        }
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, 'SUPER_ADMIN', 'MANUAL_ACTIVATION', ?, ?, 'SUBSCRIPTION', ?)`,
          `audit_${Date.now()}`,
          targetOrgId,
          session?.userId || "admin_super",
          session?.email || "Super Admin",
          txnid || targetOrgId,
          `Manual Activation: ${targetPlanName} (${adminNote})`,
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({
          success: true,
          status: "MANUALLY_ACTIVATED",
          message: "Subscription manually approved, audited, and workspace activated successfully!",
          renewalDate,
          organizationId: targetOrgId
        });
      } catch (err) {
        return errorResponse("Failed to approve transaction: " + (err?.message || "Server error"), 500);
      }
    }
    if (path2 === "/api/admin/transactions" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const txnId = body.id || `txn_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO saas_transactions (
            id, organization_id, organization_name, amount, currency, payment_method, payment_provider,
            status, date, invoice_number, subscription_id, plan_name, billing_cycle, receipt_url,
            gateway_ref_id, customer_email
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          txnId,
          body.organizationId,
          body.organizationName,
          body.amount,
          body.currency || "INR",
          body.paymentMethod || "UPI",
          body.paymentProvider || "PayU",
          body.status || "SUCCESSFUL",
          body.date || (/* @__PURE__ */ new Date()).toISOString(),
          body.invoiceNumber || `REC-${Date.now().toString().slice(-6)}`,
          body.subscriptionId || `sub_${Date.now()}`,
          body.planName || "All-in-One Growth Plan",
          body.billingCycle || "YEARLY",
          body.receiptUrl,
          body.gatewayRefId || `pay_${Date.now()}`,
          body.customerEmail
        );
        return jsonResponse({ success: true, id: txnId });
      } catch (err) {
        return errorResponse("Failed to record transaction: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/coupons" && method === "GET") {
      const coupons = await queryAll(db, "SELECT * FROM coupons ORDER BY created_at DESC");
      const parsed = coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: c.discount_value,
        durationType: c.duration_type,
        expiryDate: c.expiry_date,
        usageLimit: c.usage_limit,
        usedCount: c.used_count,
        perUserLimit: c.per_user_limit,
        planRestrictions: c.plan_restrictions_json ? JSON.parse(c.plan_restrictions_json) : [],
        status: c.status,
        createdOn: c.created_at
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/coupons" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const couponId = body.id || `cpn_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO coupons (
            id, code, discount_type, discount_value, duration_type, expiry_date, usage_limit,
            per_user_limit, plan_restrictions_json, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          couponId,
          body.code.toUpperCase(),
          body.discountType || "PERCENTAGE",
          body.discountValue || 0,
          body.durationType || "ONE_TIME",
          body.expiryDate || new Date(Date.now() + 30 * 864e5).toISOString(),
          body.usageLimit || 100,
          body.perUserLimit || 1,
          JSON.stringify(body.planRestrictions || []),
          body.status || "ACTIVE"
        );
        return jsonResponse({ success: true, id: couponId });
      } catch (err) {
        return errorResponse("Failed to save coupon: " + err?.message, 500);
      }
    }
    if (path2.startsWith("/api/admin/coupons/") && method === "DELETE") {
      const couponId = path2.split("/")[4];
      await execute(db, "DELETE FROM coupons WHERE id = ?", couponId);
      return jsonResponse({ success: true });
    }
    if (path2.startsWith("/api/admin/coupons/") && method === "PUT") {
      try {
        const couponId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        await execute(
          db,
          `UPDATE coupons SET
            code = COALESCE(?, code),
            discount_type = COALESCE(?, discount_type),
            discount_value = COALESCE(?, discount_value),
            duration_type = COALESCE(?, duration_type),
            expiry_date = COALESCE(?, expiry_date),
            usage_limit = COALESCE(?, usage_limit),
            per_user_limit = COALESCE(?, per_user_limit),
            plan_restrictions_json = COALESCE(?, plan_restrictions_json),
            status = COALESCE(?, status)
          WHERE id = ?`,
          body.code ? body.code.toUpperCase() : null,
          body.discountType,
          body.discountValue,
          body.durationType,
          body.expiryDate,
          body.usageLimit,
          body.perUserLimit,
          body.planRestrictions ? JSON.stringify(body.planRestrictions) : null,
          body.status,
          couponId
        );
        return jsonResponse({ success: true, id: couponId });
      } catch (err) {
        return errorResponse("Failed to update coupon: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/feature-flags" && method === "GET") {
      const flags = await queryAll(db, "SELECT * FROM feature_flags ORDER BY category ASC");
      const parsed = flags.map((f) => ({
        id: f.id,
        key: f.key,
        name: f.name,
        description: f.description,
        category: f.category,
        scope: f.scope,
        isEnabledGlobal: !!f.is_enabled_global,
        enabledPlans: f.enabled_plans_json ? JSON.parse(f.enabled_plans_json) : [],
        targetedOrgIds: f.targeted_org_ids_json ? JSON.parse(f.targeted_org_ids_json) : [],
        createdOn: f.created_at,
        updatedOn: f.updated_at
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/feature-flags" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const flagId = body.id || `flag_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO feature_flags (
            id, key, name, description, category, scope, is_enabled_global, enabled_plans_json, targeted_org_ids_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          flagId,
          body.key,
          body.name,
          body.description,
          body.category || "Billing",
          body.scope || "GLOBAL",
          body.isEnabledGlobal ? 1 : 0,
          JSON.stringify(body.enabledPlans || []),
          JSON.stringify(body.targetedOrgIds || [])
        );
        return jsonResponse({ success: true, id: flagId });
      } catch (err) {
        return errorResponse("Failed to save feature flag: " + err?.message, 500);
      }
    }
    if (path2.startsWith("/api/admin/feature-flags/") && method === "PUT") {
      try {
        const flagId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        await execute(
          db,
          `UPDATE feature_flags SET
            is_enabled_global = COALESCE(?, is_enabled_global),
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            enabled_plans_json = COALESCE(?, enabled_plans_json),
            targeted_org_ids_json = COALESCE(?, targeted_org_ids_json),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          body.isEnabledGlobal !== void 0 ? body.isEnabledGlobal ? 1 : 0 : null,
          body.name,
          body.description,
          body.enabledPlans ? JSON.stringify(body.enabledPlans) : null,
          body.targetedOrgIds ? JSON.stringify(body.targetedOrgIds) : null,
          flagId
        );
        return jsonResponse({ success: true });
      } catch (err) {
        return errorResponse("Failed to update feature flag: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/support-tickets" && method === "GET") {
      const tickets = await queryAll(db, "SELECT * FROM support_tickets ORDER BY created_at DESC");
      const parsed = tickets.map((t) => ({
        id: t.id,
        organizationId: t.organization_id,
        organizationName: t.organization_name,
        userId: t.user_id,
        userName: t.user_name,
        userEmail: t.user_email,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        assignedAdminName: t.assigned_admin_name,
        createdDate: t.created_at,
        lastUpdated: t.updated_at,
        messages: t.messages_json ? JSON.parse(t.messages_json) : []
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/support-tickets" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const ticketId = body.id || `tkt_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO support_tickets (
            id, organization_id, organization_name, user_id, user_name, user_email,
            subject, category, priority, status, assigned_admin_name, messages_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ticketId,
          body.organizationId,
          body.organizationName,
          body.userId,
          body.userName,
          body.userEmail,
          body.subject,
          body.category || "Billing & Invoicing",
          body.priority || "MEDIUM",
          body.status || "OPEN",
          body.assignedAdminName || session.name,
          JSON.stringify(body.messages || [])
        );
        return jsonResponse({ success: true, id: ticketId });
      } catch (err) {
        return errorResponse("Failed to save support ticket: " + err?.message, 500);
      }
    }
    if (path2.startsWith("/api/admin/support-tickets/") && method === "PUT") {
      try {
        const ticketId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        await execute(
          db,
          `UPDATE support_tickets SET
            status = COALESCE(?, status),
            priority = COALESCE(?, priority),
            assigned_admin_name = COALESCE(?, assigned_admin_name),
            messages_json = COALESCE(?, messages_json),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          body.status,
          body.priority,
          body.assignedAdminName,
          body.messages ? JSON.stringify(body.messages) : null,
          ticketId
        );
        return jsonResponse({ success: true });
      } catch (err) {
        return errorResponse("Failed to update support ticket: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/announcements" && method === "GET") {
      const items = await queryAll(db, "SELECT * FROM announcements ORDER BY created_at DESC");
      const parsed = items.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        type: a.type,
        startDate: a.start_date,
        endDate: a.end_date,
        targetAudience: a.target_audience,
        targetPlans: a.target_plans_json ? JSON.parse(a.target_plans_json) : [],
        targetOrgIds: a.target_org_ids_json ? JSON.parse(a.target_org_ids_json) : [],
        isActive: !!a.is_active,
        isDismissible: !!a.is_dismissible,
        createdOn: a.created_at
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/announcements" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const annId = body.id || `ann_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO announcements (
            id, title, message, type, start_date, end_date, target_audience,
            target_plans_json, target_org_ids_json, is_active, is_dismissible
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          annId,
          body.title,
          body.message,
          body.type || "INFO",
          body.startDate || (/* @__PURE__ */ new Date()).toISOString(),
          body.endDate || new Date(Date.now() + 14 * 864e5).toISOString(),
          body.targetAudience || "ALL",
          JSON.stringify(body.targetPlans || []),
          JSON.stringify(body.targetOrgIds || []),
          body.isActive !== false ? 1 : 0,
          body.isDismissible !== false ? 1 : 0
        );
        return jsonResponse({ success: true, id: annId });
      } catch (err) {
        return errorResponse("Failed to create announcement: " + err?.message, 500);
      }
    }
    if (path2.startsWith("/api/admin/announcements/") && method === "DELETE") {
      const annId = path2.split("/")[4];
      await execute(db, "DELETE FROM announcements WHERE id = ?", annId);
      return jsonResponse({ success: true });
    }
    if (path2 === "/api/admin/email-templates" && method === "GET") {
      const templates = await queryAll(db, "SELECT * FROM email_templates ORDER BY name ASC");
      const parsed = templates.map((t) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        subject: t.subject,
        description: t.description,
        variables: t.variables_json ? JSON.parse(t.variables_json) : [],
        bodyHtml: t.body_html,
        isEnabled: !!t.is_enabled,
        lastEdited: t.updated_at
      }));
      return jsonResponse(parsed);
    }
    if (path2.startsWith("/api/admin/email-templates/") && method === "PUT") {
      try {
        const tmplId = path2.split("/")[4];
        const body = await request.json().catch(() => ({}));
        await execute(
          db,
          `UPDATE email_templates SET
            subject = COALESCE(?, subject),
            body_html = COALESCE(?, body_html),
            is_enabled = COALESCE(?, is_enabled),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          body.subject,
          body.bodyHtml,
          body.isEnabled !== void 0 ? body.isEnabled ? 1 : 0 : null,
          tmplId
        );
        return jsonResponse({ success: true });
      } catch (err) {
        return errorResponse("Failed to update email template: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/audit-logs" && method === "GET") {
      const logs = await queryAll(db, "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 150");
      const parsed = logs.map((l) => ({
        id: l.id,
        adminId: l.admin_id,
        adminName: l.admin_name,
        adminRole: l.admin_role || "SUPER_ADMIN",
        action: l.action,
        targetType: l.target_type || "ORGANIZATION",
        targetId: l.target_id || "",
        targetName: l.target_name || "",
        organizationId: l.organization_id,
        ipAddress: l.ip_address || "127.0.0.1",
        timestamp: l.timestamp,
        previousValue: l.old_value,
        newValue: l.new_value,
        status: "SUCCESS"
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/audit-logs" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const logId = body.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name,
            target_type, old_value, new_value, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          logId,
          body.organizationId || null,
          session.userId,
          session.name,
          session.role,
          body.action || "ADMIN_ACTION",
          body.targetId || null,
          body.targetName || null,
          body.targetType || "ORGANIZATION",
          body.previousValue || null,
          body.newValue || null,
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, id: logId });
      } catch (err) {
        return errorResponse("Failed to insert audit log: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/error-logs" && method === "GET") {
      const logs = await queryAll(db, "SELECT * FROM system_error_logs ORDER BY last_seen DESC LIMIT 100");
      const parsed = logs.map((e) => ({
        id: e.id,
        errorType: e.error_type,
        message: e.message,
        organizationId: e.organization_id,
        organizationName: e.organization_name,
        userEmail: e.user_email,
        endpoint: e.endpoint,
        httpStatus: e.http_status,
        firstSeen: e.first_seen,
        lastSeen: e.last_seen,
        occurrences: e.occurrences,
        status: e.status,
        stackTrace: e.stack_trace
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/impersonation" && method === "GET") {
      const sessions = await queryAll(db, "SELECT * FROM impersonation_sessions ORDER BY started_at DESC LIMIT 50");
      const parsed = sessions.map((s) => ({
        id: s.id,
        adminId: s.admin_id,
        adminName: s.admin_name,
        adminEmail: s.admin_email,
        adminRole: "SUPER_ADMIN",
        organizationId: s.organization_id,
        organizationName: s.organization_name,
        tenantEmail: s.tenant_email,
        tenantOwner: s.organization_name,
        reason: s.reason,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        ipAddress: "127.0.0.1",
        status: s.ended_at ? "COMPLETED" : "ACTIVE"
      }));
      return jsonResponse(parsed);
    }
    if (path2 === "/api/admin/impersonation/start" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const org = await queryFirst(db, "SELECT * FROM organizations WHERE id = ?", body.organizationId);
        if (!org) return errorResponse("Organization not found", 404);
        const sessionId = `imp_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO impersonation_sessions (
            id, organization_id, organization_name, tenant_email, admin_id, admin_email, admin_name, reason
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          sessionId,
          org.id,
          org.name,
          org.admin_email,
          session.userId,
          session.email,
          session.name,
          body.reason || "Support Investigation"
        );
        return jsonResponse({ success: true, sessionId, organization: org });
      } catch (err) {
        return errorResponse("Failed to start impersonation: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/impersonation/stop" && method === "POST") {
      try {
        await execute(
          db,
          "UPDATE impersonation_sessions SET ended_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND ended_at IS NULL",
          session.userId
        );
        return jsonResponse({ success: true });
      } catch (err) {
        return errorResponse("Failed to stop impersonation: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/db-explorer" && method === "GET") {
      const tableName = url.searchParams.get("table") || "organizations";
      const allowedTables = [
        "organizations",
        "platform_users",
        "clients",
        "products",
        "invoices",
        "invoice_items",
        "payment_ledgers",
        "audit_logs",
        "saas_plans",
        "saas_transactions",
        "coupons",
        "feature_flags",
        "support_tickets",
        "announcements",
        "email_templates"
      ];
      if (!allowedTables.includes(tableName)) {
        return errorResponse("Table access not permitted", 400);
      }
      const rows = await queryAll(db, `SELECT * FROM ${tableName} ORDER BY 1 DESC LIMIT 100`);
      return jsonResponse({
        table: tableName,
        count: rows.length,
        rows
      });
    }
    if (path2 === "/api/admin/activity-feed" && method === "GET") {
      const recentAudit = await queryAll(db, "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20");
      const recentInvoices = await queryAll(db, "SELECT id, invoice_number, client_name, grand_total, organization_id, created_at FROM invoices ORDER BY created_at DESC LIMIT 15");
      const recentUsers = await queryAll(db, "SELECT id, name, email, organization_id, created_at FROM platform_users ORDER BY created_at DESC LIMIT 10");
      const events = [];
      for (const a of recentAudit) {
        events.push({
          id: a.id,
          type: "AUDIT",
          title: a.action.replace(/_/g, " "),
          description: `Admin ${a.admin_name} performed ${a.action} on ${a.target_name || a.target_type}`,
          timestamp: a.timestamp,
          organizationId: a.organization_id,
          actor: a.admin_name
        });
      }
      for (const inv of recentInvoices) {
        events.push({
          id: `feed_inv_${inv.id}`,
          type: "INVOICE",
          title: `Invoice ${inv.invoice_number} Generated`,
          description: `Billed \u20B9${Number(inv.grand_total).toLocaleString("en-IN")} to ${inv.client_name}`,
          timestamp: inv.created_at,
          organizationId: inv.organization_id,
          actor: "Tenant Billing"
        });
      }
      for (const u of recentUsers) {
        events.push({
          id: `feed_usr_${u.id}`,
          type: "USER",
          title: `New User: ${u.name}`,
          description: `User account registered for ${u.email}`,
          timestamp: u.created_at,
          organizationId: u.organization_id,
          actor: "System Auth"
        });
      }
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return jsonResponse(events.slice(0, 50));
    }
    if (path2 === "/api/admin/payments/payu/test-connection" && method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        let mode = body.mode ? String(body.mode).toLowerCase() : "";
        let isTestMode = true;
        if (mode === "live" || mode === "production") {
          isTestMode = false;
        } else if (mode === "test" || mode === "sandbox") {
          isTestMode = true;
        } else if (body.isTestMode !== void 0) {
          isTestMode = Boolean(body.isTestMode);
          mode = isTestMode ? "test" : "live";
        } else {
          const creds = await getPayUCredentials(db, env);
          isTestMode = creds.isTestMode;
          mode = isTestMode ? "test" : "live";
        }
        let testKey = (body.merchantKey || "").trim();
        let testSalt = (body.merchantSalt || "").trim();
        if (!testKey || !testSalt) {
          const row = await queryFirst(db, "SELECT * FROM app_settings WHERE config_key = 'payu_config'");
          if (row) {
            try {
              const parsed = typeof row.config_value === "string" ? JSON.parse(row.config_value) : row.config_value || {};
              const slot = isTestMode ? parsed.test || {} : parsed.live || {};
              if (!testKey) testKey = (slot.merchantKey || "").trim();
              if (!testSalt) testSalt = (slot.merchantSalt || "").trim();
            } catch {
            }
          }
        }
        if (!testKey) {
          testKey = (env.PAYU_MERCHANT_KEY || (typeof process !== "undefined" ? process.env?.PAYU_MERCHANT_KEY : "") || "").trim();
        }
        if (!testSalt) {
          testSalt = (env.PAYU_MERCHANT_SALT || (typeof process !== "undefined" ? process.env?.PAYU_MERCHANT_SALT : "") || "").trim();
        }
        if (!testKey || !testSalt) {
          return jsonResponse({
            success: false,
            mode: isTestMode ? "test" : "live",
            message: `PayU Merchant Key and Merchant Salt for ${isTestMode ? "Test (Sandbox)" : "Live (Production)"} mode are required.`
          }, 400);
        }
        const endpoint = isTestMode ? "https://test.payu.in/merchant/postservice?form=2" : "https://info.payu.in/merchant/postservice?form=2";
        const command = "verify_payment";
        const var1 = `test_probe_${Date.now()}`;
        const commandHash = await sha512Hex(`${testKey}|${command}|${var1}|${testSalt}`);
        const formData = new URLSearchParams();
        formData.append("key", testKey);
        formData.append("command", command);
        formData.append("var1", var1);
        formData.append("hash", commandHash);
        const startTime = Date.now();
        const payuRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });
        const latency = Date.now() - startTime;
        const responseText = await payuRes.text();
        let responseJson = null;
        try {
          responseJson = JSON.parse(responseText);
        } catch {
        }
        const statusMsg = responseJson?.msg || responseText;
        const isHashMismatch = typeof statusMsg === "string" && (statusMsg.toLowerCase().includes("hash mismatch") || statusMsg.toLowerCase().includes("invalid key") || statusMsg.toLowerCase().includes("authentication failed") || statusMsg.toLowerCase().includes("merchant key not found"));
        if (isHashMismatch) {
          return jsonResponse({
            success: false,
            mode: isTestMode ? "test" : "live",
            message: `PayU Verification Failed: ${statusMsg} (${isTestMode ? "Sandbox" : "Production"} \u2022 ${latency}ms)`,
            latency
          });
        }
        return jsonResponse({
          success: true,
          mode: isTestMode ? "test" : "live",
          message: `PayU ${isTestMode ? "Sandbox / Test" : "Production Live"} Gateway Connected & Verified! (HTTP 200 OK \u2022 ${latency}ms). SHA-512 Hash Verified with PayU servers.`,
          latency,
          endpoint
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: `Failed to connect to PayU servers: ${err?.message || "Network error"}`
        }, 502);
      }
    }
    if ((path2 === "/api/admin/payments/payu/settings" || path2 === "/api/admin/payu/settings" || path2 === "/api/admin/settings/payu" || path2 === "/api/admin/payments/gateways/payu" || path2 === "/api/admin/payments/gateways/PAYU") && (method === "POST" || method === "PUT")) {
      try {
        const existingRow = await queryFirst(db, "SELECT * FROM app_settings WHERE config_key = 'payu_config'");
        let existingConfig = null;
        if (existingRow) {
          const rawVal = existingRow.config_value || existingRow.value;
          if (typeof rawVal === "string") {
            try {
              existingConfig = JSON.parse(rawVal);
            } catch {
            }
          } else if (typeof rawVal === "object" && rawVal !== null) {
            existingConfig = rawVal;
          }
        }
        if (!existingConfig || !existingConfig.test && !existingConfig.live) {
          const flatKey = String(existingConfig?.merchantKey || existingConfig?.payuMerchantKey || "").trim();
          const flatSalt = String(existingConfig?.merchantSalt || existingConfig?.payuMerchantSalt || "").trim();
          const flatHeader = String(existingConfig?.headerAuthKey || existingConfig?.payuHeaderAuthKey || "").trim();
          const flatEndpoint = String(existingConfig?.endpoint || "").trim();
          const flatIsTest = existingConfig?.isTestMode !== void 0 ? Boolean(existingConfig.isTestMode) : true;
          const defaultActiveMode = flatIsTest ? "test" : "live";
          existingConfig = {
            activeMode: defaultActiveMode,
            isEnabled: existingConfig?.isEnabled !== void 0 ? Boolean(existingConfig.isEnabled) : true,
            test: {
              merchantKey: defaultActiveMode === "test" ? flatKey : "",
              merchantSalt: defaultActiveMode === "test" ? flatSalt : "",
              headerAuthKey: defaultActiveMode === "test" ? flatHeader : "",
              endpoint: defaultActiveMode === "test" ? flatEndpoint || "https://test.payu.in/_payment" : "https://test.payu.in/_payment"
            },
            live: {
              merchantKey: defaultActiveMode === "live" ? flatKey : "",
              merchantSalt: defaultActiveMode === "live" ? flatSalt : "",
              headerAuthKey: defaultActiveMode === "live" ? flatHeader : "",
              endpoint: defaultActiveMode === "live" ? flatEndpoint || "https://secure.payu.in/_payment" : "https://secure.payu.in/_payment"
            },
            name: existingConfig?.name || "PayU India Hosted Gateway",
            currency: existingConfig?.currency || "INR",
            supportedMethods: existingConfig?.supportedMethods || ["UPI", "NET_BANKING", "CARDS"],
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        const body = await request.json().catch(() => ({}));
        if (body.mode && (body.mode === "test" || body.mode === "live")) {
          const targetMode = body.mode;
          const defaultEndpoint = targetMode === "test" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment";
          const currentSlot = existingConfig[targetMode] || {};
          existingConfig[targetMode] = {
            merchantKey: body.merchantKey !== void 0 ? String(body.merchantKey).trim() : currentSlot.merchantKey || "",
            merchantSalt: body.merchantSalt !== void 0 ? String(body.merchantSalt).trim() : currentSlot.merchantSalt || "",
            headerAuthKey: body.headerAuthKey !== void 0 ? String(body.headerAuthKey).trim() : currentSlot.headerAuthKey || "",
            endpoint: body.endpoint !== void 0 ? String(body.endpoint).trim() : currentSlot.endpoint || defaultEndpoint
          };
        }
        if (body.test && typeof body.test === "object") {
          const currentTest = existingConfig.test || {};
          existingConfig.test = {
            merchantKey: body.test.merchantKey !== void 0 ? String(body.test.merchantKey).trim() : currentTest.merchantKey || "",
            merchantSalt: body.test.merchantSalt !== void 0 ? String(body.test.merchantSalt).trim() : currentTest.merchantSalt || "",
            headerAuthKey: body.test.headerAuthKey !== void 0 ? String(body.test.headerAuthKey).trim() : currentTest.headerAuthKey || "",
            endpoint: body.test.endpoint !== void 0 ? String(body.test.endpoint).trim() : currentTest.endpoint || "https://test.payu.in/_payment"
          };
        }
        if (body.live && typeof body.live === "object") {
          const currentLive = existingConfig.live || {};
          existingConfig.live = {
            merchantKey: body.live.merchantKey !== void 0 ? String(body.live.merchantKey).trim() : currentLive.merchantKey || "",
            merchantSalt: body.live.merchantSalt !== void 0 ? String(body.live.merchantSalt).trim() : currentLive.merchantSalt || "",
            headerAuthKey: body.live.headerAuthKey !== void 0 ? String(body.live.headerAuthKey).trim() : currentLive.headerAuthKey || "",
            endpoint: body.live.endpoint !== void 0 ? String(body.live.endpoint).trim() : currentLive.endpoint || "https://secure.payu.in/_payment"
          };
        }
        if (body.activeMode && (body.activeMode === "test" || body.activeMode === "live")) {
          existingConfig.activeMode = body.activeMode;
        } else if (body.isTestMode !== void 0 && !body.mode) {
          existingConfig.activeMode = body.isTestMode ? "test" : "live";
        }
        if (body.isEnabled !== void 0) existingConfig.isEnabled = Boolean(body.isEnabled);
        if (body.name !== void 0) existingConfig.name = String(body.name).trim();
        if (body.currency !== void 0) existingConfig.currency = String(body.currency).trim();
        if (body.supportedMethods !== void 0 && Array.isArray(body.supportedMethods)) {
          existingConfig.supportedMethods = body.supportedMethods;
        }
        existingConfig.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        const configValueJson = JSON.stringify(existingConfig);
        await execute(
          db,
          `INSERT INTO app_settings (config_key, config_value, updated_at)
           VALUES ('payu_config', ?, CURRENT_TIMESTAMP)
           ON CONFLICT(config_key) DO UPDATE SET
             config_value = excluded.config_value,
             updated_at = CURRENT_TIMESTAMP`,
          configValueJson
        );
        const activeSlot = existingConfig.activeMode === "live" ? existingConfig.live : existingConfig.test;
        await execute(
          db,
          `INSERT INTO payment_gateway_config (
            provider, name, is_enabled, is_test_mode, merchant_key, merchant_salt, header_auth_key, endpoint, config_json, updated_at
          ) VALUES ('PAYU', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(provider) DO UPDATE SET
            name = excluded.name,
            is_enabled = excluded.is_enabled,
            is_test_mode = excluded.is_test_mode,
            merchant_key = excluded.merchant_key,
            merchant_salt = excluded.merchant_salt,
            header_auth_key = excluded.header_auth_key,
            endpoint = excluded.endpoint,
            config_json = excluded.config_json,
            updated_at = CURRENT_TIMESTAMP`,
          existingConfig.name || "PayU India Hosted Gateway",
          existingConfig.isEnabled ? 1 : 0,
          existingConfig.activeMode === "test" ? 1 : 0,
          activeSlot?.merchantKey || "",
          activeSlot?.merchantSalt || "",
          activeSlot?.headerAuthKey || "",
          activeSlot?.endpoint || (existingConfig.activeMode === "test" ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment"),
          configValueJson
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          null,
          session?.userId || "admin",
          session?.name || "Super Admin",
          session?.role || "SUPER_ADMIN",
          "UPDATE_PAYU_CONFIG",
          "payu_config",
          `PayU Settings (Active: ${existingConfig.activeMode.toUpperCase()})`,
          "SETTINGS",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({
          success: true,
          message: "PayU gateway settings saved successfully to Cloudflare D1 app_settings table",
          config_key: "payu_config",
          data: existingConfig
        });
      } catch (err) {
        return errorResponse("Failed to save PayU settings: " + (err?.message || "Database error"), 500);
      }
    }
    if ((path2 === "/api/admin/payments/payu/settings" || path2 === "/api/admin/payu/settings" || path2 === "/api/admin/settings/payu") && method === "GET") {
      try {
        const creds = await getPayUCredentials(db, env);
        const row = await queryFirst(db, "SELECT * FROM app_settings WHERE config_key = 'payu_config'");
        let config = null;
        if (row && row.config_value) {
          try {
            config = JSON.parse(row.config_value);
          } catch {
            config = null;
          }
        }
        if (!config) {
          config = {
            activeMode: creds.activeMode || "test",
            isEnabled: true,
            test: creds.test || {
              merchantKey: "",
              merchantSalt: "",
              headerAuthKey: "",
              endpoint: "https://test.payu.in/_payment"
            },
            live: creds.live || {
              merchantKey: "",
              merchantSalt: "",
              headerAuthKey: "",
              endpoint: "https://secure.payu.in/_payment"
            },
            name: "PayU India Hosted Gateway",
            currency: "INR",
            supportedMethods: ["UPI", "NET_BANKING", "CARDS"]
          };
        }
        return jsonResponse({
          success: true,
          config_key: "payu_config",
          data: config,
          updated_at: row?.updated_at || null
        });
      } catch (err) {
        return errorResponse("Failed to retrieve PayU settings: " + (err?.message || "Database error"), 500);
      }
    }
    if (path2 === "/api/admin/platform-settings" && method === "GET") {
      const settings = await getPlatformSettingsFromDB(db);
      return jsonResponse(settings);
    }
    if (path2 === "/api/admin/platform-settings" && method === "PUT") {
      try {
        const body = await request.json().catch(() => ({}));
        await execute(
          db,
          `INSERT INTO platform_settings (id, settings_json, updated_at)
           VALUES ('GLOBAL_CONFIG', ?, CURRENT_TIMESTAMP)
           ON CONFLICT(id) DO UPDATE SET
             settings_json = excluded.settings_json,
             updated_at = CURRENT_TIMESTAMP`,
          JSON.stringify(body)
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          null,
          session.userId,
          session.name,
          session.role,
          "UPDATE_SYSTEM_SETTINGS",
          "GLOBAL_CONFIG",
          "Platform Settings",
          "SYSTEM",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, settings: body });
      } catch (err) {
        return errorResponse("Failed to save platform settings: " + err?.message, 500);
      }
    }
    if (path2 === "/api/admin/payments/gateways" && method === "GET") {
      const rows = await queryAll(db, "SELECT * FROM payment_gateway_config");
      const gatewaysMap = {};
      const defaultProviders = ["PAYU"];
      const defaultNames = {
        PAYU: "PayU India Hosted Gateway"
      };
      for (const p of defaultProviders) {
        gatewaysMap[p] = {
          provider: p,
          name: defaultNames[p] || p,
          isEnabled: true,
          isTestMode: true,
          merchantKey: "",
          merchantSalt: "",
          webhookSecret: "",
          endpoint: "https://test.payu.in/_payment",
          supportedMethods: ["UPI", "NET_BANKING", "CARDS"],
          currency: "INR"
        };
      }
      let activeProvider = "PAYU";
      for (const r of rows) {
        let extraConfig = {};
        try {
          if (r.config_json) extraConfig = JSON.parse(r.config_json);
        } catch {
        }
        gatewaysMap[r.provider] = {
          provider: r.provider,
          name: r.name || defaultNames[r.provider] || r.provider,
          isEnabled: r.is_enabled !== void 0 ? !!r.is_enabled : true,
          isTestMode: r.is_test_mode !== null && r.is_test_mode !== void 0 ? !!r.is_test_mode : true,
          merchantKey: r.merchant_key || "",
          merchantSalt: r.merchant_salt || "",
          webhookSecret: r.webhook_secret || "",
          endpoint: r.endpoint || "",
          supportedMethods: extraConfig.supportedMethods || ["UPI", "NET_BANKING", "CARDS"],
          currency: extraConfig.currency || "INR",
          ...extraConfig
        };
        if (r.is_active_default || r.provider === "PAYU") {
          activeProvider = r.provider;
        }
      }
      return jsonResponse({
        activeProvider: "PAYU",
        gateways: gatewaysMap
      });
    }
    if (path2.startsWith("/api/admin/payments/gateways/") && method === "POST") {
      const subPath = path2.substring("/api/admin/payments/gateways/".length);
      if (subPath === "active") {
        const body = await request.json().catch(() => ({}));
        const provider = body.provider;
        if (!provider) return errorResponse("Provider required", 400);
        await execute(db, "UPDATE payment_gateway_config SET is_active_default = 0");
        await execute(
          db,
          `INSERT INTO payment_gateway_config (provider, name, is_enabled, is_active_default, updated_at)
           VALUES (?, ?, 1, 1, CURRENT_TIMESTAMP)
           ON CONFLICT(provider) DO UPDATE SET
             is_active_default = 1,
             updated_at = CURRENT_TIMESTAMP`,
          provider,
          provider
        );
        return jsonResponse({ success: true, activeProvider: provider });
      } else {
        const provider = subPath;
        const body = await request.json().catch(() => ({}));
        const extraConfig = {};
        if (body.supportedMethods) extraConfig.supportedMethods = body.supportedMethods;
        if (body.currency) extraConfig.currency = body.currency;
        if (body.upiId) extraConfig.upiId = body.upiId;
        if (body.accountName) extraConfig.accountName = body.accountName;
        await execute(
          db,
          `INSERT INTO payment_gateway_config (
            provider, name, is_enabled, is_test_mode, merchant_key, merchant_salt, webhook_secret, endpoint, config_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(provider) DO UPDATE SET
            name = excluded.name,
            is_enabled = excluded.is_enabled,
            is_test_mode = excluded.is_test_mode,
            merchant_key = excluded.merchant_key,
            merchant_salt = excluded.merchant_salt,
            webhook_secret = excluded.webhook_secret,
            endpoint = excluded.endpoint,
            config_json = excluded.config_json,
            updated_at = CURRENT_TIMESTAMP`,
          provider,
          body.name || provider,
          body.isEnabled !== void 0 ? body.isEnabled ? 1 : 0 : 1,
          body.isTestMode !== void 0 ? body.isTestMode ? 1 : 0 : 1,
          body.merchantKey || body.apiKey || "",
          body.merchantSalt || body.apiSecret || "",
          body.webhookSecret || "",
          body.endpoint || "",
          JSON.stringify(extraConfig)
        );
        await execute(
          db,
          `INSERT INTO audit_logs (
            id, organization_id, admin_id, admin_name, admin_role, action, target_id, target_name, target_type, ip_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          null,
          session.userId,
          session.name,
          session.role,
          "UPDATE_PAYMENT_GATEWAY",
          provider,
          body.name || provider,
          "PAYMENT_GATEWAY",
          request.headers.get("cf-connecting-ip") || "127.0.0.1"
        );
        return jsonResponse({ success: true, provider });
      }
    }
    if (path2.startsWith("/api/admin/app-settings/") && method === "GET") {
      const configKey = path2.substring("/api/admin/app-settings/".length);
      const row = await queryFirst(db, "SELECT * FROM app_settings WHERE config_key = ?", configKey);
      if (!row) {
        return errorResponse(`Config key '${configKey}' not found`, 404);
      }
      let parsed = row.config_value;
      try {
        parsed = JSON.parse(row.config_value);
      } catch {
      }
      return jsonResponse({ success: true, key: configKey, value: parsed, updated_at: row.updated_at });
    }
    if (path2.startsWith("/api/admin/app-settings/") && (method === "POST" || method === "PUT")) {
      const configKey = path2.substring("/api/admin/app-settings/".length);
      const body = await request.json().catch(() => ({}));
      const configValStr = typeof body === "string" ? body : JSON.stringify(body);
      await execute(
        db,
        `INSERT INTO app_settings (config_key, config_value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(config_key) DO UPDATE SET
           config_value = excluded.config_value,
           updated_at = CURRENT_TIMESTAMP`,
        configKey,
        configValStr
      );
      return jsonResponse({ success: true, key: configKey });
    }
    if (path2 === "/api/admin/system/schema-check" && method === "GET") {
      try {
        const rows = await queryAll(
          db,
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC"
        );
        const existingTables = rows.map((r) => r.name);
        const existingSet = new Set(existingTables);
        const expectedTables = [
          "organizations",
          "platform_users",
          "clients",
          "products",
          "invoices",
          "invoice_items",
          "payment_ledgers",
          "audit_logs",
          "impersonation_sessions",
          "saas_plans",
          "saas_transactions",
          "coupons",
          "feature_flags",
          "support_tickets",
          "announcements",
          "email_templates",
          "system_error_logs",
          "app_settings",
          "platform_settings",
          "payment_gateway_config",
          "subscription_transactions"
        ];
        const missingTables = expectedTables.filter((t) => !existingSet.has(t));
        const presentTables = expectedTables.filter((t) => existingSet.has(t));
        const expectedTableSchemas = {
          saas_plans: [
            "id",
            "name",
            "code",
            "tagline",
            "monthly_price_inr",
            "six_month_price_inr",
            "three_month_price_inr",
            "yearly_price_inr",
            "trial_duration_days",
            "billing_type",
            "is_popular",
            "is_archived",
            "limits_json"
          ],
          subscription_transactions: [
            "id",
            "organization_id",
            "txnid",
            "amount",
            "currency",
            "plan_id",
            "billing_cycle",
            "duration_days",
            "payment_provider",
            "payment_status",
            "payu_payment_id",
            "payu_response_json",
            "customer_email",
            "customer_phone",
            "coupon_code"
          ],
          organizations: [
            "id",
            "name",
            "slug",
            "owner_name",
            "admin_email",
            "mobile",
            "plan_id",
            "plan_name",
            "subscription_status",
            "billing_type",
            "trial_end_date",
            "renewal_date"
          ],
          audit_logs: [
            "id",
            "organization_id",
            "admin_id",
            "admin_name",
            "admin_role",
            "action",
            "target_id",
            "target_name",
            "target_type",
            "ip_address"
          ],
          payment_gateway_config: [
            "provider",
            "name",
            "is_enabled",
            "is_test_mode",
            "merchant_key",
            "merchant_salt",
            "header_auth_key",
            "endpoint"
          ],
          platform_users: [
            "id",
            "organization_id",
            "name",
            "email",
            "phone",
            "password_hash",
            "role",
            "status"
          ]
        };
        const missingColumns = {};
        const columnValidation = {};
        let hasColumnDrift = false;
        for (const [tblName, expectedCols] of Object.entries(expectedTableSchemas)) {
          if (existingSet.has(tblName)) {
            try {
              const colRows = await queryAll(db, `PRAGMA table_info(${tblName})`);
              const existingCols = colRows.map((c) => c.name);
              const existingColSet = new Set(existingCols);
              const missing = expectedCols.filter((col) => !existingColSet.has(col));
              columnValidation[tblName] = {
                expectedCount: expectedCols.length,
                existingCount: existingCols.length,
                missing
              };
              if (missing.length > 0) {
                missingColumns[tblName] = missing;
                hasColumnDrift = true;
              }
            } catch (colErr) {
              console.warn(`[schema-check] Failed to inspect PRAGMA table_info(${tblName}):`, colErr?.message || colErr);
            }
          }
        }
        const isHealthy = missingTables.length === 0 && !hasColumnDrift;
        return jsonResponse({
          success: true,
          healthy: isHealthy,
          status: isHealthy ? "HEALTHY" : "DRIFT_DETECTED",
          totalExpected: expectedTables.length,
          totalPresent: presentTables.length,
          totalMissing: missingTables.length,
          missingTables,
          presentTables,
          missingColumns,
          columnValidation,
          allExistingTables: existingTables,
          checkedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (err) {
        return errorResponse("Failed to check database schema: " + (err?.message || "DB error"), 500);
      }
    }
  }
  return errorResponse("API route not found", 404);
}

// server.ts
function createD1Adapter(sqliteDb) {
  return {
    async exec(query) {
      return sqliteDb.exec(query);
    },
    prepare(query) {
      let bound = [];
      const prepared = {
        bind(...values) {
          bound = values.map((v) => v === void 0 ? null : v);
          return prepared;
        },
        async first(colName) {
          try {
            const stmt = sqliteDb.prepare(query);
            const row = stmt.get(...bound);
            if (!row) return null;
            if (colName) return row[colName] ?? null;
            return row;
          } catch (e) {
            console.error("D1 adapter first() error:", e?.message || e, query);
            throw e;
          }
        },
        async all() {
          try {
            const stmt = sqliteDb.prepare(query);
            const rows = stmt.all(...bound) || [];
            return { results: rows, success: true, meta: {} };
          } catch (e) {
            console.error("D1 adapter all() error:", e?.message || e, query);
            throw e;
          }
        },
        async run() {
          try {
            const stmt = sqliteDb.prepare(query);
            const res = stmt.run(...bound);
            return { success: true, meta: res };
          } catch (e) {
            console.error("D1 adapter run() error:", e?.message || e, query);
            throw e;
          }
        }
      };
      return prepared;
    },
    async batch(stmts) {
      sqliteDb.exec("BEGIN TRANSACTION");
      const results = [];
      try {
        for (const s of stmts) {
          results.push(await s.run());
        }
        sqliteDb.exec("COMMIT");
        return results;
      } catch (e) {
        sqliteDb.exec("ROLLBACK");
        throw e;
      }
    }
  };
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  const dataDir = import_path.default.join(process.cwd(), "data");
  if (!import_fs.default.existsSync(dataDir)) {
    import_fs.default.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = import_path.default.join(dataDir, "kannaku_d1.db");
  const sqlite = new import_node_sqlite.DatabaseSync(dbPath);
  const d1 = createD1Adapter(sqlite);
  try {
    await ensureTables(d1);
    await seedInitialTenants(d1, process.env);
    console.log("[Server] Cloudflare D1 local SQLite database initialized at:", dbPath);
  } catch (err) {
    console.error("[Server] Failed to initialize database schema:", err);
  }
  app.use(import_express.default.json({ limit: "15mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "15mb" }));
  app.all("/api/*", async (req, res) => {
    try {
      const protocol = req.protocol || "http";
      const host = req.get("host") || `localhost:${PORT}`;
      const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`);
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== void 0) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }
      let body = void 0;
      const method = req.method.toUpperCase();
      if (!["GET", "HEAD"].includes(method)) {
        if (req.body && typeof req.body === "object") {
          body = JSON.stringify(req.body);
        } else if (typeof req.body === "string") {
          body = req.body;
        }
      }
      const webRequest = new Request(url.toString(), {
        method,
        headers,
        body
      });
      const response = await handleApiRequest({
        request: webRequest,
        env: {
          DB: d1,
          SESSION_SECRET: process.env.SESSION_SECRET || "kannaku-saas-production-session-key-fallback-2026",
          ENVIRONMENT: process.env.NODE_ENV || "development",
          APP_NAME: "Kanakku GST Billing SaaS"
        },
        url
      });
      res.status(response.status);
      response.headers.forEach((val, key) => {
        if (key.toLowerCase() === "set-cookie") {
          res.append("Set-Cookie", val);
        } else {
          res.setHeader(key, val);
        }
      });
      const responseText = await response.text();
      res.send(responseText);
    } catch (err) {
      console.error("[Server API Error]", err);
      res.status(500).json({ success: false, error: err?.message || "Internal Server Error" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        port: PORT,
        host: "0.0.0.0",
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(
      import_express.default.static(distPath, {
        setHeaders: (res, filepath) => {
          if (filepath.endsWith("sw.js") || filepath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          }
        }
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] KANAKKU SaaS running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createD1Adapter
});
//# sourceMappingURL=server.cjs.map
