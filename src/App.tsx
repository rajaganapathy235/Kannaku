import React, { useState, useEffect } from 'react';
import {
  Client,
  CompanyProfile,
  Invoice,
  InvoiceCopyType,
  InvoiceType,
  PaymentLedgerEntry,
  Product,
  SubscriptionPlan,
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
import { SaaSAdminDB } from './utils/adminStorage';
import { TenantOrganizationFull } from './types/admin';
import { AuthSession } from './types/auth';
import { AuthService } from './utils/authService';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { LandingPage } from './components/home/LandingPage';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    return AuthService.getSession();
  });
  const [authView, setAuthView] = useState<'login' | 'signup' | 'home' | null>(() => {
    if (window.location.hash === '#login') return 'login';
    if (window.location.hash === '#signup') return 'signup';
    if (window.location.hash === '#home') return 'home';
    return null;
  });

  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(() => {
    return window.location.hash === '#admin' || authSession?.user.role === 'SUPER_ADMIN';
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

  // Active viewing/printing invoice modal
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Quick Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload database state
  const reloadAllState = () => {
    setCompany(KannakuDB.getCompanyProfile());
    setInvoices(KannakuDB.getInvoices());
    setClients(KannakuDB.getClients());
    setProducts(KannakuDB.getProducts());
    setPayments(KannakuDB.getPayments());
    setSubscription(KannakuDB.getSubscription());
  };

  // Reconcile and synchronize all invoices into payment ledgers on load
  useEffect(() => {
    KannakuDB.reconcileInvoicesWithLedger();
    reloadAllState();

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsSuperAdminMode(true);
        setAuthView(null);
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
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
    }
    showToast(`Welcome back, ${session.user.name}! Workspace synchronized.`);
  };

  const handleSignupSuccess = (session: AuthSession) => {
    setAuthSession(session);
    setAuthView(null);
    reloadAllState();
    setIsSuperAdminMode(false);
    window.location.hash = '';
    showToast(`🎉 Workspace "${session.user.organizationName}" created successfully! 14-day trial active.`);
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

  // Invoice Handlers
  const handleSaveInvoice = (invoice: Invoice, andPrint: boolean = false) => {
    // KannakuDB.saveInvoice automatically synchronizes ledger entries and party balances
    KannakuDB.saveInvoice(invoice);

    // Deduct stock for sold items
    if (invoice.invoiceType === InvoiceType.SALES) {
      invoice.items.forEach((item) => {
        const prod = products.find((p) => p.name === item.name);
        if (prod) {
          const updatedProd = {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - item.qty),
          };
          KannakuDB.saveProduct(updatedProd);
        }
      });
    }

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
    setEditingInvoice(inv);
    setActiveTab('create_invoice');
  };

  const handleConvertQuotationToInvoice = (quotation: Invoice) => {
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

    // 2. Save as Sales Tax Invoice -> triggers syncInvoiceToLedger, posting it to the party ledger & customer balance
    KannakuDB.saveInvoice(convertedInvoice);

    // Deduct stock for sold items
    convertedInvoice.items.forEach((item) => {
      const prod = products.find((p) => p.name === item.name);
      if (prod) {
        const updatedProd = {
          ...prod,
          currentStock: Math.max(0, prod.currentStock - item.qty),
        };
        KannakuDB.saveProduct(updatedProd);
      }
    });

    reloadAllState();
    showToast(`Quotation converted to Tax Invoice ${convertedInvoice.invoiceNumber} and entered into Party Ledger!`);

    // Open print view for the new invoice
    setActivePrintInvoice(convertedInvoice);
  };

  const handleDuplicateInvoice = (inv: Invoice) => {
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
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      KannakuDB.deleteInvoice(id);
      reloadAllState();
      showToast('Invoice deleted.');
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
    if (window.confirm('Delete this party profile?')) {
      KannakuDB.deleteClient(clientId);
      reloadAllState();
      showToast('Party deleted.');
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
    if (window.confirm('Delete this product from catalog?')) {
      KannakuDB.deleteProduct(productId);
      reloadAllState();
      showToast('Product deleted.');
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

  const handleUpdateCompany = (updated: CompanyProfile) => {
    KannakuDB.saveCompanyProfile(updated);
    reloadAllState();
    showToast('Company profile updated.');
  };

  // Subscription Upgrade
  const handleUpgradeSubscription = (plan: SubscriptionPlan) => {
    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + plan.durationDays);

    const updatedState: SubscriptionState = {
      isSubscribed: true,
      activePlan: plan,
      expiryDate: nextExpiry.toISOString().split('T')[0],
    };

    KannakuDB.saveSubscription(updatedState);
    reloadAllState();
    showToast(`Subscribed to ${plan.name}!`);
  };

  // Default to Landing Page if no active session and not explicitly on login/signup
  if (!authSession && authView !== 'login' && authView !== 'signup') {
    return (
      <LandingPage
        session={authSession}
        onStartTrial={() => {
          setAuthView('signup');
          window.location.hash = '#signup';
        }}
        onSignIn={() => {
          setAuthView('login');
          window.location.hash = '#login';
        }}
        onEnterDemoApp={() => {
          const session = AuthService.quickSwitchRole('hytexcottonmills@gmail.com');
          setAuthSession(session);
          setAuthView(null);
          window.location.hash = '';
          reloadAllState();
        }}
        onOpenSuperAdmin={() => {
          setIsSuperAdminMode(true);
          setAuthView(null);
          window.location.hash = '#admin';
        }}
      />
    );
  }

  // Explicit Landing Page view
  if (authView === 'home') {
    return (
      <LandingPage
        session={authSession}
        onStartTrial={() => {
          setAuthView('signup');
          window.location.hash = '#signup';
        }}
        onSignIn={() => {
          setAuthView('login');
          window.location.hash = '#login';
        }}
        onEnterDemoApp={() => {
          if (!authSession) {
            const session = AuthService.quickSwitchRole('hytexcottonmills@gmail.com');
            setAuthSession(session);
          }
          setAuthView(null);
          window.location.hash = '';
          reloadAllState();
        }}
        onOpenSuperAdmin={() => {
          setIsSuperAdminMode(true);
          setAuthView(null);
          window.location.hash = '#admin';
        }}
      />
    );
  }

  // Explicit Login View
  if (authView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setAuthView('signup')}
        initialEmail={authSession?.user?.email || 'hytexcottonmills@gmail.com'}
      />
    );
  }

  // Explicit Signup / Registration View
  if (authView === 'signup') {
    return (
      <SignupPage
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => setAuthView('login')}
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
          session={activeImpersonation}
          onExit={handleStopImpersonation}
        />
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
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
            onNewInvoice={() => {
              setEditingInvoice(null);
              setActiveTab('create_invoice');
            }}
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
          />

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
                onNewInvoice={() => {
                  setEditingInvoice(null);
                  setActiveTab('create_invoice');
                }}
                onViewInvoice={(inv) => setActivePrintInvoice(inv)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenQuickPayment={() => setActiveTab('payments')}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoiceListView
                invoices={invoices}
                onNewInvoice={() => {
                  setEditingInvoice(null);
                  setActiveTab('create_invoice');
                }}
                onViewInvoice={(inv) => setActivePrintInvoice(inv)}
                onEditInvoice={handleEditInvoice}
                onDuplicateInvoice={handleDuplicateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onConvertQuotation={handleConvertQuotationToInvoice}
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
              />
            )}

            {activeTab === 'suppliers' && (
              <SupplierListView
                clients={clients}
                invoices={invoices}
                company={company}
                onAddSupplier={handleAddClient}
                onUpdateSupplier={handleUpdateClient}
                onDeleteSupplier={handleDeleteClient}
              />
            )}

            {activeTab === 'products' && (
              <ProductListView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentLedgerView
                payments={payments}
                clients={clients}
                company={company}
                onRecordPayment={handleRecordPayment}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView invoices={invoices} company={company} />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionView
                company={company}
                subscription={subscription}
                onUpgradeSuccess={handleUpgradeSubscription}
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
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Ledger Synchronized
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Kannaku GST Invoicing Suite</span>
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
    </div>
  );
}

