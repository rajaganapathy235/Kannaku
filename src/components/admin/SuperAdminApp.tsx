import React, { useState, useEffect } from 'react';
import { SuperAdminLayout, AdminNavTab } from './SuperAdminLayout';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { AdminDashboardView } from './AdminDashboardView';
import { OrganizationsListView } from './OrganizationsListView';
import { PlansManagementView } from './PlansManagementView';
import { PaymentGatewaysView } from './PaymentGatewaysView';
import { SubscriptionsListView } from './SubscriptionsListView';
import { TransactionsListView } from './TransactionsListView';
import { CouponsManagementView } from './CouponsManagementView';
import { TrialManagementView } from './TrialManagementView';
import { RevenueAnalyticsView } from './RevenueAnalyticsView';
import { PlatformUsageAnalyticsView } from './PlatformUsageAnalyticsView';
import { UsersManagementView } from './UsersManagementView';
import { SupportTicketsView } from './SupportTicketsView';
import { AnnouncementsView } from './AnnouncementsView';
import { EmailTemplatesView } from './EmailTemplatesView';
import { FeatureFlagsView } from './FeatureFlagsView';
import { SystemSettingsView } from './SystemSettingsView';
import { SystemHealthView } from './SystemHealthView';
import { ErrorMonitoringView } from './ErrorMonitoringView';
import { AuditLogsView } from './AuditLogsView';
import { DatabaseExplorerView } from './DatabaseExplorerView';
import { DataExportCenterView } from './DataExportCenterView';
import { LiveActivityFeedView } from './LiveActivityFeedView';
import { TenantOrganizationFull } from '../../types/admin';

interface SuperAdminAppProps {
  onSwitchToCustomerApp: () => void;
  onImpersonateOrganization?: (org: TenantOrganizationFull) => void;
  onOpenHomepage?: () => void;
}

export const SuperAdminApp: React.FC<SuperAdminAppProps> = ({
  onSwitchToCustomerApp,
  onImpersonateOrganization,
  onOpenHomepage,
}) => {
  const [activeTab, setActiveTab] = useState<AdminNavTab>('dashboard');

  useEffect(() => {
    // Initial sync of all data collections directly from Cloudflare D1
    SaaSAdminDB.syncWithDatabase();
  }, []);

  return (
    <SuperAdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSwitchToCustomerApp={onSwitchToCustomerApp}
      onOpenHomepage={onOpenHomepage}
    >
      {activeTab === 'dashboard' && (
        <AdminDashboardView
          onNavigate={(tab) => setActiveTab(tab as AdminNavTab)}
          onImpersonate={onImpersonateOrganization}
        />
      )}

      {activeTab === 'organizations' && (
        <OrganizationsListView onImpersonate={onImpersonateOrganization} />
      )}

      {activeTab === 'users' && <UsersManagementView />}

      {activeTab === 'activity' && <LiveActivityFeedView />}

      {activeTab === 'plans' && <PlansManagementView />}

      {activeTab === 'gateways' && <PaymentGatewaysView />}

      {activeTab === 'subscriptions' && (
        <SubscriptionsListView
          onImpersonate={onImpersonateOrganization}
          onNavigateToPlans={() => setActiveTab('plans')}
        />
      )}

      {activeTab === 'trials' && <TrialManagementView />}

      {activeTab === 'coupons' && <CouponsManagementView />}

      {activeTab === 'transactions' && <TransactionsListView />}

      {activeTab === 'analytics_revenue' && <RevenueAnalyticsView />}

      {activeTab === 'analytics_usage' && <PlatformUsageAnalyticsView />}

      {activeTab === 'tickets' && <SupportTicketsView />}

      {activeTab === 'announcements' && <AnnouncementsView />}

      {activeTab === 'email_templates' && <EmailTemplatesView />}

      {activeTab === 'feature_flags' && <FeatureFlagsView />}

      {activeTab === 'settings' && <SystemSettingsView />}

      {activeTab === 'system_health' && <SystemHealthView />}

      {activeTab === 'errors' && <ErrorMonitoringView />}

      {activeTab === 'audit_logs' && (
        <AuditLogsView
          onImpersonate={onImpersonateOrganization}
          onNavigateToOrg={() => setActiveTab('organizations')}
        />
      )}

      {activeTab === 'database_explorer' && <DatabaseExplorerView />}

      {activeTab === 'data_export' && <DataExportCenterView />}
    </SuperAdminLayout>
  );
};
