import { SubscriptionState } from '../types';
import { TenantOrganizationFull } from '../types/admin';

/**
 * Evaluates whether an organization or subscription's 14-day free trial has expired.
 */
export function isSubscriptionTrialExpired(
  subscription: SubscriptionState,
  activeOrg?: TenantOrganizationFull | null
): boolean {
  // If explicitly active paid subscription, never expired
  if (subscription.isSubscribed && subscription.status === 'ACTIVE') {
    return false;
  }

  // Marked EXPIRED
  if (subscription.status === 'EXPIRED') {
    return true;
  }

  // Check organization record in SaaSAdminDB / D1
  if (activeOrg) {
    if (activeOrg.subscriptionStatus === 'EXPIRED') {
      return true;
    }
    if (
      activeOrg.subscriptionStatus === 'TRIAL' &&
      activeOrg.trialEndDate &&
      new Date(activeOrg.trialEndDate).getTime() <= Date.now()
    ) {
      return true;
    }
  }

  // Check subscription expiry date if status is TRIAL or not subscribed
  if (subscription.status === 'TRIAL' || !subscription.isSubscribed) {
    if (subscription.trialDaysRemaining !== undefined && subscription.trialDaysRemaining <= 0) {
      return true;
    }
    if (subscription.expiryDate) {
      const exp = new Date(subscription.expiryDate).getTime();
      if (!isNaN(exp) && exp <= Date.now()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates remaining trial days (0 if expired).
 */
export function getTrialDaysRemaining(
  subscription: SubscriptionState,
  activeOrg?: TenantOrganizationFull | null
): number {
  if (subscription.isSubscribed && subscription.status === 'ACTIVE') {
    return 365; // Paid plan active
  }

  if (activeOrg && activeOrg.trialEndDate) {
    const diffMs = new Date(activeOrg.trialEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  if (subscription.expiryDate) {
    const diffMs = new Date(subscription.expiryDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return subscription.trialDaysRemaining ?? 0;
}

