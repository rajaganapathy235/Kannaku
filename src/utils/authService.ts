import { AuthSession, LoginPayload, SignupTenantPayload, UserAuthRole } from '../types/auth';
import { SaaSAdminDB } from './adminStorage';
import { KannakuDB } from './storage';
import { TenantOrganizationFull } from '../types/admin';
import { ApiService } from './apiService';

const AUTH_STORAGE_KEY = 'kannaku_auth_session_v1';

export class AuthService {
  /**
   * Get current active session.
   * Reads non-sensitive session metadata from localStorage.
   * Authentication is enforced via HttpOnly cookie (kannaku_session).
   */
  static getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);

      if (!session || !session.user || !session.user.id) {
        this.logout();
        return null;
      }

      // Check expiration
      if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
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

      if (res.success && res.data?.user) {
        const { user, organization } = res.data;
        const session: AuthSession = {
          token: res.data.token,
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

      return {
        success: false,
        error: res.error || 'Signup failed on Cloudflare D1 server',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Connection error during signup',
      };
    }
  }

  // Server-Side Cloudflare D1 Login
  static async loginAsync(payload: LoginPayload): Promise<{
    success: boolean;
    error?: string;
    session?: AuthSession;
  }> {
    try {
      const res = await ApiService.login(payload.email, payload.password);
      if (res.success && res.data?.user) {
        const { user, organization } = res.data;
        const expiresDays = payload.rememberMe ? 30 : 7;
        const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

        const session: AuthSession = {
          token: res.data.token,
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

      return {
        success: false,
        error: res.error || 'Invalid credentials or Cloudflare D1 server error',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Connection error to Cloudflare API',
      };
    }
  }

  // Change password for currently authenticated user
  static async changePasswordAsync(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      const res = await ApiService.changePassword(currentPassword, newPassword);
      if (res.success) {
        return { success: true, message: res.data?.message || 'Password updated successfully' };
      }
      return { success: false, error: res.error || 'Failed to update password' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error while changing password' };
    }
  }
}

