import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Client,
  CompanyProfile,
  Invoice,
  InvoiceCopyType,
  InvoiceType,
  PaymentLedgerEntry,
  Product,
  SubscriptionState,
} from './types';
import { KannakuDB } from './utils/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoiceListView } from './components/invoice/InvoiceListView';
import { CreateInvoiceView } from './components/invoice/CreateInvoiceView';
import { InvoicePrintModal } from './components/invoice/InvoicePrintModal';
import { CustomerListView } from './components/customers/CustomerListView';
import { SupplierListView } from './components/suppliers/SupplierListView';
import { ProductListView } from './components/products/ProductListView';
import { PaymentLedgerView } from './components/payments/PaymentLedgerView';
import { ReportsView } from './components/reports/ReportsView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminApp } from './components/admin/SuperAdminApp';
import { ImpersonationBanner } from './components/admin/ImpersonationBanner';
import { AuthService } from './utils/authService';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { LandingPage } from './components/home/LandingPage';
import { SolutionLandingPage } from './components/home/SolutionLandingPage';
import { IndustrySolutionPage } from './components/home/IndustrySolutionPage';
import { SEOHead } from './components/common/SEOHead';
import { SEO_ROUTES, getSEOConfigForPath } from './config/seo.config';
import { INDUSTRY_SOLUTIONS, getIndustrySEOConfig, IndustryData } from './config/industry.config';
import { SaaSAdminDB } from './utils/adminStorage';
import { AuthSession } from './types/auth';
import { TenantOrganizationFull } from './types/admin';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { AlertModal } from './components/common/AlertModal';
import { Lock } from 'lucide-react';
import { TrialExpiredModal, ReadOnlyReasonType } from './components/subscription/TrialExpiredModal';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    return AuthService.getSession();
  });

  const getInitialPublicSlug = (): string => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path) return path;
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      return window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
    }
    return '';
  };

  const [publicSlug, setPublicSlug] = useState<string>(getInitialPublicSlug);

  const [authView, setAuthView] = useState<'login' | 'signup' | 'home' | null>(() => {
    if (window.location.hash === '#login') return 'login';
    if (window.location.hash === '#signup') return 'signup';
    if (window.location.hash === '#home') return 'home';
    return null;
  });

  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(() => {
    return authSession?.user?.role === 'SUPER_ADMIN';
  });
  const [activeImpersonation, setActiveImpersonation] = useState(
    SaaSAdminDB.getActiveImpersonation()
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data loaded from KannakuDB (local storage + cloud sync)
  const [company, setCompany] = useState<CompanyProfile>(KannakuDB.getCompanyProfile());
  const [invoices, setInvoices] = useState<Invoice[]>(KannakuDB.getInvoices());
  const [clients, setClients] = useState<Client[]>(KannakuDB.getClients());
  const [products, setProducts] = useState<Product[]>(KannakuDB.getProducts());
  const [payments, setPayments] = useState<PaymentLedgerEntry[]>(KannakuDB.getPayments());
  const [subscription, setSubscription] = useState<SubscriptionState>(
    KannakuDB.getSubscription()
  );

  // Server-Authoritative Read-Only & Access Denial State (Single Source of Truth)
  const [isReadOnly, setIsReadOnly] = useState<boolean>(() => {
    return Boolean(authSession?.user?.isReadOnly ?? company?.isReadOnly ?? false);
  });
  const [readOnlyReason, setReadOnlyReason] = useState<ReadOnlyReasonType>(() => {
    return (authSession?.user?.code || authSession?.user?.reason || authSession?.user?.readOnlyReason || company?.code || company?.readOnlyReason || null) as ReadOnlyReasonType;
  });

  // Active tenant, plan, and dynamic trial duration configuration
  const activeTenantId = KannakuDB.getActiveTenantId();
  const allOrgs = SaaSAdminDB.getOrganizations();
  const activeOrg: TenantOrganizationFull | undefined =
    allOrgs.find((o) => o.id === activeTenantId || o.adminEmail === company.email) || allOrgs[0];
  const allPlans = SaaSAdminDB.getPlans();
  const activePlan =
    allPlans.find(
      (p) => p.id === activeOrg?.planId || p.name === activeOrg?.planName || p.code === activeOrg?.planName
    ) || allPlans[0];

  const trialDurationDays =
    activeOrg?.trialDurationDays ||
    activePlan?.trialDurationDays ||
    15;

  // Read-Only Modal State
  const [trialExpiredModalOpen, setTrialExpiredModalOpen] = useState<boolean>(false);
  const [hasAutoPromptedTrialModal, setHasAutoPromptedTrialModal] = useState<boolean>(false);

  // Active viewing/printing invoice modal
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'invoice' | 'client' | 'product';
    id: string;
    name: string;
  } | null>(null);
  const [alertTarget, setAlertTarget] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Quick Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncErrorBanner, setSyncErrorBanner] = useState<{ action: string; error: string; status?: number } | null>(null);
  const [paymentResultBanner, setPaymentResultBanner] = useState<{
    status: 'success' | 'failure';
    txnId?: string | null;
    amount?: string | null;
    error?: string | null;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload database state
  const reloadAllState = () => {
    const comp = KannakuDB.getCompanyProfile();
    setCompany(comp);
    setInvoices(KannakuDB.getInvoices());
    setClients(KannakuDB.getClients());
    setProducts(KannakuDB.getProducts());
    setPayments(KannakuDB.getPayments());
    setSubscription(KannakuDB.getSubscription());
    const currentSession = AuthService.getSession();
    if (currentSession?.user) {
      setIsReadOnly(Boolean(currentSession.user.isReadOnly ?? comp.isReadOnly ?? false));
      setReadOnlyReason((currentSession.user.code || currentSession.user.reason || currentSession.user.readOnlyReason || comp.code || comp.readOnlyReason || null) as ReadOnlyReasonType);
    }
  };

  // Reconcile and synchronize all invoices into payment ledgers on load
  useEffect(() => {
    KannakuDB.reconcileInvoicesWithLedger();
    reloadAllState();

    // Check for PayU browser return callback query params from both search and hash
    let searchString = window.location.search;
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      searchString = searchString ? `${searchString}&${hashQuery}` : `?${hashQuery}`;
    }
    const urlParams = new URLSearchParams(searchString);
    const pathname = window.location.pathname;
    const paymentStatus = urlParams.get('payment_status') || (pathname.includes('order-success') ? 'success' : pathname.includes('order-failed') ? 'failure' : null);
    const returnTxnId = urlParams.get('txnid');
    const returnAmount = urlParams.get('amount');
    const returnError = urlParams.get('error');

    if (paymentStatus === 'success') {
      setActiveTab('subscription');
      setPaymentResultBanner({
        status: 'success',
        txnId: returnTxnId,
        amount: returnAmount,
      });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast(`🎉 Payment Verified via PayU! Your Pro subscription is now active.${returnTxnId ? ` (Ref: ${returnTxnId})` : ''}`);
      AuthService.refreshSessionAsync().then((updatedSession) => {
        if (updatedSession?.user) {
          setAuthSession(updatedSession);
          setIsReadOnly(Boolean(updatedSession.user.isReadOnly));
          setReadOnlyReason((updatedSession.user.code || updatedSession.user.reason || updatedSession.user.readOnlyReason || null) as ReadOnlyReasonType);
        }
        KannakuDB.syncFromD1().then(() => reloadAllState());
      });
      const cleanUrl = '/' + (window.location.hash ? window.location.hash.split('?')[0] : '#subscription');
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (paymentStatus === 'failure') {
      setActiveTab('subscription');
      const rawErr = returnError ? decodeURIComponent(returnError) : '';
      const isUserCancel = rawErr.toLowerCase().includes('cancel') || rawErr.toLowerCase().includes('usercancel');
      const displayErr = isUserCancel
        ? 'Payment was cancelled by user'
        : rawErr || 'Payment could not be completed on PayU. Please try again.';
      setPaymentResultBanner({
        status: 'failure',
        txnId: returnTxnId,
        error: displayErr,
      });
      const errMsg = isUserCancel
        ? ' (Cancelled by user)'
        : rawErr
        ? `: ${rawErr}`
        : '. Please try again or choose another payment option.';
      showToast(`❌ PayU Payment was not completed${errMsg}`);
      const cleanUrl = '/' + (window.location.hash ? window.location.hash.split('?')[0] : '#subscription');
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (window.location.hash.startsWith('#subscription')) {
      setActiveTab('subscription');
    }

    // Auto-sync from Cloudflare D1 and refresh server-side access status on app load if authenticated
    if (authSession?.user) {
      AuthService.refreshSessionAsync().then((updatedSession) => {
        if (updatedSession?.user) {
          setAuthSession(updatedSession);
          setIsReadOnly(Boolean(updatedSession.user.isReadOnly));
          setReadOnlyReason((updatedSession.user.code || updatedSession.user.reason || updatedSession.user.readOnlyReason || null) as ReadOnlyReasonType);
        }
      });
      KannakuDB.syncFromD1().then((res) => {
        if (res.success) {
          reloadAllState();
        }
      });
    }

    const handleApiError = (e: any) => {
      const detail = e.detail || {};
      if (detail.status === 401) {
        AuthService.logout();
        setAuthSession(null);
        setAuthView('login');
        window.location.hash = '#login';
        showToast('⚠️ Session expired or unauthorized. Please sign in.');
      } else if (
        detail.status === 402 ||
        detail.status === 403 ||
        detail.code === 'TRIAL_EXPIRED' ||
        detail.code === 'SUBSCRIPTION_EXPIRED' ||
        detail.code === 'ACCOUNT_SUSPENDED' ||
        detail.error?.includes('trial has expired') ||
        detail.error?.includes('Subscription has expired') ||
        detail.error?.includes('suspended')
      ) {
        const reasonCode: ReadOnlyReasonType = (detail.code || detail.reason || (detail.error?.includes('suspended') ? 'ACCOUNT_SUSPENDED' : detail.error?.includes('Subscription') ? 'SUBSCRIPTION_EXPIRED' : 'TRIAL_EXPIRED')) as ReadOnlyReasonType;
        setIsReadOnly(true);
        setReadOnlyReason(reasonCode);
        setTrialExpiredModalOpen(true);
        if (reasonCode === 'ACCOUNT_SUSPENDED') {
          showToast('⚠️ Account suspended by administrator. Invoicing is locked in read-only mode.');
        } else if (reasonCode === 'SUBSCRIPTION_EXPIRED') {
          showToast('⚠️ Your subscription has expired. Invoicing is locked in read-only mode.');
        } else {
          showToast('⚠️ Your trial has expired. Invoicing is locked in read-only mode.');
        }
      } else if (detail.error?.includes('D1 binding') || detail.error?.includes('env.DB')) {
        setSyncErrorBanner({
          action: 'Cloudflare D1 Database Binding',
          error: detail.error,
          status: detail.status,
        });
      }
    };

    const handleD1SyncError = (e: any) => {
      const detail = e.detail || {};
      setSyncErrorBanner({
        action: detail.action || 'Database Operation',
        error: detail.error || 'Failed to persist to Cloudflare D1',
        status: detail.status,
      });
    };

    const handleD1SyncSuccess = (e: any) => {
      const detail = e.detail || {};
      setSyncErrorBanner(null);
      if (detail.action) {
        showToast(`☁️ D1 Synced: ${detail.action}`);
      }
    };

    window.addEventListener('kannaku:api-error', handleApiError);
    window.addEventListener('kannaku:d1-sync-error', handleD1SyncError);
    window.addEventListener('kannaku:d1-sync-success', handleD1SyncSuccess);

    const handleHashOrUrlChange = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      if (path) {
        setPublicSlug(path);
      } else if (window.location.hash && window.location.hash.startsWith('#/')) {
        setPublicSlug(window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, ''));
      } else {
        setPublicSlug('');
      }

      if (window.location.hash === '#admin') {
        const session = AuthService.getSession();
        if (session?.user?.role === 'SUPER_ADMIN') {
          setIsSuperAdminMode(true);
          setAuthView(null);
        } else {
          setIsSuperAdminMode(false);
          setAuthView('login');
          window.location.hash = '#login';
        }
      } else if (window.location.hash === '#home') {
        setIsSuperAdminMode(false);
        setAuthView('home');
      } else if (window.location.hash === '#login') {
        setIsSuperAdminMode(false);
        setAuthView('login');
      } else if (window.location.hash === '#signup') {
        setIsSuperAdminMode(false);
        setAuthView('signup');
      } else {
        setIsSuperAdminMode(false);
        setAuthView(null);
      }
    };
    window.addEventListener('hashchange', handleHashOrUrlChange);
    window.addEventListener('popstate', handleHashOrUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleHashOrUrlChange);
      window.removeEventListener('popstate', handleHashOrUrlChange);
      window.removeEventListener('kannaku:api-error', handleApiError);
      window.removeEventListener('kannaku:d1-sync-error', handleD1SyncError);
      window.removeEventListener('kannaku:d1-sync-success', handleD1SyncSuccess);
    };
  }, [authSession?.user?.id]);
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    setAuthView(null);
    reloadAllState();
    if (session.user.role === 'SUPER_ADMIN') {
      setIsSuperAdminMode(true);
      window.location.hash = '#admin';
    } else {
      setIsSuperAdminMode(false);
      window.location.hash = '';
      const targetId = session.user.organizationId || session.user.id;
    }
    showToast(`Welcome back, ${session.user.name}! Workspace synchronized.`);
  };

  const handleSignupSuccess = (session: AuthSession) => {
    setAuthSession(session);
    setAuthView(null);
    reloadAllState();
    setIsSuperAdminMode(false);
    window.location.hash = '';
    showToast(`🎉 Workspace "${session.user.organizationName}" created successfully! ${trialDurationDays}-day trial active.`);
  };

  const handleLogout = () => {
    AuthService.logout();
    setAuthSession(null);
    setAuthView('home');
    window.location.hash = '#home';
    showToast('Signed out successfully.');
  };

  const handleStartImpersonation = (org: TenantOrganizationFull) => {
    SaaSAdminDB.startImpersonation(org.id);
    // Switch active tenant in localStorage
    localStorage.setItem('kannaku_active_tenant_id', org.id);
    setActiveImpersonation(SaaSAdminDB.getActiveImpersonation());
    reloadAllState();
    setIsSuperAdminMode(false);
    showToast(`Impersonation active for "${org.name}". Viewing as business operator.`);
  };

  const handleStopImpersonation = () => {
    SaaSAdminDB.stopImpersonation();
    localStorage.removeItem('kannaku_active_tenant_id');
    setActiveImpersonation(null);
    reloadAllState();
    setIsSuperAdminMode(true);
    showToast('Impersonation ended. Returned to Super Admin Console.');
  };

  // Auto-prompt read-only modal once per session
  useEffect(() => {
    if (isReadOnly && !hasAutoPromptedTrialModal && authSession && !isSuperAdminMode) {
      setTrialExpiredModalOpen(true);
      setHasAutoPromptedTrialModal(true);
    }
  }, [isReadOnly, hasAutoPromptedTrialModal, authSession, isSuperAdminMode]);

  // Compute Next Invoice Number
  const getNextInvoiceNumber = (type: InvoiceType): string => {
    const prefix = company.billPrefix || 'INV/2026/';
    const filtered = invoices.filter((i) => i.invoiceType === type);
    const nextNum = (filtered.length + 1).toString().padStart(3, '0');
    if (type === InvoiceType.PURCHASE) {
      return `PUR/2026/${nextNum}`;
    }
    if (type === InvoiceType.QUOTATION) {
      return `EST/2026/${nextNum}`;
    }
    return `${prefix}${nextNum}`;
  };

  // Trigger New Invoice with Read-Only Guard
  const handleTriggerNewInvoice = () => {
    if (isReadOnly) {
      setTrialExpiredModalOpen(true);
      showToast(
        readOnlyReason === 'ACCOUNT_SUSPENDED'
          ? '🔒 Account Suspended. Invoicing is locked in read-only mode.'
          : readOnlyReason === 'SUBSCRIPTION_EXPIRED'
          ? '🔒 Subscription Expired. Invoicing is locked in read-only mode.'
          : `🔒 ${trialDurationDays}-Day Free Trial Expired. Invoicing is locked in read-only mode.`
      );
      return;
    }
    setEditingInvoice(null);
    setActiveTab('create_invoice');
  };

  // Invoice Handlers
  const handleSaveInvoice = (invoice: Invoice, andPrint: boolean = false) => {
    if (isReadOnly) {
      setTrialExpiredModalOpen(true);
      showToast('🔒 Cannot save invoice: workspace is in read-only mode. Upgrade your plan to continue.');
      return;
    }

    // KannakuDB.saveInvoice automatically synchronizes inventory stock, ledger entries, and party balances
    KannakuDB.saveInvoice(invoice);

    reloadAllState();
    setEditingInvoice(null);
    showToast(`Invoice ${invoice.invoiceNumber} saved & entered in ledger!`);

    if (andPrint) {
      setActivePrintInvoice(invoice);
    } else {
      setActiveTab('invoices');
    }
  };

  const handleEditInvoice = (inv: Invoice) => {
    if (isReadOnly) {
      setTrialExpiredModalOpen(true);
      showToast('🔒 Invoicing is locked in read-only mode.');
      return;
    }
    setEditingInvoice(inv);
    setActiveTab('create_invoice');
  };

  const handleConvertQuotationToInvoice = (quotation: Invoice) => {
    if (isReadOnly) {
      setTrialExpiredModalOpen(true);
      showToast('🔒 Invoicing is locked in read-only mode. Upgrade plan to convert estimates to tax invoices.');
      return;
    }

    if (quotation.isConverted) {
      showToast(`This estimate has already been converted to Tax Invoice ${quotation.convertedInvoiceNumber || ''}.`);
      return;
    }

    const nextSalesNumber = getNextInvoiceNumber(InvoiceType.SALES);
    const convertedInvoiceId = `inv_${Date.now()}`;
    const convertedInvoice: Invoice = {
      ...quotation,
      id: convertedInvoiceId,
      invoiceType: InvoiceType.SALES,
      invoiceNumber: nextSalesNumber,
      date: new Date().toISOString().split('T')[0],
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
      status: quotation.calc.paidAmount > 0 ? (quotation.calc.dueAmount === 0 ? 'PAID' : 'PARTIAL') : 'UNPAID',
      isConverted: false,
      convertedToInvoiceId: undefined,
      convertedInvoiceNumber: undefined,
    };

    // 1. Mark original quotation as converted so it can never be converted a second time
    const updatedQuotation: Invoice = {
      ...quotation,
      isConverted: true,
      convertedToInvoiceId: convertedInvoiceId,
      convertedInvoiceNumber: nextSalesNumber,
      updatedOn: new Date().toISOString(),
    };
    KannakuDB.saveInvoice(updatedQuotation);

    // 2. Save as Sales Tax Invoice -> triggers syncInvoiceToStock and syncInvoiceToLedger
    KannakuDB.saveInvoice(convertedInvoice);

    reloadAllState();
    showToast(`Quotation converted to Tax Invoice ${convertedInvoice.invoiceNumber} and entered into Party Ledger!`);

    // Open print view for the new invoice
    setActivePrintInvoice(convertedInvoice);
  };

  const handleDuplicateInvoice = (inv: Invoice) => {
    if (isReadOnly) {
      setTrialExpiredModalOpen(true);
      showToast('🔒 Invoicing is locked in read-only mode.');
      return;
    }

    const dup: Invoice = {
      ...inv,
      id: `inv_${Date.now()}`,
      invoiceNumber: getNextInvoiceNumber(inv.invoiceType),
      date: new Date().toISOString().split('T')[0],
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
      status: 'UNPAID',
    };
    setEditingInvoice(dup);
    setActiveTab('create_invoice');
    showToast('Invoice cloned as a new draft!');
  };

  const handleDeleteInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setDeleteTarget({ type: 'invoice', id, name: `Invoice ${inv.invoiceNumber}` });
    }
  };

  // Client Handlers
  const handleAddClient = (client: Client) => {
    KannakuDB.saveClient(client);
    reloadAllState();
    showToast(`Party ${client.name} added.`);
  };

  const handleUpdateClient = (client: Client) => {
    KannakuDB.saveClient(client);
    reloadAllState();
    showToast(`Party ${client.name} updated.`);
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const hasInvoices = invoices.some(i => i.clientId === clientId);
    const hasLedgerEntries = payments.some(p => p.partyId === clientId);

    if (hasInvoices || hasLedgerEntries) {
      setAlertTarget({
        title: 'Cannot Delete Party',
        message: 'This party has existing invoices or ledger entries. Please void related invoices or clear the ledger balance first to maintain accounting integrity.'
      });
    } else {
      setDeleteTarget({ type: 'client', id: clientId, name: client.name });
    }
  };

  // Product Handlers
  const handleAddProduct = (product: Product) => {
    KannakuDB.saveProduct(product);
    reloadAllState();
    showToast(`Product ${product.name} created.`);
  };

  const handleUpdateProduct = (product: Product) => {
    KannakuDB.saveProduct(product);
    reloadAllState();
    showToast(`Product ${product.name} updated.`);
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setDeleteTarget({ type: 'product', id: productId, name: prod.name });
    }
  };

  // Payments
  const handleRecordPayment = (entry: PaymentLedgerEntry) => {
    KannakuDB.savePayment(entry);

    // Adjust client balance if matched
    if (entry.partyId) {
      const client = clients.find((c) => c.id === entry.partyId);
      if (client) {
        const delta = entry.type === 'credit' ? -entry.amount : entry.amount;
        const updated = { ...client, balance: client.balance + delta };
        KannakuDB.saveClient(updated);
      }
    }

    reloadAllState();
    showToast(`Payment of ₹${entry.amount} recorded!`);
  };

  // Company Profile
  const handleAddLedgerEntry = (entry: PaymentLedgerEntry, newBalance: number) => {
    KannakuDB.savePayment(entry);
    if (entry.partyId) {
      const client = clients.find((c) => c.id === entry.partyId);
      if (client) {
        const updated = { ...client, balance: newBalance };
        KannakuDB.saveClient(updated);
      }
    }
    reloadAllState();
    showToast(`Ledger entry recorded for ₹${entry.amount}!`);
  };

  const handleEditLedgerEntry = (entry: PaymentLedgerEntry, newBalance: number) => {
    KannakuDB.savePayment(entry);
    if (entry.partyId) {
      const client = clients.find((c) => c.id === entry.partyId);
      if (client) {
        const updated = { ...client, balance: newBalance };
        KannakuDB.saveClient(updated);
      }
    }
    reloadAllState();
    showToast(`Ledger entry updated for ₹${entry.amount}!`);
  };

  const handleDeleteLedgerEntry = (entryId: string, newBalance: number) => {
    const entry = payments.find((p) => p.id === entryId);
    KannakuDB.deletePayment(entryId);
    if (entry && entry.partyId) {
      const client = clients.find((c) => c.id === entry.partyId);
      if (client) {
        const updated = { ...client, balance: newBalance };
        KannakuDB.saveClient(updated);
      }
    }
    reloadAllState();
    showToast('Ledger entry deleted.');
  };

  const handleUpdateCompany = (updated: CompanyProfile) => {
    KannakuDB.saveCompanyProfile(updated);
    reloadAllState();
    showToast('Company profile updated.');
  };

  const handleNavigatePublicSlug = (slug: string) => {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    setPublicSlug(cleanSlug);
    const newPath = cleanSlug ? `/${cleanSlug}/` : '/';
    window.history.pushState({}, '', newPath);
  };

  // Default to Public Landing or Solution Page if no active session and not explicitly on login/signup
  if (!authSession && authView !== 'login' && authView !== 'signup') {
    const cleanSlug = publicSlug ? publicSlug.replace(/^\/+|\/+$/g, '').toLowerCase() : '';
    
    // Check if the current slug matches one of the 12 industry solutions
    const matchedIndustry = Object.values(INDUSTRY_SOLUTIONS).find(
      (ind) =>
        cleanSlug === ind.slug ||
        cleanSlug === `billing-software-for-${ind.id}` ||
        cleanSlug === `industries/${ind.id}` ||
        (cleanSlug.startsWith('billing-software-for-') && cleanSlug.includes(ind.id.toLowerCase()))
    );

    if (matchedIndustry) {
      const industrySeo = getIndustrySEOConfig(matchedIndustry);
      return (
        <>
          <SEOHead seo={industrySeo} />
          <IndustrySolutionPage
            data={matchedIndustry}
            onNavigateSlug={handleNavigatePublicSlug}
            onGetStarted={() => {
              setAuthView('signup');
              window.location.hash = '#signup';
            }}
            onSignIn={() => {
              setAuthView('login');
              window.location.hash = '#login';
            }}
            onOpenSuperAdmin={() => {
              if (authSession?.user?.role === 'SUPER_ADMIN') {
                setIsSuperAdminMode(true);
                setAuthView(null);
              } else {
                setAuthView('login');
                window.location.hash = '#login';
              }
            }}
          />
        </>
      );
    }

    const activeSeoConfig = getSEOConfigForPath(publicSlug);
    const isSolutionPage = publicSlug && publicSlug !== '' && publicSlug !== 'home';

    if (isSolutionPage) {
      return (
        <SolutionLandingPage
          seo={activeSeoConfig}
          onOpenLogin={() => {
            setAuthView('login');
            window.location.hash = '#login';
          }}
          onOpenSignup={() => {
            setAuthView('signup');
            window.location.hash = '#signup';
          }}
          onNavigateSlug={handleNavigatePublicSlug}
          onOpenSuperAdmin={() => {
            if (authSession?.user?.role === 'SUPER_ADMIN') {
              setIsSuperAdminMode(true);
              setAuthView(null);
              window.location.hash = '#admin';
            } else {
              setAuthView('login');
              window.location.hash = '#login';
            }
          }}
        />
      );
    }

    return (
      <>
        <SEOHead seo={SEO_ROUTES.home} />
        <LandingPage
          session={authSession}
          onNavigateSlug={handleNavigatePublicSlug}
          onStartTrial={() => {
            setAuthView('signup');
            window.location.hash = '#signup';
          }}
          onSignIn={() => {
            setAuthView('login');
            window.location.hash = '#login';
          }}
          onEnterDemoApp={() => {
            if (authSession) {
              setAuthView(null);
              window.location.hash = '';
              reloadAllState();
            } else {
              setAuthView('login');
              window.location.hash = '#login';
            }
          }}
          onOpenSuperAdmin={() => {
            if (authSession?.user?.role === 'SUPER_ADMIN') {
              setIsSuperAdminMode(true);
              setAuthView(null);
              window.location.hash = '#admin';
            } else {
              setAuthView('login');
              window.location.hash = '#login';
            }
          }}
        />
      </>
    );
  }

  // Explicit Landing Page view
  if (authView === 'home') {
    return (
      <>
        <SEOHead seo={SEO_ROUTES.home} />
        <LandingPage
          session={authSession}
          onNavigateSlug={handleNavigatePublicSlug}
          onStartTrial={() => {
            setAuthView('signup');
            window.location.hash = '#signup';
          }}
          onSignIn={() => {
            setAuthView('login');
            window.location.hash = '#login';
          }}
          onEnterDemoApp={() => {
            if (authSession) {
              setAuthView(null);
              window.location.hash = '';
              reloadAllState();
            } else {
              setAuthView('login');
              window.location.hash = '#login';
            }
          }}
          onOpenSuperAdmin={() => {
            if (authSession?.user?.role === 'SUPER_ADMIN') {
              setIsSuperAdminMode(true);
              setAuthView(null);
              window.location.hash = '#admin';
            } else {
              setAuthView('login');
              window.location.hash = '#login';
            }
          }}
        />
      </>
    );
  }

  // Explicit Login View
  if (authView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setAuthView('signup');
          window.location.hash = '#signup';
        }}
        onBackToHome={() => {
          setAuthView('home');
          window.location.hash = '#home';
        }}
        initialEmail={authSession?.user?.email || ''}
      />
    );
  }

  // Explicit Signup / Registration View
  if (authView === 'signup') {
    return (
      <SignupPage
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setAuthView('login');
          window.location.hash = '#login';
        }}
        onBackToHome={() => {
          setAuthView('home');
          window.location.hash = '#home';
        }}
      />
    );
  }

  // Super Admin Portal (Guarded)
  if (isSuperAdminMode) {
    return (
      <SuperAdminApp
        onSwitchToCustomerApp={() => {
          setIsSuperAdminMode(false);
          window.location.hash = '';
        }}
        onImpersonateOrganization={handleStartImpersonation}
        onOpenHomepage={() => {
          setIsSuperAdminMode(false);
          setAuthView('home');
          window.location.hash = '#home';
        }}
      />
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden antialiased font-sans">
      {/* Impersonation Notification Banner */}
      {activeImpersonation && (
        <ImpersonationBanner
          onExit={handleStopImpersonation}
        />
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              if ((tab as string) === 'create_invoice' && isReadOnly) {
                setTrialExpiredModalOpen(true);
                showToast('🔒 Invoicing is locked in read-only mode.');
                return;
              }
              setEditingInvoice(null);
              setActiveTab(tab);
            }}
            invoicesCount={invoices.length}
            customersCount={clients.length}
            lowStockCount={products.filter((p) => p.currentStock <= p.minStockAlert).length}
            onOpenSuperAdmin={
              authSession?.user?.role === 'SUPER_ADMIN'
                ? () => {
                    setIsSuperAdminMode(true);
                    window.location.hash = '#admin';
                  }
                : undefined
            }
            onOpenHomepage={() => {
              setAuthView('home');
              window.location.hash = '#home';
            }}
          />
        </div>

        {/* Main Application Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Navbar Header */}
          <Navbar
            company={company}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onNewInvoice={handleTriggerNewInvoice}
            onOpenSuperAdmin={
              authSession?.user?.role === 'SUPER_ADMIN'
                ? () => {
                    setIsSuperAdminMode(true);
                    window.location.hash = '#admin';
                  }
                : undefined
            }
            onOpenHomepage={() => {
              setAuthView('home');
              window.location.hash = '#home';
            }}
            session={authSession}
            onLogout={handleLogout}
            isReadOnly={isReadOnly}
            readOnlyReason={readOnlyReason}
            onOpenTrialModal={() => setTrialExpiredModalOpen(true)}
          />

          {/* Read-Only Global Alert Banner */}
          {isReadOnly && (
            <div
              id="trial-expired-global-banner"
              className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-xs border-b border-amber-600/30 shrink-0"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-950 shrink-0" />
                <span>
                  <strong>
                    {readOnlyReason === 'ACCOUNT_SUSPENDED' || readOnlyReason === 'SUSPENDED'
                      ? 'Account Suspended:'
                      : readOnlyReason === 'SUBSCRIPTION_EXPIRED'
                      ? 'Subscription Expired:'
                      : `${trialDurationDays}-Day Free Trial Expired:`}
                  </strong>{' '}
                  Read-only mode active. Your historical records and accounting reports are safe. Record creation and invoicing are paused.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTrialExpiredModalOpen(true)}
                className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                {readOnlyReason === 'ACCOUNT_SUSPENDED' || readOnlyReason === 'SUSPENDED' ? 'View Details' : 'Upgrade Plan'}
              </button>
            </div>
          )}

        {/* Scrollable Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Active View Router */}
            {activeTab === 'dashboard' && (
              <DashboardView
                company={company}
                invoices={invoices}
                clients={clients}
                products={products}
                payments={payments}
                isReadOnly={isReadOnly}
                onUpgradeClick={() => setTrialExpiredModalOpen(true)}
                onNewInvoice={handleTriggerNewInvoice}
                onViewInvoice={(inv) => setActivePrintInvoice(inv)}
                onNavigateTab={(tab) => {
                  if (tab === 'create_invoice' && isReadOnly) {
                    setTrialExpiredModalOpen(true);
                    showToast('🔒 Invoicing is locked in read-only mode.');
                    return;
                  }
                  setActiveTab(tab);
                }}
                onOpenQuickPayment={() => {
                  if (isReadOnly) {
                    setTrialExpiredModalOpen(true);
                    showToast('🔒 Action is locked in read-only mode.');
                    return;
                  }
                  setActiveTab('payments');
                }}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoiceListView
                invoices={invoices}
                onNewInvoice={handleTriggerNewInvoice}
                onViewInvoice={(inv) => setActivePrintInvoice(inv)}
                onEditInvoice={handleEditInvoice}
                onDuplicateInvoice={handleDuplicateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onConvertQuotation={handleConvertQuotationToInvoice}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === 'create_invoice' && (
              <CreateInvoiceView
                company={company}
                clients={clients}
                products={products}
                editingInvoice={editingInvoice}
                onSave={handleSaveInvoice}
                onCancel={() => setActiveTab('invoices')}
                onAddNewClient={handleAddClient}
                onAddNewProduct={handleAddProduct}
                nextInvoiceNumber={getNextInvoiceNumber}
                isReadOnly={isReadOnly}
                readOnlyReason={readOnlyReason}
                trialDurationDays={trialDurationDays}
                onOpenUpgradeModal={() => setTrialExpiredModalOpen(true)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerListView
                clients={clients}
                invoices={invoices}
                company={company}
                payments={payments}
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onViewInvoice={(inv) => setActivePrintInvoice(inv)}
                onAddLedgerEntry={handleAddLedgerEntry}
                onEditLedgerEntry={handleEditLedgerEntry}
                onDeleteLedgerEntry={handleDeleteLedgerEntry}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === 'suppliers' && (
              <SupplierListView
                clients={clients}
                invoices={invoices}
                company={company}
                payments={payments}
                onAddSupplier={handleAddClient}
                onUpdateSupplier={handleUpdateClient}
                onDeleteSupplier={handleDeleteClient}
                onViewInvoice={(inv) => setActivePrintInvoice(inv)}
                onAddLedgerEntry={handleAddLedgerEntry}
                onEditLedgerEntry={handleEditLedgerEntry}
                onDeleteLedgerEntry={handleDeleteLedgerEntry}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === 'products' && (
              <ProductListView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentLedgerView
                payments={payments}
                clients={clients}
                company={company}
                onRecordPayment={handleRecordPayment}
                isReadOnly={isReadOnly}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView invoices={invoices} company={company} />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionView
                company={company}
                subscription={subscription}
                paymentResult={paymentResultBanner}
                onDismissPaymentResult={() => setPaymentResultBanner(null)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                company={company}
                onUpdateCompany={handleUpdateCompany}
                onRestoreDatabase={reloadAllState}
              />
            )}
          </div>
        </main>

        {/* Unified Polish Bottom Footer Bar */}
        <footer className="h-11 bg-white border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Workspace: <span className="font-semibold text-slate-900">{company.name}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 font-medium text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
              Ledger Synchronized
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">JustGST Invoicing Suite</span>
          </div>
        </footer>
      </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab as any}
        onTabChange={(tab) => {
          setEditingInvoice(null);
          setActiveTab(tab);
        }}
        invoicesCount={invoices.length}
        lowStockCount={products.filter((p) => p.currentStock <= p.minStockAlert).length}
      />

      {/* Tally V4 PDF & Print Engine Modal */}
      {activePrintInvoice && (
        <InvoicePrintModal
          invoice={activePrintInvoice}
          company={company}
          onClose={() => setActivePrintInvoice(null)}
          onEdit={() => {
            const inv = activePrintInvoice;
            setActivePrintInvoice(null);
            handleEditInvoice(inv);
          }}
          onConvertQuotation={handleConvertQuotationToInvoice}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget.type === 'invoice') {
              await KannakuDB.deleteInvoice(deleteTarget.id);
              showToast('Invoice deleted.');
            } else if (deleteTarget.type === 'client') {
              KannakuDB.deleteClient(deleteTarget.id);
              showToast('Party deleted.');
            } else if (deleteTarget.type === 'product') {
              KannakuDB.deleteProduct(deleteTarget.id);
              showToast('Product deleted.');
            }
            reloadAllState();
            setDeleteTarget(null);
          }}
          title={`Delete ${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}`}
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
        />
      )}

      {/* Alert Modal */}
      {alertTarget && (
        <AlertModal
          isOpen={!!alertTarget}
          onClose={() => setAlertTarget(null)}
          title={alertTarget.title}
          message={alertTarget.message}
        />
      )}

      {/* Sync Error Banner Overlay */}
      {syncErrorBanner && (
        <div className="fixed bottom-14 sm:bottom-6 right-4 sm:right-6 z-50 max-w-md w-full bg-slate-900 border border-rose-600 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-bold text-xs">⚠️</span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-xs text-rose-300">
                  Cloudflare D1 Sync Alert: {syncErrorBanner.action}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {syncErrorBanner.error}
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Local cache saved. Data will sync once Cloudflare D1 connection is confirmed.
                </div>
              </div>
            </div>
            <button
              onClick={() => setSyncErrorBanner(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 text-xs font-medium backdrop-blur-md animate-in fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Read-Only Access & Subscription Denial Modal */}
      <TrialExpiredModal
        isOpen={trialExpiredModalOpen}
        onClose={() => setTrialExpiredModalOpen(false)}
        onUpgrade={() => {
          setTrialExpiredModalOpen(false);
          setActiveTab('subscription');
        }}
        reason={readOnlyReason}
        code={readOnlyReason}
        expiryDate={subscription.expiryDate}
        organizationName={company.name || 'Your Business'}
        trialDurationDays={trialDurationDays}
      />
    </div>
  );
}

