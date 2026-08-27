import { AdminRole } from '../types/admin';

export type UserAuthRole = 'OWNER' | 'SUPER_ADMIN';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    role: UserAuthRole;
    adminRole?: AdminRole;
    organizationId: string;
    organizationName: string;
    gstin?: string;
    planName?: string;
  };
  expiresAt: string;
  loginTimestamp: string;
}

export interface SignupTenantPayload {
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  gstin?: string;
  state: string;
  city: string;
  planId?: string;
  billingCycle?: 'MONTHLY' | 'YEARLY';
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CloudflareDeployStatus {
  projectName: string;
  productionUrl: string;
  d1DatabaseName: string;
  databaseBinding: string;
  region: string;
  edgeLocationsCount: number;
  functionsEnabled: boolean;
  sslStatus: 'ACTIVE' | 'PENDING';
  lastDeployedAt: string;
  gitCommitSha: string;
}
