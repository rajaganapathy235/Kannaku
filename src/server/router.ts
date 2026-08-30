/**
 * Cloudflare Worker Core API Router & Request Dispatcher
 * Handles all REST endpoints with Server-Side Auth, Tenant Isolation, and D1 Persistence.
 */

import {
  AuthTokenPayload,
  checkRateLimit,
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from './crypto';
import { D1Database, ensureTables, execute, queryAll, queryFirst, seedInitialTenants } from './db';

export interface RequestContext {
  request: Request;
  env: {
    DB?: D1Database;
    SESSION_SECRET?: string;
    ENVIRONMENT?: string;
    APP_NAME?: string;
    [key: string]: any;
  };
  url: URL;
}

// Extract authenticated session strictly from Authorization header or Cookie
export async function authenticateRequest(
  request: Request,
  secretKey: string
): Promise<AuthTokenPayload | null> {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const cookieHeader = request.headers.get('Cookie') || request.headers.get('cookie') || '';
    const match = cookieHeader.match(/kannaku_session=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return null;
  }

  return await verifySessionToken(token, secretKey);
}

function jsonResponse(data: any, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message, success: false }, status);
}

export async function handleApiRequest(ctx: RequestContext): Promise<Response> {
  const { request, env, url } = ctx;
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const secretKey = env.SESSION_SECRET || 'kannaku-saas-production-session-key-fallback-2026';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const db = env.DB;
  if (!db) {
    console.error('[CRITICAL] Cloudflare D1 Database binding "DB" is not bound! In Cloudflare Pages, go to Settings -> Functions -> D1 Database Bindings -> add binding "DB"');
    return errorResponse(
      'Cloudflare D1 Database binding (DB) is missing. If deployed on Cloudflare Pages, configure D1 Database Binding under Project Settings -> Functions -> D1 Database Bindings with binding name "DB".',
      503
    );
  }

  // Ensure tables and seed exist on first call
  await ensureTables(db);

  // -------------------------------------------------------------
  // 1. HEALTH & SYSTEM CHECKS
  // -------------------------------------------------------------
  if (path === '/api/health') {
    return jsonResponse({
      status: 'healthy',
      app: env.APP_NAME || 'Kanakku GST Billing SaaS',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  if (path === '/api/health/db') {
    try {
      await seedInitialTenants(db, env);
      const orgCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM organizations');
      const invCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM invoices');
      const clientCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM clients WHERE is_active = 1');
      const prodCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM products WHERE is_active = 1');
      const payCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM payment_ledgers');

      return jsonResponse({
        success: true,
        database: 'connected',
        binding: 'DB (Cloudflare D1 SQLite)',
        counts: {
          organizations: orgCount?.count || 0,
          invoices: invCount?.count || 0,
          clients: clientCount?.count || 0,
          products: prodCount?.count || 0,
          payments: payCount?.count || 0,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return errorResponse('Database health check failed: ' + (err?.message || 'Unknown database error'), 500);
    }
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATION ENDPOINTS
  // -------------------------------------------------------------
  if (path === '/api/auth/demo-switch' && method === 'POST') {
    if (env.ENVIRONMENT !== 'development') {
      return errorResponse('Endpoint not available in production', 404);
    }
    try {
      const body = (await request.json().catch(() => ({}))) as any;
      const role = body?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'OWNER';
      await seedInitialTenants(db, env);

      let user: any = null;
      if (role === 'SUPER_ADMIN') {
        user = await queryFirst<any>(db, "SELECT * FROM platform_users WHERE role = 'SUPER_ADMIN' LIMIT 1");
      } else {
        user = await queryFirst<any>(db, "SELECT * FROM platform_users WHERE organization_id = 'org_hytex_cotton' LIMIT 1");
        if (!user) {
          user = await queryFirst<any>(db, "SELECT * FROM platform_users WHERE role = 'OWNER' LIMIT 1");
        }
      }

      if (!user) {
        return errorResponse('Demo user not found in database', 404);
      }

      const org = await queryFirst<any>(db, 'SELECT * FROM organizations WHERE id = ?', user.organization_id);

      const token = await createSessionToken(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organization_id,
          role: user.role,
        },
        secretKey
      );

      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`;

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
          },
          organization: org || {
            id: user.organization_id,
            name: 'HYTEX COTTON MILLS',
            planId: 'plan_pro',
            planName: 'Pro Trader',
          },
        },
        200,
        { 'Set-Cookie': sessionCookie }
      );
    } catch (err: any) {
      return errorResponse('Failed to issue demo session token: ' + (err?.message || 'Unknown error'), 500);
    }
  }
  if (path === '/api/auth/login' && method === 'POST') {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rate = checkRateLimit(`login:${ip}`, 10, 60);
    if (!rate.allowed) {
      return errorResponse('Too many login attempts. Please wait 1 minute.', 429);
    }

    try {
      const body = (await request.json()) as any;
      const { email, password } = body;
      if (!email || !password) {
        return errorResponse('Email and password are required', 400);
      }

      await seedInitialTenants(db, env);

      const user = await queryFirst<any>(
        db,
        'SELECT * FROM platform_users WHERE LOWER(email) = LOWER(?)',
        email.trim()
      );

      if (!user) {
        return errorResponse('Invalid email or password', 401);
      }

      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse('Invalid email or password', 401);
      }

      // Upgrade legacy password hash to PBKDF2 if needed
      if (!user.password_hash.startsWith('pbkdf2:sha256:')) {
        const upgradedHash = await hashPassword(password);
        await execute(db, 'UPDATE platform_users SET password_hash = ? WHERE id = ?', upgradedHash, user.id);
      }

      // Fetch organization details
      const org = await queryFirst<any>(
        db,
        'SELECT * FROM organizations WHERE id = ?',
        user.organization_id
      );

      const token = await createSessionToken(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organization_id,
          role: user.role,
        },
        secretKey
      );

      // Update last login
      await execute(db, 'UPDATE platform_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', user.id);

      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`;

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
          },
          organization: org || {
            id: user.organization_id,
            name: 'My Business',
            planId: 'plan_pro',
            planName: 'Pro Trader',
          },
        },
        200,
        { 'Set-Cookie': sessionCookie }
      );
    } catch {
      return errorResponse('Failed to authenticate', 500);
    }
  }

  if (path === '/api/auth/signup' && method === 'POST') {
    try {
      const body = (await request.json()) as any;
      const { companyName, ownerName, email, mobile, password, state, gstin } = body;

      if (!companyName || !ownerName || !email || !mobile || !password) {
        return errorResponse('Please provide company name, owner name, email, mobile, and password', 400);
      }

      const existingUser = await queryFirst<any>(
        db,
        'SELECT id FROM platform_users WHERE LOWER(email) = LOWER(?)',
        email.trim()
      );
      if (existingUser) {
        return errorResponse('An account with this email already exists', 409);
      }

      const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30);
      const passHash = await hashPassword(password);

      // Create Organization
      await execute(
        db,
        `INSERT INTO organizations (
          id, name, slug, owner_name, admin_email, mobile, state, register_number, plan_id, plan_name, subscription_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'plan_pro', 'Pro Trader', 'ACTIVE')`,
        orgId,
        companyName,
        slug,
        ownerName,
        email.trim(),
        mobile,
        state || 'Tamil Nadu',
        gstin || null
      );

      // Create Platform User
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
          role: 'OWNER',
        },
        secretKey
      );

      const sessionCookie = `kannaku_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`;

      return jsonResponse(
        {
          success: true,
          token,
          user: { id: userId, name: ownerName, email: email.trim(), phone: mobile, role: 'OWNER' },
          organization: { id: orgId, name: companyName, planId: 'plan_pro', planName: 'Pro Trader' },
        },
        201,
        { 'Set-Cookie': sessionCookie }
      );
    } catch {
      return errorResponse('Registration failed', 500);
    }
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const clearCookie = 'kannaku_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
    return jsonResponse({ success: true, message: 'Logged out successfully' }, 200, {
      'Set-Cookie': clearCookie,
    });
  }

  // -------------------------------------------------------------
  // 3. AUTHENTICATED REQUEST VALIDATION & TENANT CONTEXT
  // -------------------------------------------------------------
  const session = await authenticateRequest(request, secretKey);
  if (!session) {
    return errorResponse('Unauthorized. Please log in.', 401);
  }

  // Check if superadmin is impersonating another organization
  const impersonateOrgHeader = request.headers.get('X-Impersonate-Org');
  let effectiveOrgId = session.organizationId;
  if (session.role === 'SUPER_ADMIN' && impersonateOrgHeader) {
    effectiveOrgId = impersonateOrgHeader;
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const user = await queryFirst<any>(db, 'SELECT * FROM platform_users WHERE id = ?', session.userId);
    const org = await queryFirst<any>(db, 'SELECT * FROM organizations WHERE id = ?', effectiveOrgId);
    return jsonResponse({
      user: {
        id: user?.id || session.userId,
        name: user?.name || session.name,
        email: user?.email || session.email,
        phone: user?.phone,
        role: user?.role || session.role,
        avatarUrl: user?.avatar_url,
      },
      organization: org,
    });
  }

  if (path === '/api/auth/change-password' && method === 'POST') {
    try {
      const body = (await request.json().catch(() => ({}))) as any;
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return errorResponse('Current password and new password are required', 400);
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return errorResponse('New password must be at least 6 characters long', 400);
      }

      const user = await queryFirst<any>(
        db,
        'SELECT * FROM platform_users WHERE id = ?',
        session.userId
      );

      if (!user) {
        return errorResponse('User account not found', 404);
      }

      const isCurrentValid = await verifyPassword(currentPassword, user.password_hash);
      if (!isCurrentValid) {
        return errorResponse('Current password is incorrect', 400);
      }

      const newPassHash = await hashPassword(newPassword);
      await execute(
        db,
        'UPDATE platform_users SET password_hash = ? WHERE id = ?',
        newPassHash,
        session.userId
      );

      // Audit log password rotation
      await execute(
        db,
        `INSERT INTO audit_logs (
          id, organization_id, user_id, action, entity_type, entity_id, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        session.organizationId,
        session.userId,
        'PASSWORD_CHANGED',
        'platform_users',
        session.userId,
        JSON.stringify({ ip: request.headers.get('cf-connecting-ip') || 'unknown', timestamp: new Date().toISOString() })
      );

      return jsonResponse({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (err: any) {
      return errorResponse('Failed to change password: ' + (err?.message || 'Server error'), 500);
    }
  }

  // -------------------------------------------------------------
  // 4. ORGANIZATION / COMPANY PROFILE ENDPOINTS
  // -------------------------------------------------------------
  if (path === '/api/organization' && method === 'GET') {
    const org = await queryFirst<any>(db, 'SELECT * FROM organizations WHERE id = ?', effectiveOrgId);
    if (!org) {
      return errorResponse('Organization not found', 404);
    }

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
      address: org.address || '',
      city: org.city || '',
      state: org.state || 'Tamil Nadu',
      pin: org.pin || '',
      code: org.state_code || '33',
      email: org.admin_email,
      mobile: org.mobile,
      registerNumber: org.register_number || '',
      panNumber: org.pan_number || '',
      billPrefix: org.bill_prefix || 'INV/2026/',
      termsAndCondition: org.terms_conditions || '',
      logoUrl: org.logo_url || null,
      stampUrl: org.stamp_url || null,
      signatureUrl: org.signature_url || null,
      bankDetail,
      plan: org.plan_name,
      subscriptionStatus: org.subscription_status,
    });
  }

  if (path === '/api/organization' && method === 'PUT') {
    try {
      const body = (await request.json()) as any;
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
        body.address || '',
        body.city || '',
        body.state || 'Tamil Nadu',
        body.pin || '',
        body.code || '33',
        body.email || session.email,
        body.mobile || '',
        body.registerNumber || '',
        body.panNumber || '',
        body.billPrefix || 'INV/2026/',
        body.termsAndCondition || '',
        body.logoUrl || null,
        body.stampUrl || null,
        body.signatureUrl || null,
        bankDetailsJson,
        effectiveOrgId
      );

      return jsonResponse({ success: true, message: 'Organization profile updated successfully' });
    } catch {
      return errorResponse('Failed to update organization profile', 500);
    }
  }

  // -------------------------------------------------------------
  // 5. CLIENTS & SUPPLIERS CRUD (TENANT ISOLATED)
  // -------------------------------------------------------------
  if (path === '/api/clients' && method === 'GET') {
    const typeFilter = url.searchParams.get('type');
    let sql = 'SELECT * FROM clients WHERE organization_id = ? AND is_active = 1';
    const params: any[] = [effectiveOrgId];

    if (typeFilter) {
      sql += ' AND client_type = ?';
      params.push(typeFilter);
    }
    sql += ' ORDER BY name ASC';

    const rows = await queryAll<any>(db, sql, ...params);
    const clients = rows.map((r) => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile || '',
      email: r.email || '',
      address: r.address || '',
      city: r.city || '',
      state: r.state || '',
      pin: r.pin || '',
      code: r.state_code || '',
      registerNumber: r.register_number || '',
      clientType: r.client_type || 'customer',
      balance: r.current_balance || 0,
      createdOn: r.created_at,
    }));

    return jsonResponse(clients);
  }

  if (path === '/api/clients' && method === 'POST') {
    try {
      const body = (await request.json()) as any;
      if (!body.name || !body.mobile) {
        return errorResponse('Client name and mobile are required', 400);
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
          updated_at = CURRENT_TIMESTAMP`,
        id,
        effectiveOrgId,
        body.name,
        body.companyName || body.name,
        body.email || null,
        body.mobile,
        body.registerNumber || null,
        body.address || '',
        body.city || '',
        body.state || '',
        body.pin || '',
        body.code || '',
        balance,
        balance,
        body.clientType || 'customer'
      );

      return jsonResponse({ success: true, id, message: 'Client saved successfully' }, 201);
    } catch {
      return errorResponse('Failed to save client', 500);
    }
  }

  if (path.startsWith('/api/clients/') && method === 'PUT') {
    const clientId = path.split('/')[3];
    const body = (await request.json()) as any;

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
      body.address || '',
      body.city || '',
      body.state || '',
      body.pin || '',
      body.code || '',
      Number(body.balance || 0),
      body.clientType || 'customer',
      clientId,
      effectiveOrgId
    );

    return jsonResponse({ success: true, message: 'Client updated successfully' });
  }

  if (path.startsWith('/api/clients/') && method === 'DELETE') {
    const clientId = path.split('/')[3];
    await execute(
      db,
      'UPDATE clients SET is_active = 0 WHERE id = ? AND organization_id = ?',
      clientId,
      effectiveOrgId
    );
    return jsonResponse({ success: true, message: 'Client deleted successfully' });
  }

  // -------------------------------------------------------------
  // 6. PRODUCTS CRUD (TENANT ISOLATED)
  // -------------------------------------------------------------
  if (path === '/api/products' && method === 'GET') {
    const rows = await queryAll<any>(
      db,
      'SELECT * FROM products WHERE organization_id = ? AND is_active = 1 ORDER BY name ASC',
      effectiveOrgId
    );

    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      itemCode: r.item_code || '',
      hsnCode: r.hsn_code,
      unit: r.unit || 'PCS',
      buyingPrice: r.purchase_rate || 0,
      sellingPrice: r.sales_rate,
      mrp: r.mrp || r.sales_rate,
      taxRate: r.tax_percentage || 18,
      currentStock: r.current_stock || 0,
      minStockAlert: r.min_stock_alert || 5,
      subline1: r.subline1 || '',
      subline2: r.subline2 || '',
      subline3: r.subline3 || '',
      barcode: r.barcode || '',
      category: r.category || '',
      createdOn: r.created_at,
    }));

    return jsonResponse(products);
  }

  if (path === '/api/products' && method === 'POST') {
    try {
      const body = (await request.json()) as any;
      if (!body.name || !body.hsnCode || body.sellingPrice === undefined) {
        return errorResponse('Product name, HSN code, and selling price are required', 400);
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
          updated_at = CURRENT_TIMESTAMP`,
        id,
        effectiveOrgId,
        body.name,
        body.itemCode || null,
        body.hsnCode,
        body.unit || 'PCS',
        Number(body.buyingPrice || 0),
        Number(body.sellingPrice),
        Number(body.mrp || body.sellingPrice),
        Number(body.taxRate || 18),
        Number(body.currentStock || 0),
        Number(body.minStockAlert || 5),
        body.subline1 || '',
        body.subline2 || '',
        body.subline3 || '',
        body.barcode || null,
        body.category || null
      );

      return jsonResponse({ success: true, id, message: 'Product saved successfully' }, 201);
    } catch {
      return errorResponse('Failed to save product', 500);
    }
  }

  if (path.startsWith('/api/products/') && method === 'PUT') {
    const productId = path.split('/')[3];
    const body = (await request.json()) as any;

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
      body.unit || 'PCS',
      Number(body.buyingPrice || 0),
      Number(body.sellingPrice),
      Number(body.mrp || body.sellingPrice),
      Number(body.taxRate || 18),
      Number(body.currentStock || 0),
      Number(body.minStockAlert || 5),
      body.subline1 || '',
      body.subline2 || '',
      body.subline3 || '',
      body.barcode || null,
      body.category || null,
      productId,
      effectiveOrgId
    );

    return jsonResponse({ success: true, message: 'Product updated successfully' });
  }

  if (path.startsWith('/api/products/') && method === 'DELETE') {
    const productId = path.split('/')[3];
    await execute(
      db,
      'UPDATE products SET is_active = 0 WHERE id = ? AND organization_id = ?',
      productId,
      effectiveOrgId
    );
    return jsonResponse({ success: true, message: 'Product deleted successfully' });
  }

  // -------------------------------------------------------------
  // 7. INVOICES & QUOTATIONS CRUD (WITH TCS & ITEMS)
  // -------------------------------------------------------------
  if (path === '/api/invoices' && method === 'GET') {
    const invoiceRows = await queryAll<any>(
      db,
      'SELECT * FROM invoices WHERE organization_id = ? ORDER BY invoice_date DESC, created_at DESC',
      effectiveOrgId
    );

    const invoices = await Promise.all(
      invoiceRows.map(async (inv) => {
        const itemRows = await queryAll<any>(
          db,
          'SELECT * FROM invoice_items WHERE invoice_id = ?',
          inv.id
        );

        let extraItems: any[] = [];
        let consignee: any = null;
        let calc: any = null;

        try {
          if (inv.extra_items_json) extraItems = JSON.parse(inv.extra_items_json);
          if (inv.consignee_json) consignee = JSON.parse(inv.consignee_json);
          if (inv.calc_json) calc = JSON.parse(inv.calc_json);
        } catch {
          // ignore parsing error
        }

        const items = itemRows.map((it) => ({
          id: it.id,
          itemId: it.product_id || '',
          name: it.name,
          hsnCode: it.hsn_code,
          qty: it.qty,
          unit: it.unit,
          baseRate: it.rate,
          mrp: it.mrp,
          inclusiveOrExclusive: it.inclusive_or_exclusive || 'exclusive',
          isDiscountApplied: it.discount_percentage > 0 || it.discount_amount > 0,
          flatOrPercentage: 'percentage',
          discountRate: it.discount_percentage,
          discountAmount: it.discount_amount,
          taxPercentage: it.tax_percentage,
          taxAmount: it.tax_amount,
          taxDetail: {
            hsnCode: it.hsn_code,
            taxable_amount: it.line_total - it.tax_amount,
            tax_amount: it.tax_amount,
            data: [
              { name: 'cgst', per: it.cgst_rate || 0, value: it.cgst_amount || 0 },
              { name: 'sgst', per: it.sgst_rate || 0, value: it.sgst_amount || 0 },
              { name: 'igst', per: it.igst_rate || 0, value: it.igst_amount || 0 },
            ],
          },
          subline1: it.subline1 || '',
          subline2: it.subline2 || '',
          subline3: it.subline3 || '',
          lineTotal: it.line_total,
        }));

        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          invoiceType: inv.invoice_type,
          invoiceTaxType: inv.igst_amount > 0 ? 'IGST' : 'CGST_SGST',
          invoiceDate: inv.invoice_date,
          dueDate: inv.due_date,
          poNumber: inv.po_number || '',
          clientSnapshot: {
            id: inv.client_id || '',
            name: inv.client_name,
            mobile: inv.client_mobile || '',
            address: inv.client_address || '',
            city: inv.client_city || '',
            state: inv.client_state || '',
            pin: '',
            registerNumber: inv.client_gstin || '',
            clientType: 'customer',
            balance: inv.balance_amount || 0,
            createdOn: inv.created_at,
          },
          consignee: consignee || {
            name: '',
            address: '',
            city: '',
            state: '',
            pin: '',
            shouldVisible: false,
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
            amountInWords: '',
            paidAmount: inv.paid_amount || 0,
            dueAmount: inv.balance_amount || 0,
          },
          status: inv.payment_status,
          notes: inv.notes || '',
          terms: inv.terms || '',
          printTemplate: inv.print_template || 'modern',
          createdOn: inv.created_at,
        };
      })
    );

    return jsonResponse(invoices);
  }

  if (path === '/api/invoices' && method === 'POST') {
    try {
      const inv = (await request.json()) as any;
      if (!inv.invoiceNumber || !inv.clientSnapshot?.name || !inv.items?.length) {
        return errorResponse('Invoice number, client name, and at least one item are required', 400);
      }

      const id = inv.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const calc = inv.calc || {};

      // 1. Insert or update Invoice Header
      await execute(
        db,
        `INSERT INTO invoices (
          id, organization_id, invoice_number, invoice_type, invoice_date, due_date, po_number,
          client_id, client_name, client_gstin, client_address, client_city, client_state, client_mobile,
          sub_total, discount_total, cgst_amount, sgst_amount, igst_amount, total_tax,
          tcs_percentage, tcs_amount, round_off, grand_total, paid_amount, balance_amount,
          payment_status, print_template, notes, terms, extra_items_json, consignee_json, calc_json, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          extra_items_json = excluded.extra_items_json,
          consignee_json = excluded.consignee_json,
          calc_json = excluded.calc_json`,
        id,
        effectiveOrgId,
        inv.invoiceNumber,
        inv.invoiceType || 1,
        inv.invoiceDate || new Date().toISOString().split('T')[0],
        inv.dueDate || null,
        inv.poNumber || null,
        inv.clientSnapshot?.id || null,
        inv.clientSnapshot?.name || 'Customer',
        inv.clientSnapshot?.registerNumber || null,
        inv.clientSnapshot?.address || '',
        inv.clientSnapshot?.city || '',
        inv.clientSnapshot?.state || '',
        inv.clientSnapshot?.mobile || '',
        Number(calc.subTotal || 0),
        Number(calc.totalDiscount || 0),
        inv.invoiceTaxType === 'IGST' ? 0 : Number(calc.taxAmount || 0) / 2,
        inv.invoiceTaxType === 'IGST' ? 0 : Number(calc.taxAmount || 0) / 2,
        inv.invoiceTaxType === 'IGST' ? Number(calc.taxAmount || 0) : 0,
        Number(calc.taxAmount || 0),
        Number(calc.tcsPercentage || 0),
        Number(calc.tcsAmount || 0),
        Number(calc.roundOffValue || 0),
        Number(calc.billFigure || 0),
        Number(calc.paidAmount || 0),
        Number(calc.dueAmount || (calc.billFigure - (calc.paidAmount || 0))),
        inv.status || (calc.paidAmount >= calc.billFigure ? 'PAID' : calc.paidAmount > 0 ? 'PARTIAL' : 'UNPAID'),
        inv.printTemplate || 'modern',
        inv.notes || '',
        inv.terms || '',
        JSON.stringify(inv.extraItems || []),
        JSON.stringify(inv.consignee || {}),
        JSON.stringify(calc),
        session.name
      );

      // 2. Clear old items and insert fresh line items
      await execute(db, 'DELETE FROM invoice_items WHERE invoice_id = ?', id);

      for (const item of inv.items) {
        const itemId = item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const cgstObj = item.taxDetail?.data?.find((d: any) => d.name === 'cgst');
        const sgstObj = item.taxDetail?.data?.find((d: any) => d.name === 'sgst');
        const igstObj = item.taxDetail?.data?.find((d: any) => d.name === 'igst');

        await execute(
          db,
          `INSERT INTO invoice_items (
            id, invoice_id, product_id, name, hsn_code, qty, unit, rate, mrp, inclusive_or_exclusive,
            discount_percentage, discount_amount, tax_percentage, tax_amount, cgst_rate, cgst_amount,
            sgst_rate, sgst_amount, igst_rate, igst_amount, line_total, subline1, subline2, subline3
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          itemId,
          id,
          item.itemId || null,
          item.name,
          item.hsnCode || '9983',
          Number(item.qty || 1),
          item.unit || 'PCS',
          Number(item.baseRate || 0),
          Number(item.mrp || item.baseRate || 0),
          item.inclusiveOrExclusive || 'exclusive',
          Number(item.discountRate || 0),
          Number(item.discountAmount || 0),
          Number(item.taxPercentage || 18),
          Number(item.taxAmount || 0),
          Number(cgstObj?.per || 0),
          Number(cgstObj?.value || 0),
          Number(sgstObj?.per || 0),
          Number(sgstObj?.value || 0),
          Number(igstObj?.per || 0),
          Number(igstObj?.value || 0),
          Number(item.lineTotal || 0),
          item.subline1 || '',
          item.subline2 || '',
          item.subline3 || ''
        );
      }

      // 3. Create automatic Payment Ledger Entry if paid amount > 0
      if (Number(calc.paidAmount) > 0) {
        const payId = `pay_${id}`;
        await execute(
          db,
          `INSERT INTO payment_ledgers (
            id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes
          ) VALUES (?, ?, ?, ?, ?, 'RECEIPT', 'CASH', ?, ?, 'Initial payment on invoice creation')
          ON CONFLICT(id) DO UPDATE SET amount = excluded.amount`,
          payId,
          effectiveOrgId,
          inv.clientSnapshot?.id || null,
          id,
          inv.invoiceDate || new Date().toISOString().split('T')[0],
          Number(calc.paidAmount),
          inv.invoiceNumber
        );
      }

      return jsonResponse({ success: true, id, message: 'Invoice saved successfully' }, 201);
    } catch (err: any) {
      console.error('Save invoice error:', err);
      return errorResponse('Failed to save invoice', 500);
    }
  }

  if (path.startsWith('/api/invoices/') && method === 'DELETE') {
    const invoiceId = path.split('/')[3];
    await execute(db, 'DELETE FROM invoices WHERE id = ? AND organization_id = ?', invoiceId, effectiveOrgId);
    await execute(db, 'DELETE FROM invoice_items WHERE invoice_id = ?', invoiceId);
    await execute(db, 'DELETE FROM payment_ledgers WHERE invoice_id = ? AND organization_id = ?', invoiceId, effectiveOrgId);
    return jsonResponse({ success: true, message: 'Invoice deleted successfully' });
  }

  // -------------------------------------------------------------
  // 8. PAYMENTS & LEDGER CRUD (TENANT ISOLATED)
  // -------------------------------------------------------------
  if (path === '/api/payments' && method === 'GET') {
    const rows = await queryAll<any>(
      db,
      'SELECT * FROM payment_ledgers WHERE organization_id = ? ORDER BY entry_date DESC, created_at DESC',
      effectiveOrgId
    );

    const payments = rows.map((r) => ({
      id: r.id,
      partyId: r.client_id || '',
      partyName: '',
      type: r.payment_type || 'RECEIPT',
      mode: r.mode || 'CASH',
      amount: r.amount,
      referenceNo: r.reference_number || '',
      invoiceNo: '',
      invoiceId: r.invoice_id || null,
      notes: r.notes || '',
      date: r.entry_date,
    }));

    return jsonResponse(payments);
  }

  if (path === '/api/payments' && method === 'POST') {
    try {
      const body = (await request.json()) as any;
      if (!body.amount) {
        return errorResponse('Payment amount is required', 400);
      }

      const id = body.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      await execute(
        db,
        `INSERT INTO payment_ledgers (
          id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        effectiveOrgId,
        body.partyId || null,
        body.invoiceId || null,
        body.date || new Date().toISOString().split('T')[0],
        body.type || 'RECEIPT',
        body.mode || 'CASH',
        Number(body.amount),
        body.referenceNo || null,
        body.notes || ''
      );

      // Reconcile invoice balance if linked to an invoice
      if (body.invoiceId) {
        const inv = await queryFirst<any>(db, 'SELECT * FROM invoices WHERE id = ? AND organization_id = ?', body.invoiceId, effectiveOrgId);
        if (inv) {
          const newPaid = (inv.paid_amount || 0) + Number(body.amount);
          const newBalance = Math.max(0, inv.grand_total - newPaid);
          const status = newBalance <= 0.01 ? 'PAID' : 'PARTIAL';
          await execute(db, 'UPDATE invoices SET paid_amount = ?, balance_amount = ?, payment_status = ? WHERE id = ?', newPaid, newBalance, status, inv.id);
        }
      }

      return jsonResponse({ success: true, id, message: 'Payment recorded successfully' }, 201);
    } catch {
      return errorResponse('Failed to record payment', 500);
    }
  }

  if (path.startsWith('/api/payments/') && method === 'DELETE') {
    const paymentId = path.split('/')[3];
    await execute(db, 'DELETE FROM payment_ledgers WHERE id = ? AND organization_id = ?', paymentId, effectiveOrgId);
    return jsonResponse({ success: true, message: 'Payment deleted successfully' });
  }

  // -------------------------------------------------------------
  // 9. LOCALSTORAGE TO D1 BATCH MIGRATION ENDPOINT
  // -------------------------------------------------------------
  if (path === '/api/sync/migrate-local' && method === 'POST') {
    try {
      const data = (await request.json()) as any;
      const { company, clients, products, invoices, payments } = data;
      let insertedCount = { clients: 0, products: 0, invoices: 0, payments: 0 };

      // Migrate Company
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

      // Migrate Clients
      if (Array.isArray(clients)) {
        for (const c of clients) {
          if (!c.id || !c.name) continue;
          await execute(
            db,
            `INSERT INTO clients (
              id, organization_id, name, company_name, email, mobile, register_number, address, city, state, pin, state_code, opening_balance, current_balance, client_type, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id) DO NOTHING`,
            c.id,
            effectiveOrgId,
            c.name,
            c.companyName || c.name,
            c.email || null,
            c.mobile || '',
            c.registerNumber || null,
            c.address || '',
            c.city || '',
            c.state || '',
            c.pin || '',
            c.code || '',
            Number(c.balance || 0),
            Number(c.balance || 0),
            c.clientType || 'customer'
          );
          insertedCount.clients++;
        }
      }

      // Migrate Products
      if (Array.isArray(products)) {
        for (const p of products) {
          if (!p.id || !p.name) continue;
          await execute(
            db,
            `INSERT INTO products (
              id, organization_id, name, item_code, hsn_code, unit, purchase_rate, sales_rate, mrp, tax_percentage, current_stock, min_stock_alert, subline1, subline2, subline3, barcode, category, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(id) DO NOTHING`,
            p.id,
            effectiveOrgId,
            p.name,
            p.itemCode || null,
            p.hsnCode || '9983',
            p.unit || 'PCS',
            Number(p.buyingPrice || 0),
            Number(p.sellingPrice || 0),
            Number(p.mrp || p.sellingPrice || 0),
            Number(p.taxRate || 18),
            Number(p.currentStock || 0),
            Number(p.minStockAlert || 5),
            p.subline1 || '',
            p.subline2 || '',
            p.subline3 || '',
            p.barcode || null,
            p.category || null
          );
          insertedCount.products++;
        }
      }

      // Migrate Invoices
      if (Array.isArray(invoices)) {
        for (const inv of invoices) {
          if (!inv.id || !inv.invoiceNumber) continue;
          const calc = inv.calc || {};

          await execute(
            db,
            `INSERT INTO invoices (
              id, organization_id, invoice_number, invoice_type, invoice_date, due_date, po_number,
              client_id, client_name, client_gstin, client_address, client_city, client_state, client_mobile,
              sub_total, discount_total, cgst_amount, sgst_amount, igst_amount, total_tax,
              tcs_percentage, tcs_amount, round_off, grand_total, paid_amount, balance_amount,
              payment_status, print_template, notes, terms, extra_items_json, consignee_json, calc_json, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO NOTHING`,
            inv.id,
            effectiveOrgId,
            inv.invoiceNumber,
            inv.invoiceType || 1,
            inv.invoiceDate || new Date().toISOString().split('T')[0],
            inv.dueDate || null,
            inv.poNumber || null,
            inv.clientSnapshot?.id || null,
            inv.clientSnapshot?.name || 'Customer',
            inv.clientSnapshot?.registerNumber || null,
            inv.clientSnapshot?.address || '',
            inv.clientSnapshot?.city || '',
            inv.clientSnapshot?.state || '',
            inv.clientSnapshot?.mobile || '',
            Number(calc.subTotal || 0),
            Number(calc.totalDiscount || 0),
            inv.invoiceTaxType === 'IGST' ? 0 : Number(calc.taxAmount || 0) / 2,
            inv.invoiceTaxType === 'IGST' ? 0 : Number(calc.taxAmount || 0) / 2,
            inv.invoiceTaxType === 'IGST' ? Number(calc.taxAmount || 0) : 0,
            Number(calc.taxAmount || 0),
            Number(calc.tcsPercentage || 0),
            Number(calc.tcsAmount || 0),
            Number(calc.roundOffValue || 0),
            Number(calc.billFigure || 0),
            Number(calc.paidAmount || 0),
            Number(calc.dueAmount || 0),
            inv.status || 'UNPAID',
            inv.printTemplate || 'modern',
            inv.notes || '',
            inv.terms || '',
            JSON.stringify(inv.extraItems || []),
            JSON.stringify(inv.consignee || {}),
            JSON.stringify(calc),
            session.name
          );

          if (Array.isArray(inv.items)) {
            for (const it of inv.items) {
              await execute(
                db,
                `INSERT INTO invoice_items (
                  id, invoice_id, product_id, name, hsn_code, qty, unit, rate, mrp, inclusive_or_exclusive,
                  discount_percentage, discount_amount, tax_percentage, tax_amount, line_total, subline1, subline2, subline3
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING`,
                it.id || `item_${Math.random().toString(36).substring(2, 8)}`,
                inv.id,
                it.itemId || null,
                it.name,
                it.hsnCode || '9983',
                Number(it.qty || 1),
                it.unit || 'PCS',
                Number(it.baseRate || 0),
                Number(it.mrp || it.baseRate || 0),
                it.inclusiveOrExclusive || 'exclusive',
                Number(it.discountRate || 0),
                Number(it.discountAmount || 0),
                Number(it.taxPercentage || 18),
                Number(it.taxAmount || 0),
                Number(it.lineTotal || 0),
                it.subline1 || '',
                it.subline2 || '',
                it.subline3 || ''
              );
            }
          }
          insertedCount.invoices++;
        }
      }

      // Migrate Payments
      if (Array.isArray(payments)) {
        for (const p of payments) {
          if (!p.id || !p.amount) continue;
          await execute(
            db,
            `INSERT INTO payment_ledgers (
              id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO NOTHING`,
            p.id,
            effectiveOrgId,
            p.partyId || null,
            p.invoiceId || null,
            p.date || new Date().toISOString().split('T')[0],
            p.type || 'RECEIPT',
            p.mode || 'CASH',
            Number(p.amount),
            p.referenceNo || null,
            p.notes || ''
          );
          insertedCount.payments++;
        }
      }

      return jsonResponse({
        success: true,
        migrated: insertedCount,
        message: 'Successfully migrated records to Cloudflare D1',
      });
    } catch {
      return errorResponse('Migration failed', 500);
    }
  }

  // -------------------------------------------------------------
  // 10. SUPER ADMIN PROTECTED ROUTES (RBAC STRICT)
  // -------------------------------------------------------------
  if (path.startsWith('/api/admin/')) {
    if (session.role !== 'SUPER_ADMIN') {
      return errorResponse('Forbidden. Super Admin privileges required.', 403);
    }

    if (path === '/api/admin/organizations' && method === 'GET') {
      const orgs = await queryAll<any>(db, 'SELECT * FROM organizations ORDER BY created_at DESC');
      return jsonResponse(orgs);
    }

    if (path === '/api/admin/users' && method === 'GET') {
      const users = await queryAll<any>(
        db,
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at, u.last_login, o.name as organization_name
         FROM platform_users u
         LEFT JOIN organizations o ON u.organization_id = o.id
         ORDER BY u.created_at DESC`
      );
      return jsonResponse(users);
    }

    if (path === '/api/admin/stats' && method === 'GET') {
      const orgCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM organizations');
      const userCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM platform_users');
      const invCount = await queryFirst<{ count: number }>(db, 'SELECT COUNT(*) as count FROM invoices');
      const revTotal = await queryFirst<{ total: number }>(db, 'SELECT SUM(grand_total) as total FROM invoices');

      return jsonResponse({
        totalOrganizations: orgCount?.count || 0,
        totalUsers: userCount?.count || 0,
        totalInvoices: invCount?.count || 0,
        totalPlatformVolume: revTotal?.total || 0,
      });
    }

    if (path === '/api/admin/audit-logs' && method === 'GET') {
      const logs = await queryAll<any>(db, 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
      return jsonResponse(logs);
    }
  }

  return errorResponse('API route not found', 404);
}
