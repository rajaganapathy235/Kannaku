import { AuthSession, LoginPayload, SignupTenantPayload, UserAuthRole } from '../types/auth';
import { SaaSAdminDB } from './adminStorage';
import { KannakuDB } from './storage';
import { TenantOrganizationFull } from '../types/admin';
import { ApiService } from './apiService';

const AUTH_STORAGE_KEY = 'kannaku_auth_session_v1';
const REGISTERED_ACCOUNTS_KEY = 'kannaku_user_credentials_v1';

interface StoredCredential {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  organizationId: string;
  role: UserAuthRole;
  createdAt: string;
}

// Initial registered users for quick testing and production bootstrap
const DEFAULT_CREDENTIALS: StoredCredential[] = [
  {
    email: 'rajaganapathy235@gmail.com',
    passwordHash: '9842755680Qq!',
    name: 'Rajaganapathy S.',
    phone: '9842755680',
    organizationId: 'org_platform_master',
    role: 'SUPER_ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'hytexcottonmills@gmail.com',
    passwordHash: 'hytex123',
    name: 'K. Vasanthi',
    phone: '8870796169',
    organizationId: 'org_hytex_cotton',
    role: 'OWNER',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    email: 'murugan.traders@gmail.com',
    passwordHash: 'murugan123',
    name: 'M. Shanmugam',
    phone: '9841098765',
    organizationId: 'org_sri_murugan',
    role: 'OWNER',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    email: 'accounts@chennaielectro.in',
    passwordHash: 'chennai123',
    name: 'A. Ramanathan',
    phone: '9789012345',
    organizationId: 'org_chennai_electro',
    role: 'OWNER',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    email: 'finance@apexlogistics.in',
    passwordHash: 'apex123',
    name: 'Rohan Deshmukh',
    phone: '9820055443',
    organizationId: 'org_apex_logistics',
    role: 'OWNER',
    createdAt: '2026-08-15T11:00:00Z',
  },
  {
    email: 'orders@karnatakasilks.com',
    passwordHash: 'silks123',
    name: 'Sunita Hegde',
    phone: '9980123456',
    organizationId: 'org_karnataka_silks',
    role: 'OWNER',
    createdAt: '2026-05-10T12:00:00Z',
  },
];

export class AuthService {
  private static getStoredCredentials(): StoredCredential[] {
    try {
      const data = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (!data) return DEFAULT_CREDENTIALS;
      const parsed: StoredCredential[] = JSON.parse(data);
      // Merge DEFAULT_CREDENTIALS to ensure system admin and latest accounts are always present
      const combined = [...parsed];
      DEFAULT_CREDENTIALS.forEach((def) => {
        const existingIdx = combined.findIndex((c) => c.email.toLowerCase() === def.email.toLowerCase());
        if (existingIdx === -1) {
          combined.push(def);
        } else if (def.role === 'SUPER_ADMIN') {
          // Keep superadmin credentials up to date
          combined[existingIdx] = def;
        }
      });
      return combined;
    } catch {
      return DEFAULT_CREDENTIALS;
    }
  }

