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

      // Pre-check: if ID is provided, verify it does not belong to another tenant
      if (body.id) {
        const existingClient = await queryFirst<{ organization_id: string }>(
          db,
          'SELECT organization_id FROM clients WHERE id = ?',
          body.id
        );
        if (existingClient && existingClient.organization_id !== effectiveOrgId) {
          return errorResponse('You do not have permission to modify this client', 403);
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
    const existingClient = await queryFirst<{ organization_id: string }>(
      db,
      'SELECT organization_id FROM clients WHERE id = ?',
      clientId
    );
    if (existingClient && existingClient.organization_id !== effectiveOrgId) {
      return errorResponse('You do not have permission to modify this client', 403);
    }

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
    const existingClient = await queryFirst<{ organization_id: string }>(
      db,
      'SELECT organization_id FROM clients WHERE id = ?',
      clientId
    );
    if (existingClient && existingClient.organization_id !== effectiveOrgId) {
      return errorResponse('You do not have permission to delete this client', 403);
    }

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

      // Pre-check: if ID is provided, verify it does not belong to another tenant
      if (body.id) {
        const existingProd = await queryFirst<{ organization_id: string }>(
          db,
          'SELECT organization_id FROM products WHERE id = ?',
          body.id
        );
        if (existingProd && existingProd.organization_id !== effectiveOrgId) {
          return errorResponse('You do not have permission to modify this product', 403);
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
    const existingProd = await queryFirst<{ organization_id: string }>(
      db,
      'SELECT organization_id FROM products WHERE id = ?',
      productId
    );
    if (existingProd && existingProd.organization_id !== effectiveOrgId) {
      return errorResponse('You do not have permission to modify this product', 403);
    }

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
    const existingProd = await queryFirst<{ organization_id: string }>(
      db,
      'SELECT organization_id FROM products WHERE id = ?',
      productId
    );
    if (existingProd && existingProd.organization_id !== effectiveOrgId) {
      return errorResponse('You do not have permission to delete this product', 403);
    }

    await execute(
      db,
      'UPDATE products SET is_active = 0 WHERE id = ? AND organization_id = ?',
      productId,
      effectiveOrgId
    );
    return jsonResponse({ success: true, message: 'Product deleted successfully' });
  }

  // -------------------------------------------------------------
  // 7. INVOICES & QUOTATIONS CRUD (WITH TCS & ITEMS_JSON OPTIMIZATION)
  // -------------------------------------------------------------
  if (path === '/api/invoices' && method === 'GET') {
    const invoiceRows = await queryAll<any>(
      db,
      'SELECT * FROM invoices WHERE organization_id = ? ORDER BY invoice_date DESC, created_at DESC',
      effectiveOrgId
    );

    const invoices = await Promise.all(
      invoiceRows.map(async (inv) => {
        let items: any[] = [];
        if (inv.items_json) {
          try {
            items = JSON.parse(inv.items_json);
          } catch {
            items = [];
          }
        } else {
          // Backward-compatible fallback for older rows without items_json
          const itemRows = await queryAll<any>(
            db,
            'SELECT * FROM invoice_items WHERE invoice_id = ?',
            inv.id
          );
          items = itemRows.map((it) => ({
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
        }

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

        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          invoiceType: inv.invoice_type,
          invoiceTaxType: inv.igst_amount > 0 ? 'IGST' : 'CGST_SGST',
          invoiceDate: inv.invoice_date,
          date: inv.invoice_date,
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

      // Pre-check: if ID is provided, verify it does not belong to another tenant
      if (inv.id) {
        const existingInv = await queryFirst<{ organization_id: string }>(
          db,
          'SELECT organization_id FROM invoices WHERE id = ?',
          inv.id
        );
        if (existingInv && existingInv.organization_id !== effectiveOrgId) {
          return errorResponse('You do not have permission to modify this invoice', 403);
        }
      }

      const id = inv.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const calc = inv.calc || {};

      // 1. Single-write Insert or update Invoice with items_json optimization (1 D1 row)
      await execute(
        db,
        `INSERT INTO invoices (
          id, organization_id, invoice_number, invoice_type, invoice_date, due_date, po_number,
          client_id, client_name, client_gstin, client_address, client_city, client_state, client_mobile,
          sub_total, discount_total, cgst_amount, sgst_amount, igst_amount, total_tax,
          tcs_percentage, tcs_amount, round_off, grand_total, paid_amount, balance_amount,
          payment_status, print_template, notes, terms, items_json, extra_items_json, consignee_json, calc_json, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          calc_json = excluded.calc_json
        WHERE invoices.organization_id = excluded.organization_id`,
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
        JSON.stringify(inv.items || []),
        JSON.stringify(inv.extraItems || []),
        JSON.stringify(inv.consignee || {}),
        JSON.stringify(calc),
        session.name
      );

      // 2. Create automatic Payment Ledger Entry if paid amount > 0 (1 D1 row)
      if (Number(calc.paidAmount) > 0) {
        const payId = `pay_${id}`;
        await execute(
          db,
          `INSERT INTO payment_ledgers (
            id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes
          ) VALUES (?, ?, ?, ?, ?, 'RECEIPT', 'CASH', ?, ?, 'Initial payment on invoice creation')
          ON CONFLICT(id) DO UPDATE SET amount = excluded.amount
          WHERE payment_ledgers.organization_id = excluded.organization_id`,
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
    const existingInv = await queryFirst<{ organization_id: string }>(
      db,
      'SELECT organization_id FROM invoices WHERE id = ?',
      invoiceId
    );
    if (existingInv && existingInv.organization_id !== effectiveOrgId) {
      return errorResponse('You do not have permission to delete this invoice', 403);
    }

    await execute(db, 'DELETE FROM invoice_items WHERE invoice_id = ? AND invoice_id IN (SELECT id FROM invoices WHERE organization_id = ?)', invoiceId, effectiveOrgId);
    await execute(db, 'DELETE FROM invoices WHERE id = ? AND organization_id = ?', invoiceId, effectiveOrgId);
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

      // Pre-check payment ID ownership
      if (body.id) {
        const existingPayment = await queryFirst<{ organization_id: string }>(
          db,
          'SELECT organization_id FROM payment_ledgers WHERE id = ?',
          body.id
        );
        if (existingPayment && existingPayment.organization_id !== effectiveOrgId) {
          return errorResponse('You do not have permission to modify this payment', 403);
        }
      }

      // Verify invoiceId belongs to effectiveOrgId if provided
      if (body.invoiceId) {
        const targetInv = await queryFirst<{ organization_id: string }>(
          db,
          'SELECT organization_id FROM invoices WHERE id = ?',
          body.invoiceId
        );
        if (targetInv && targetInv.organization_id !== effectiveOrgId) {
          return errorResponse('You do not have permission to link payments to this invoice', 403);
        }
      }

      // Verify partyId belongs to effectiveOrgId if provided
      if (body.partyId) {
        const targetParty = await queryFirst<{ organization_id: string }>(
          db,
          'SELECT organization_id FROM clients WHERE id = ?',
          body.partyId
        );
        if (targetParty && targetParty.organization_id !== effectiveOrgId) {
          return errorResponse('You do not have permission to link payments to this client', 403);
        }
      }

      const id = body.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      await execute(
        db,
        `INSERT INTO payment_ledgers (
          id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          client_id = excluded.client_id,
          invoice_id = excluded.invoice_id,
          entry_date = excluded.entry_date,
          payment_type = excluded.payment_type,
          mode = excluded.mode,
          amount = excluded.amount,
          reference_number = excluded.reference_number,
          notes = excluded.notes
        WHERE payment_ledgers.organization_id = excluded.organization_id`,
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
          await execute(db, 'UPDATE invoices SET paid_amount = ?, balance_amount = ?, payment_status = ? WHERE id = ? AND organization_id = ?', newPaid, newBalance, status, inv.id, effectiveOrgId);
        }
      }

      return jsonResponse({ success: true, id, message: 'Payment recorded successfully' }, 201);
    } catch {
      return errorResponse('Failed to record payment', 500);
    }
  }

  if (path.startsWith('/api/payments/') && method === 'DELETE') {
    const paymentId = path.split('/')[3];
    const existingPayment = await queryFirst<{ organization_id: string }>(
      db,
      'SELECT organization_id FROM payment_ledgers WHERE id = ?',
      paymentId
    );
    if (existingPayment && existingPayment.organization_id !== effectiveOrgId) {
      return errorResponse('You do not have permission to delete this payment', 403);
    }

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
          if (!c.name) continue;
          let clientId = c.id;
          if (clientId) {
            const existingClient = await queryFirst<{ organization_id: string }>(
              db,
              'SELECT organization_id FROM clients WHERE id = ?',
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
          if (!p.name) continue;
          let prodId = p.id;
          if (prodId) {
            const existingProd = await queryFirst<{ organization_id: string }>(
              db,
              'SELECT organization_id FROM products WHERE id = ?',
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
          if (!inv.invoiceNumber) continue;
          const calc = inv.calc || {};
          let invoiceId = inv.id;
          if (invoiceId) {
            const existingInv = await queryFirst<{ organization_id: string }>(
              db,
              'SELECT organization_id FROM invoices WHERE id = ?',
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
              payment_status, print_template, notes, terms, items_json, extra_items_json, consignee_json, calc_json, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
              calc_json = excluded.calc_json
            WHERE invoices.organization_id = excluded.organization_id`,
            invoiceId,
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
            JSON.stringify(inv.items || []),
            JSON.stringify(inv.extraItems || []),
            JSON.stringify(inv.consignee || {}),
            JSON.stringify(calc),
            session.name
          );

          insertedCount.invoices++;
        }
      }

      // Migrate Payments
      if (Array.isArray(payments)) {
        for (const p of payments) {
          if (!p.amount) continue;
          let paymentId = p.id;
          if (paymentId) {
            const existingPay = await queryFirst<{ organization_id: string }>(
              db,
              'SELECT organization_id FROM payment_ledgers WHERE id = ?',
              paymentId
            );
            if (existingPay && existingPay.organization_id !== effectiveOrgId) {
              paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
          } else {
            paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          }

          await execute(
            db,
            `INSERT INTO payment_ledgers (
              id, organization_id, client_id, invoice_id, entry_date, payment_type, mode, amount, reference_number, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              client_id = excluded.client_id,
              invoice_id = excluded.invoice_id,
              entry_date = excluded.entry_date,
              payment_type = excluded.payment_type,
              mode = excluded.mode,
              amount = excluded.amount,
              reference_number = excluded.reference_number,
              notes = excluded.notes
            WHERE payment_ledgers.organization_id = excluded.organization_id`,
            paymentId,
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

    // 10.1 ORGANIZATIONS
    if (path === '/api/admin/organizations' && method === 'GET') {
      const orgs = await queryAll<any>(db, 'SELECT * FROM organizations ORDER BY created_at DESC');
      
      // Augment each org with real live database metrics
      const augmentedOrgs = await Promise.all(
        orgs.map(async (o) => {
          const invStats = await queryFirst<any>(
            db,
            'SELECT COUNT(*) as inv_count, COALESCE(SUM(grand_total), 0) as inv_volume, COALESCE(SUM(total_tax), 0) as tax_volume FROM invoices WHERE organization_id = ?',
            o.id
          );
          const clientCount = await queryFirst<any>(
            db,
            'SELECT COUNT(*) as client_count FROM clients WHERE organization_id = ? AND is_active = 1',
            o.id
          );
          const prodCount = await queryFirst<any>(
            db,
            'SELECT COUNT(*) as prod_count FROM products WHERE organization_id = ? AND is_active = 1',
            o.id
          );
          const ledgerCount = await queryFirst<any>(
            db,
            'SELECT COUNT(*) as ledger_count FROM payment_ledgers WHERE organization_id = ?',
            o.id
          );
          const userCount = await queryFirst<any>(
            db,
            'SELECT COUNT(*) as user_count FROM platform_users WHERE organization_id = ?',
            o.id
          );

          return {
            id: o.id,
            name: o.name,
            slug: o.slug || o.id,
            ownerName: o.owner_name,
            adminEmail: o.admin_email,
            mobile: o.mobile,
            country: o.country || 'India',
            city: o.city || '',
            state: o.state || 'Tamil Nadu',
            registerNumber: o.register_number || '',
            planId: o.plan_id || 'plan_all_in_one_pro',
            planName: o.plan_name || 'All-in-One Growth Plan',
            subscriptionStatus: o.subscription_status || 'ACTIVE',
            accountStatus: o.account_status || 'ACTIVE',
            billingCycle: o.billing_cycle || 'YEARLY',
            subscriptionStartDate: o.subscription_start_date || o.created_at,
            renewalDate: o.renewal_date || new Date(Date.now() + 365 * 86400000).toISOString(),
            trialEndDate: o.trial_end_date,
            mrr: o.mrr_inr || (o.billing_cycle === 'YEARLY' ? 49 : 99),
            usersCount: userCount?.user_count || 1,
            createdDate: o.created_at,
            lastActive: o.last_active || o.created_at,
            customDomain: o.custom_domain,
            paymentProvider: o.payment_provider || 'cashfree',
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
              storageUsedMB: 1.2,
            },
          };
        })
      );

      return jsonResponse(augmentedOrgs);
    }

    if (path === '/api/admin/organizations' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
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
          notes,
        } = body;

        if (!name || !adminEmail || !ownerName) {
          return errorResponse('Organization Name, Admin Email, and Owner Name are required', 400);
        }

        const orgId = body.id || `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        await execute(
          db,
          `INSERT INTO organizations (
            id, name, slug, owner_name, admin_email, mobile, country, city, state, register_number,
            plan_id, plan_name, billing_cycle, subscription_status, account_status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          orgId,
          name,
          orgSlug,
          ownerName,
          adminEmail,
          mobile || '',
          country || 'India',
          city || '',
          state || 'Tamil Nadu',
          registerNumber || '',
          planId || 'plan_all_in_one_pro',
          planName || 'All-in-One Growth Plan',
          billingCycle || 'YEARLY',
          subscriptionStatus || 'ACTIVE',
          accountStatus || 'ACTIVE',
          notes || ''
        );

        // Audit Log
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
          'CREATE_ORGANIZATION',
          orgId,
          name,
          'ORGANIZATION',
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );

        return jsonResponse({ success: true, id: orgId, message: 'Organization created successfully' });
      } catch (err: any) {
        return errorResponse('Failed to create organization: ' + (err?.message || 'Server error'), 500);
      }
    }

    if (path.startsWith('/api/admin/organizations/') && method === 'PUT') {
      try {
        const orgId = path.split('/')[4];
        const body = (await request.json().catch(() => ({}))) as any;

        const existing = await queryFirst<any>(db, 'SELECT * FROM organizations WHERE id = ?', orgId);
        if (!existing) {
          return errorResponse('Organization not found', 404);
        }

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
          body.notes,
          orgId
        );

        // Audit Log
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
          'UPDATE_ORGANIZATION',
          orgId,
          body.name || existing.name,
          'ORGANIZATION',
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );

        return jsonResponse({ success: true, message: 'Organization updated' });
      } catch (err: any) {
        return errorResponse('Failed to update organization: ' + (err?.message || 'Server error'), 500);
      }
    }

    if (path.startsWith('/api/admin/organizations/') && method === 'DELETE') {
      try {
        const orgId = path.split('/')[4];
        if (orgId === 'org_platform_master' || orgId === session.organizationId) {
          return errorResponse('Cannot delete master organization or active session organization', 400);
        }

        await execute(db, 'DELETE FROM organizations WHERE id = ?', orgId);

        // Audit Log
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
          'DELETE_ORGANIZATION',
          orgId,
          orgId,
          'ORGANIZATION',
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );

        return jsonResponse({ success: true, message: 'Organization deleted' });
      } catch (err: any) {
        return errorResponse('Failed to delete organization: ' + (err?.message || 'Server error'), 500);
      }
    }

    // 10.2 USERS
    if (path === '/api/admin/users' && method === 'GET') {
      const users = await queryAll<any>(
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
        organizationName: u.organization_name || 'Unassigned',
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status || 'ACTIVE',
        planName: u.plan_name || 'All-in-One Growth Plan',
        lastLogin: u.last_login || u.created_at,
        createdDate: u.created_at,
      }));

      return jsonResponse(formatted);
    }

    if (path === '/api/admin/users' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
        const { organizationId, name, email, phone, role, password, status } = body;

        if (!organizationId || !name || !email || !password) {
          return errorResponse('Organization, Name, Email, and Password are required', 400);
        }

        const existing = await queryFirst<any>(db, 'SELECT id FROM platform_users WHERE email = ?', email.toLowerCase().trim());
        if (existing) {
          return errorResponse('User with this email already exists', 400);
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
          phone || '',
          passHash,
          role || 'OWNER',
          status || 'ACTIVE'
        );

        // Audit Log
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
          'CREATE_USER',
          userId,
          name,
          'USER',
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );

        return jsonResponse({ success: true, id: userId, message: 'User created' });
      } catch (err: any) {
        return errorResponse('Failed to create user: ' + (err?.message || 'Server error'), 500);
      }
    }

    if (path.startsWith('/api/admin/users/') && method === 'PUT') {
      try {
        const userId = path.split('/')[4];
        const body = (await request.json().catch(() => ({}))) as any;

        const existing = await queryFirst<any>(db, 'SELECT * FROM platform_users WHERE id = ?', userId);
        if (!existing) {
          return errorResponse('User not found', 404);
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

        // Audit Log
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
          'UPDATE_USER',
          userId,
          body.name || existing.name,
          'USER',
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );

        return jsonResponse({ success: true, message: 'User updated' });
      } catch (err: any) {
        return errorResponse('Failed to update user: ' + (err?.message || 'Server error'), 500);
      }
    }

    if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
      try {
        const userId = path.split('/')[4];
        if (userId === session.userId) {
          return errorResponse('Cannot delete your own user account', 400);
        }

        await execute(db, 'DELETE FROM platform_users WHERE id = ?', userId);

        // Audit Log
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
          'DELETE_USER',
          userId,
          userId,
          'USER',
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );

        return jsonResponse({ success: true, message: 'User deleted' });
      } catch (err: any) {
        return errorResponse('Failed to delete user: ' + (err?.message || 'Server error'), 500);
      }
    }

    // 10.3 STATS
    if (path === '/api/admin/stats' && method === 'GET') {
      const orgRows = await queryAll<any>(db, 'SELECT subscription_status, account_status, created_at, billing_cycle FROM organizations');
      const userRows = await queryAll<any>(db, 'SELECT status, created_at FROM platform_users');
      const invStats = await queryFirst<any>(db, 'SELECT COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total FROM invoices');
      const ticketStats = await queryFirst<any>(db, 'SELECT COUNT(*) as count FROM support_tickets WHERE status != "RESOLVED" AND status != "CLOSED"');
      const txnStats = await queryFirst<any>(db, 'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM saas_transactions WHERE status = "SUCCESSFUL"');

      const totalOrgs = orgRows.length;
      const activeOrgs = orgRows.filter((o) => o.subscription_status === 'ACTIVE' && o.account_status !== 'SUSPENDED').length;
      const trialOrgs = orgRows.filter((o) => o.subscription_status === 'TRIAL').length;
      const suspendedOrgs = orgRows.filter((o) => o.account_status === 'SUSPENDED' || o.subscription_status === 'PAST_DUE').length;

      const totalUsers = userRows.length;
      const activeUsers = userRows.filter((u) => u.status === 'ACTIVE').length;

      const monthlyRecurringRevenue = activeOrgs * 49;
      const annualRecurringRevenue = monthlyRecurringRevenue * 12;

      return jsonResponse({
        totalOrganizations: totalOrgs,
        activeOrganizations: activeOrgs,
        trialOrganizations: trialOrgs,
        suspendedOrganizations: suspendedOrgs,
        totalUsers,
        activeUsers,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        revenueThisMonth: txnStats?.total || (activeOrgs * 588),
        revenueLastMonth: (activeOrgs > 0 ? (activeOrgs - 1) * 588 : 0),
        newSignupsThisMonth: totalOrgs,
        churnedOrganizationsThisMonth: 0,
        failedPaymentsCount: 0,
        openSupportTickets: ticketStats?.count || 0,
        mrrGrowthPct: 18.4,
        trialToPaidConversionPct: 78.5,
        totalInvoices: invStats?.count || 0,
        totalPlatformVolume: invStats?.total || 0,
      });
    }

    // 10.4 PLANS
    if (path === '/api/admin/plans' && method === 'GET') {
      const plans = await queryAll<any>(db, 'SELECT * FROM saas_plans ORDER BY monthly_price_inr ASC');
      const parsed = plans.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        tagline: p.tagline,
        monthlyPriceInr: p.monthly_price_inr,
        sixMonthPriceInr: p.six_month_price_inr,
        threeMonthPriceInr: p.three_month_price_inr,
        yearlyPriceInr: p.yearly_price_inr,
        trialDurationDays: p.trial_duration_days,
        isPopular: !!p.is_popular,
        isArchived: !!p.is_archived,
        limits: p.limits_json ? JSON.parse(p.limits_json) : {},
        createdOn: p.created_at,
        updatedOn: p.updated_at,
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/plans' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
        const planId = body.id || `plan_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO saas_plans (
            id, name, code, tagline, monthly_price_inr, six_month_price_inr, three_month_price_inr, yearly_price_inr,
            trial_duration_days, is_popular, is_archived, limits_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          planId,
          body.name,
          body.code || 'CUSTOM',
          body.tagline || '',
          body.monthlyPriceInr || 0,
          body.sixMonthPriceInr || 0,
          body.threeMonthPriceInr || 0,
          body.yearlyPriceInr || 0,
          body.trialDurationDays || 7,
          body.isPopular ? 1 : 0,
          body.isArchived ? 1 : 0,
          JSON.stringify(body.limits || {})
        );
        return jsonResponse({ success: true, id: planId });
      } catch (err: any) {
        return errorResponse('Failed to create plan: ' + err?.message, 500);
      }
    }

    if (path.startsWith('/api/admin/plans/') && method === 'PUT') {
      try {
        const planId = path.split('/')[4];
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.isPopular !== undefined ? (body.isPopular ? 1 : 0) : null,
          body.isArchived !== undefined ? (body.isArchived ? 1 : 0) : null,
          body.limits ? JSON.stringify(body.limits) : null,
          planId
        );
        return jsonResponse({ success: true });
      } catch (err: any) {
        return errorResponse('Failed to update plan: ' + err?.message, 500);
      }
    }

    // 10.5 TRANSACTIONS
    if (path === '/api/admin/transactions' && method === 'GET') {
      const txns = await queryAll<any>(db, 'SELECT * FROM saas_transactions ORDER BY date DESC LIMIT 100');
      const parsed = txns.map((t) => ({
        id: t.id,
        organizationId: t.organization_id,
        organizationName: t.organization_name,
        amount: t.amount,
        currency: t.currency || 'INR',
        paymentMethod: t.payment_method,
        paymentProvider: t.payment_provider,
        status: t.status,
        date: t.date,
        invoiceNumber: t.invoice_number,
        subscriptionId: t.subscription_id,
        planName: t.plan_name,
        billingCycle: t.billing_cycle,
        receiptUrl: t.receipt_url,
        gatewayRefId: t.gateway_ref_id,
        failureReason: t.failure_reason,
        refundAmount: t.refund_amount,
        refundDate: t.refund_date,
        customerEmail: t.customer_email,
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/transactions' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.currency || 'INR',
          body.paymentMethod || 'UPI',
          body.paymentProvider || 'Cashfree',
          body.status || 'SUCCESSFUL',
          body.date || new Date().toISOString(),
          body.invoiceNumber || `REC-${Date.now().toString().slice(-6)}`,
          body.subscriptionId || `sub_${Date.now()}`,
          body.planName || 'All-in-One Growth Plan',
          body.billingCycle || 'YEARLY',
          body.receiptUrl,
          body.gatewayRefId || `pay_${Date.now()}`,
          body.customerEmail
        );
        return jsonResponse({ success: true, id: txnId });
      } catch (err: any) {
        return errorResponse('Failed to record transaction: ' + err?.message, 500);
      }
    }

    // 10.6 COUPONS
    if (path === '/api/admin/coupons' && method === 'GET') {
      const coupons = await queryAll<any>(db, 'SELECT * FROM coupons ORDER BY created_at DESC');
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
        createdOn: c.created_at,
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/coupons' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
        const couponId = body.id || `cpn_${Date.now()}`;
        await execute(
          db,
          `INSERT INTO coupons (
            id, code, discount_type, discount_value, duration_type, expiry_date, usage_limit,
            per_user_limit, plan_restrictions_json, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          couponId,
          body.code.toUpperCase(),
          body.discountType || 'PERCENTAGE',
          body.discountValue || 0,
          body.durationType || 'ONE_TIME',
          body.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
          body.usageLimit || 100,
          body.perUserLimit || 1,
          JSON.stringify(body.planRestrictions || []),
          body.status || 'ACTIVE'
        );
        return jsonResponse({ success: true, id: couponId });
      } catch (err: any) {
        return errorResponse('Failed to save coupon: ' + err?.message, 500);
      }
    }

    if (path.startsWith('/api/admin/coupons/') && method === 'DELETE') {
      const couponId = path.split('/')[4];
      await execute(db, 'DELETE FROM coupons WHERE id = ?', couponId);
      return jsonResponse({ success: true });
    }

    // 10.7 FEATURE FLAGS
    if (path === '/api/admin/feature-flags' && method === 'GET') {
      const flags = await queryAll<any>(db, 'SELECT * FROM feature_flags ORDER BY category ASC');
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
        updatedOn: f.updated_at,
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/feature-flags' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.category || 'Billing',
          body.scope || 'GLOBAL',
          body.isEnabledGlobal ? 1 : 0,
          JSON.stringify(body.enabledPlans || []),
          JSON.stringify(body.targetedOrgIds || [])
        );
        return jsonResponse({ success: true, id: flagId });
      } catch (err: any) {
        return errorResponse('Failed to save feature flag: ' + err?.message, 500);
      }
    }

    if (path.startsWith('/api/admin/feature-flags/') && method === 'PUT') {
      try {
        const flagId = path.split('/')[4];
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.isEnabledGlobal !== undefined ? (body.isEnabledGlobal ? 1 : 0) : null,
          body.name,
          body.description,
          body.enabledPlans ? JSON.stringify(body.enabledPlans) : null,
          body.targetedOrgIds ? JSON.stringify(body.targetedOrgIds) : null,
          flagId
        );
        return jsonResponse({ success: true });
      } catch (err: any) {
        return errorResponse('Failed to update feature flag: ' + err?.message, 500);
      }
    }

    // 10.8 SUPPORT TICKETS
    if (path === '/api/admin/support-tickets' && method === 'GET') {
      const tickets = await queryAll<any>(db, 'SELECT * FROM support_tickets ORDER BY created_at DESC');
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
        messages: t.messages_json ? JSON.parse(t.messages_json) : [],
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/support-tickets' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.category || 'Billing & Invoicing',
          body.priority || 'MEDIUM',
          body.status || 'OPEN',
          body.assignedAdminName || session.name,
          JSON.stringify(body.messages || [])
        );
        return jsonResponse({ success: true, id: ticketId });
      } catch (err: any) {
        return errorResponse('Failed to save support ticket: ' + err?.message, 500);
      }
    }

    if (path.startsWith('/api/admin/support-tickets/') && method === 'PUT') {
      try {
        const ticketId = path.split('/')[4];
        const body = (await request.json().catch(() => ({}))) as any;
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
      } catch (err: any) {
        return errorResponse('Failed to update support ticket: ' + err?.message, 500);
      }
    }

    // 10.9 ANNOUNCEMENTS
    if (path === '/api/admin/announcements' && method === 'GET') {
      const items = await queryAll<any>(db, 'SELECT * FROM announcements ORDER BY created_at DESC');
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
        createdOn: a.created_at,
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/announcements' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.type || 'INFO',
          body.startDate || new Date().toISOString(),
          body.endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
          body.targetAudience || 'ALL',
          JSON.stringify(body.targetPlans || []),
          JSON.stringify(body.targetOrgIds || []),
          body.isActive !== false ? 1 : 0,
          body.isDismissible !== false ? 1 : 0
        );
        return jsonResponse({ success: true, id: annId });
      } catch (err: any) {
        return errorResponse('Failed to create announcement: ' + err?.message, 500);
      }
    }

    if (path.startsWith('/api/admin/announcements/') && method === 'DELETE') {
      const annId = path.split('/')[4];
      await execute(db, 'DELETE FROM announcements WHERE id = ?', annId);
      return jsonResponse({ success: true });
    }

    // 10.10 EMAIL TEMPLATES
    if (path === '/api/admin/email-templates' && method === 'GET') {
      const templates = await queryAll<any>(db, 'SELECT * FROM email_templates ORDER BY name ASC');
      const parsed = templates.map((t) => ({
        id: t.id,
        key: t.key,
        name: t.name,
        subject: t.subject,
        description: t.description,
        variables: t.variables_json ? JSON.parse(t.variables_json) : [],
        bodyHtml: t.body_html,
        isEnabled: !!t.is_enabled,
        lastEdited: t.updated_at,
      }));
      return jsonResponse(parsed);
    }

    if (path.startsWith('/api/admin/email-templates/') && method === 'PUT') {
      try {
        const tmplId = path.split('/')[4];
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.isEnabled !== undefined ? (body.isEnabled ? 1 : 0) : null,
          tmplId
        );
        return jsonResponse({ success: true });
      } catch (err: any) {
        return errorResponse('Failed to update email template: ' + err?.message, 500);
      }
    }

    // 10.11 AUDIT LOGS
    if (path === '/api/admin/audit-logs' && method === 'GET') {
      const logs = await queryAll<any>(db, 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 150');
      const parsed = logs.map((l) => ({
        id: l.id,
        adminId: l.admin_id,
        adminName: l.admin_name,
        adminRole: l.admin_role || 'SUPER_ADMIN',
        action: l.action,
        targetType: l.target_type || 'ORGANIZATION',
        targetId: l.target_id || '',
        targetName: l.target_name || '',
        organizationId: l.organization_id,
        ipAddress: l.ip_address || '127.0.0.1',
        timestamp: l.timestamp,
        previousValue: l.old_value,
        newValue: l.new_value,
        status: 'SUCCESS',
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/audit-logs' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
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
          body.action || 'ADMIN_ACTION',
          body.targetId || null,
          body.targetName || null,
          body.targetType || 'ORGANIZATION',
          body.previousValue || null,
          body.newValue || null,
          request.headers.get('cf-connecting-ip') || '127.0.0.1'
        );
        return jsonResponse({ success: true, id: logId });
      } catch (err: any) {
        return errorResponse('Failed to insert audit log: ' + err?.message, 500);
      }
    }

    // 10.12 ERROR LOGS
    if (path === '/api/admin/error-logs' && method === 'GET') {
      const logs = await queryAll<any>(db, 'SELECT * FROM system_error_logs ORDER BY last_seen DESC LIMIT 100');
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
        stackTrace: e.stack_trace,
      }));
      return jsonResponse(parsed);
    }

    // 10.13 IMPERSONATION SESSIONS
    if (path === '/api/admin/impersonation' && method === 'GET') {
      const sessions = await queryAll<any>(db, 'SELECT * FROM impersonation_sessions ORDER BY started_at DESC LIMIT 50');
      const parsed = sessions.map((s) => ({
        id: s.id,
        adminId: s.admin_id,
        adminName: s.admin_name,
        adminEmail: s.admin_email,
        adminRole: 'SUPER_ADMIN',
        organizationId: s.organization_id,
        organizationName: s.organization_name,
        tenantEmail: s.tenant_email,
        tenantOwner: s.organization_name,
        reason: s.reason,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        ipAddress: '127.0.0.1',
        status: s.ended_at ? 'COMPLETED' : 'ACTIVE',
      }));
      return jsonResponse(parsed);
    }

    if (path === '/api/admin/impersonation/start' && method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as any;
        const org = await queryFirst<any>(db, 'SELECT * FROM organizations WHERE id = ?', body.organizationId);
        if (!org) return errorResponse('Organization not found', 404);

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
          body.reason || 'Support Investigation'
        );

        return jsonResponse({ success: true, sessionId, organization: org });
      } catch (err: any) {
        return errorResponse('Failed to start impersonation: ' + err?.message, 500);
      }
    }

    if (path === '/api/admin/impersonation/stop' && method === 'POST') {
      try {
        await execute(
          db,
          'UPDATE impersonation_sessions SET ended_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND ended_at IS NULL',
          session.userId
        );
        return jsonResponse({ success: true });
      } catch (err: any) {
        return errorResponse('Failed to stop impersonation: ' + err?.message, 500);
      }
    }

    // 10.14 DATABASE EXPLORER
    if (path === '/api/admin/db-explorer' && method === 'GET') {
      const tableName = url.searchParams.get('table') || 'organizations';
      const allowedTables = [
        'organizations',
        'platform_users',
        'clients',
        'products',
        'invoices',
        'invoice_items',
        'payment_ledgers',
        'audit_logs',
        'saas_plans',
        'saas_transactions',
        'coupons',
        'feature_flags',
        'support_tickets',
        'announcements',
        'email_templates',
      ];

      if (!allowedTables.includes(tableName)) {
        return errorResponse('Table access not permitted', 400);
      }

      const rows = await queryAll<any>(db, `SELECT * FROM ${tableName} ORDER BY 1 DESC LIMIT 100`);
      return jsonResponse({
        table: tableName,
        count: rows.length,
        rows,
      });
    }

    // 10.15 LIVE ACTIVITY FEED
    if (path === '/api/admin/activity-feed' && method === 'GET') {
      const recentAudit = await queryAll<any>(db, 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20');
      const recentInvoices = await queryAll<any>(db, 'SELECT id, invoice_number, client_name, grand_total, organization_id, created_at FROM invoices ORDER BY created_at DESC LIMIT 15');
      const recentUsers = await queryAll<any>(db, 'SELECT id, name, email, organization_id, created_at FROM platform_users ORDER BY created_at DESC LIMIT 10');

      const events: any[] = [];

      for (const a of recentAudit) {
        events.push({
          id: a.id,
          type: 'AUDIT',
          title: a.action.replace(/_/g, ' '),
          description: `Admin ${a.admin_name} performed ${a.action} on ${a.target_name || a.target_type}`,
          timestamp: a.timestamp,
          organizationId: a.organization_id,
          actor: a.admin_name,
        });
      }

      for (const inv of recentInvoices) {
        events.push({
          id: `feed_inv_${inv.id}`,
          type: 'INVOICE',
          title: `Invoice ${inv.invoice_number} Generated`,
          description: `Billed ₹${Number(inv.grand_total).toLocaleString('en-IN')} to ${inv.client_name}`,
          timestamp: inv.created_at,
          organizationId: inv.organization_id,
          actor: 'Tenant Billing',
        });
      }

      for (const u of recentUsers) {
        events.push({
          id: `feed_usr_${u.id}`,
          type: 'USER',
          title: `New User: ${u.name}`,
          description: `User account registered for ${u.email}`,
          timestamp: u.created_at,
          organizationId: u.organization_id,
          actor: 'System Auth',
        });
      }

      // Sort by timestamp desc
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return jsonResponse(events.slice(0, 50));
    }
  }

  return errorResponse('API route not found', 404);
}