  private static saveCredentials(creds: StoredCredential[]): void {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(creds));
  }

  // Get current active session
  static getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);
      // Optional expiration check (e.g. 7 days)
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  // Login handler with multi-role support
  static login(payload: LoginPayload): { success: boolean; error?: string; session?: AuthSession } {
    const creds = this.getStoredCredentials();
    const cleanEmail = payload.email.trim().toLowerCase();
    const match = creds.find(
      (c) => c.email.toLowerCase() === cleanEmail && c.passwordHash === payload.password
    );

    if (!match) {
      return { success: false, error: 'Invalid email address or password. Please check your credentials.' };
    }

    let orgName = 'Kannaku Workspace';
    let gstin = '33ASWPV8266F1ZW';
    let planName = 'Pro Trader';

    if (match.role === 'SUPER_ADMIN') {
      orgName = 'Kannaku SaaS Global Headquarters';
      gstin = '33AABCK1234F1Z9';
      planName = 'SuperAdmin Core';
    } else {
      const org = SaaSAdminDB.getOrganizations().find((o) => o.id === match.organizationId);
      if (org) {
        orgName = org.name;
        gstin = org.registerNumber;
        planName = org.planName;
      }
    }

    const expiresDays = payload.rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = {
      token: `jwt_kannaku_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user: {
        id: `usr_${Date.now()}`,
        email: match.email,
        name: match.name,
        phone: match.phone,
        role: match.role,
        adminRole: match.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : undefined,
        organizationId: match.organizationId,
        organizationName: orgName,
        gstin,
        planName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}&background=1A73E8&color=fff`,
      },
      expiresAt,
      loginTimestamp: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    // If tenant user, set active tenant workspace in storage
    if (match.role !== 'SUPER_ADMIN') {
      localStorage.setItem('kannaku_active_tenant_id', match.organizationId);
      KannakuDB.setActiveTenantId(match.organizationId);
      SaaSAdminDB.setPortalMode('CUSTOMER');
    } else {
      SaaSAdminDB.setPortalMode('ADMIN');
    }

    return { success: true, session };
  }

  // Signup new tenant organization and owner user
  static signupTenant(payload: SignupTenantPayload): {
    success: boolean;
    error?: string;
    session?: AuthSession;
  } {
    const cleanEmail = payload.email.trim().toLowerCase();
    const creds = this.getStoredCredentials();

    if (creds.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists. Please login instead.' };
    }

    // Generate Org ID and Slug
    const orgId = `org_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = payload.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const cleanGstin = payload.gstin?.trim().toUpperCase() || '33AABCT9981F1Z1';

    // Create Tenant in SaaSAdminDB
    const newOrg: TenantOrganizationFull = {
      id: orgId,
      name: payload.companyName.trim(),
      slug,
      ownerName: payload.ownerName.trim(),
      adminEmail: cleanEmail,
      mobile: payload.phone.trim(),
      country: 'India',
      city: payload.city.trim() || 'Tiruppur',
      state: payload.state.trim() || 'Tamil Nadu',
      registerNumber: cleanGstin,
      planId: payload.planId || 'plan_pro',
      planName: payload.planId === 'plan_business' ? 'Annual Business Suite' : 'Pro Trader',
      subscriptionStatus: 'TRIAL',
      accountStatus: 'ACTIVE',
      billingCycle: payload.billingCycle || 'MONTHLY',
      subscriptionStartDate: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      mrr: 0,
      usersCount: 1,
      usage: {
        invoicesCreated: 0,
        estimatesCreated: 0,
        customersCount: 0,
        suppliersCount: 0,
        productsCount: 0,
        pdfGenerationsCount: 0,
        gstTaxHandledInr: 0,
        paymentLedgerEntries: 0,
      },
      createdDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      paymentProvider: 'cashfree',
      notes: 'Self-serve onboarding via Web Portal (14-day Pro Trial)',
    };

    const orgs = SaaSAdminDB.getOrganizations();
    orgs.unshift(newOrg);
    SaaSAdminDB.saveOrganizations(orgs);

    // Save user credentials
    const newCred: StoredCredential = {
      email: cleanEmail,
      passwordHash: payload.password,
      name: payload.ownerName.trim(),
      phone: payload.phone.trim(),
      organizationId: orgId,
      role: 'OWNER',
      createdAt: new Date().toISOString(),
    };
    creds.push(newCred);
    this.saveCredentials(creds);

    // Initialize company profile in workspace
    const initialCompany = {
      name: payload.companyName.trim(),
      address: `${payload.city || 'Industrial Area'}, ${payload.state || 'Tamil Nadu'}`,
      city: payload.city.trim() || 'Tiruppur',
      state: payload.state.trim() || 'Tamil Nadu',
      pin: '641604',
      code: '33',
      registerNumber: cleanGstin,
      panNumber: cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : '',
      mobile: payload.phone.trim(),
      email: cleanEmail,
      billPrefix: 'INV/2026/',
      invoicePrefixSales: 'INV/2026/',
      invoicePrefixPurchase: 'PUR/2026/',
      invoicePrefixQuotation: 'QUO/2026/',
      colorScheme: 'blue',
      signatureName: payload.ownerName.trim(),
      termsAndConditions: '1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. charged on overdue bills.',
      jurisdictionCity: payload.city.trim() || 'Tiruppur',
      bankDetail: {
        bankName: 'State Bank of India',
        accountNumber: '',
        ifscCode: '',
        branchName: payload.city || 'Main Branch',
        upiId: `${slug}@sbi`,
        panNumber: cleanGstin.length >= 12 ? cleanGstin.substring(2, 12) : '',
      },
    };

    localStorage.setItem('kannaku_active_tenant_id', orgId);
    KannakuDB.setActiveTenantId(orgId);
    KannakuDB.saveCompanyProfile(initialCompany as any);
    KannakuDB.clearWorkspaceData();

    // Auto-login newly registered tenant
    return this.login({ email: cleanEmail, password: payload.password, rememberMe: true });
  }

  // Logout session
  static logout(): void {
    ApiService.logout().catch(() => {});
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('kannaku_active_tenant_id');
    SaaSAdminDB.stopImpersonation();
  }

  // Server-Side Cloudflare D1 Signup
  static async signupTenantAsync(payload: SignupTenantPayload): Promise<{
    success: boolean;
    error?: string;
    session?: AuthSession;
  }> {
    try {
      const res = await ApiService.signup({
        companyName: payload.companyName,
        ownerName: payload.ownerName,
        email: payload.email,
        mobile: payload.phone,
        password: payload.password,
        state: payload.state,
        gstin: payload.gstin,
      });

      if (res.data?.success && res.data.token) {
        const { user, organization, token } = res.data;
        const session: AuthSession = {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: 'OWNER',
            organizationId: organization.id,
            organizationName: organization.name,
            gstin: payload.gstin || '33AABCT9981F1Z1',
            planName: organization.planName || 'Pro Trader',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1A73E8&color=fff`,
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          loginTimestamp: new Date().toISOString(),
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem('kannaku_active_tenant_id', organization.id);
        KannakuDB.setActiveTenantId(organization.id);
        SaaSAdminDB.setPortalMode('CUSTOMER');

        return { success: true, session };
      }
    } catch {
      // fallback
    }

    return this.signupTenant(payload);
  }

  // Server-Side Cloudflare D1 Login
  static async loginAsync(payload: LoginPayload): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
    try {
      const res = await ApiService.login(payload.email, payload.password);
      if (res.data?.success && res.data.token) {
        const { user, organization, token } = res.data;
        const expiresDays = payload.rememberMe ? 30 : 7;
        const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

        const session: AuthSession = {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            adminRole: user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : undefined,
            organizationId: organization?.id || user.organizationId,
            organizationName: organization?.name || 'Kannaku Workspace',
            gstin: organization?.register_number || organization?.registerNumber || '33ASWPV8266F1ZW',
            planName: organization?.plan_name || organization?.planName || 'Pro Trader',
            avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1A73E8&color=fff`,
          },
          expiresAt,
          loginTimestamp: new Date().toISOString(),
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

        if (session.user.role !== 'SUPER_ADMIN') {
          localStorage.setItem('kannaku_active_tenant_id', session.user.organizationId);
          KannakuDB.setActiveTenantId(session.user.organizationId);
          SaaSAdminDB.setPortalMode('CUSTOMER');
        } else {
          SaaSAdminDB.setPortalMode('ADMIN');
        }

        return { success: true, session };
      }
    } catch {
      // Fallback to local
    }

    // Local fallback
    return this.login(payload);
  }

  // Quick Switch / Preset helper for demonstration and test drive
  static quickSwitchRole(email: string): AuthSession | null {
    const cred = DEFAULT_CREDENTIALS.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!cred) return null;
    const res = this.login({ email: cred.email, password: cred.passwordHash, rememberMe: true });
    return res.session || null;
  }
}
