import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  Mail,
  HelpCircle,
  Building2,
  Phone,
  Lock,
  CheckCircle2,
  Printer,
  ExternalLink,
  ChevronRight,
  CreditCard,
} from 'lucide-react';

export type LegalDocType =
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'shipping'
  | 'contact'
  | 'security';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'terms',
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  // Sync state if initialDoc changes when opening
  React.useEffect(() => {
    if (isOpen && initialDoc) {
      setActiveDoc(initialDoc);
    }
  }, [isOpen, initialDoc]);

  if (!isOpen) return null;

  const docs = [
    {
      id: 'terms' as LegalDocType,
      title: 'Terms & Conditions',
      shortTitle: 'Terms of Service',
      icon: FileText,
      badge: 'Agreement',
    },
    {
      id: 'privacy' as LegalDocType,
      title: 'Privacy Policy',
      shortTitle: 'Privacy',
      icon: ShieldCheck,
      badge: 'DPDP Act',
    },
    {
      id: 'refund' as LegalDocType,
      title: 'Cancellation & Refund Policy',
      shortTitle: 'Refunds & Returns',
      icon: RotateCcw,
      badge: 'Required by Gateways',
    },
    {
      id: 'shipping' as LegalDocType,
      title: 'Shipping & Delivery Policy',
      shortTitle: 'SaaS Delivery',
      icon: Truck,
      badge: 'Digital Fulfillment',
    },
    {
      id: 'contact' as LegalDocType,
      title: 'Contact Us & Grievance Redressal',
      shortTitle: 'Contact & Support',
      icon: Mail,
      badge: 'Mandatory',
    },
    {
      id: 'security' as LegalDocType,
      title: 'Payment & Gateway Security Policy',
      shortTitle: 'Payment Security',
      icon: Lock,
      badge: 'PCI-DSS',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icon-mark.svg"
              alt="JustGST"
              className="w-8 h-8 rounded-lg object-contain shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  JustGST Legal & Compliance Center
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Compliant with RBI, IT Act 2000, DPDP Act & Payment Aggregator Standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Policy"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Layout: Sidebar navigation + Content view */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-2 sm:p-3 space-y-1 overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col gap-1 md:gap-0">
            <div className="hidden md:block px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Legal Disclosures
            </div>
            {docs.map((doc) => {
              const Icon = doc.icon;
              const isActive = activeDoc === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left shrink-0 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{doc.shortTitle}</span>
                  </div>
                  <ChevronRight
                    className={`hidden md:block w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}

            {/* Merchant Identification Note */}
            <div className="hidden md:block mt-6 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5 text-[11px]">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Merchant Identity</span>
              </div>
              <div className="text-slate-600 leading-tight space-y-0.5">
                <strong className="text-slate-900 block">Rajaganapathy Kamalakannan</strong>
                <div className="text-[10px] text-slate-500 font-medium">Individual Operator (Brand: JustGST)</div>
                <div className="text-[10px] text-brand-700 font-semibold">100% Digital Cloud Service</div>
                <div className="text-[10px] text-slate-400">Tamil Nadu, India</div>
              </div>
              <div className="pt-1 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>PayU Verified Individual Merchant</span>
              </div>
            </div>
          </div>

          {/* Document Content View */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed">
            {activeDoc === 'terms' && <TermsContent />}
            {activeDoc === 'privacy' && <PrivacyContent />}
            {activeDoc === 'refund' && <RefundContent />}
            {activeDoc === 'shipping' && <ShippingContent />}
            {activeDoc === 'contact' && <ContactContent />}
            {activeDoc === 'security' && <SecurityContent />}
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL Secured
            </span>
            <span className="text-slate-300">•</span>
            <span>PayU Gateway Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   TERMS AND CONDITIONS COMPONENT
   ========================================================================== */
const TermsContent: React.FC = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4">
      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
        Legal Agreement
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
        Terms and Conditions of Service
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Last Updated: March 2026 • Applicable to all JustGST Users &amp; Subscribers
      </p>
    </div>

    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">1. Introduction &amp; Acceptance</h3>
        <p>
          Welcome to <strong>JustGST</strong> (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a cloud-hosted software application created, owned, and operated by <strong>Rajaganapathy Kamalakannan</strong> as an individual, trading under the brand name <strong>JustGST</strong>. By accessing, registering for, or using our cloud-based GST billing, invoicing, and inventory management software, you (&quot;User&quot;, &quot;Customer&quot;, or &quot;Subscriber&quot;) agree to be legally bound by these Terms and Conditions.
        </p>
        <p>
          JustGST operates as a 100% digital cloud service delivering software functionality over the internet. If you do not agree with any part of these terms, you must not access or use the platform.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">2. Eligibility &amp; Account Responsibility</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be at least 18 years of age and legally competent to enter into binding commercial contracts under the Indian Contract Act, 1872.</li>
          <li>You represent that all business details, Goods and Services Tax Identification Numbers (GSTIN), PAN, and banking information provided are authentic, accurate, and lawfully owned by your business.</li>
          <li>You are solely responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">3. SaaS Software License &amp; Usage</h3>
        <p>
          Subject to compliance with these Terms and active subscription payments, JustGST grants you a non-exclusive, non-transferable, revocable license to access the web application to generate GST invoices, manage client/supplier ledgers, track inventory, and download GSTR-compatible reports.
        </p>
        <p>
          As an intangible cloud software service, all access is provided electronically. You agree not to reverse engineer, decompile, resell, white-label without authorization, or inject malicious code into the platform.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">4. Subscription Plans, Billing &amp; Payment Processing</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Free Trial:</strong> We offer a 14-day fully featured trial with no upfront credit card required.</li>
          <li><strong>Pricing &amp; Currency:</strong> All prices are displayed in Indian Rupees (INR ₹). Subscriptions are available in 1-Month, 6-Month, and 12-Month tiers.</li>
          <li><strong>Payment Processing:</strong> Payments are processed through RBI-authorized payment aggregator PayU Payments Private Limited (https://payu.in/). We do not store raw card numbers, PINs, or CVVs.</li>
          <li><strong>Applicable Taxes:</strong> In accordance with Indian tax laws, applicable GST (18% on SaaS services) is levied during checkout. Valid GST tax invoices are provided for input tax credit (ITC) claims.</li>
          <li><strong>Renewal:</strong> Subscriptions do not auto-debit without explicit user authorization through RBI-compliant e-Mandate or UPI AutoPay instructions.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">5. Dynamic UPI QR &amp; Third-Party Services</h3>
        <p>
          JustGST generates NPCI-compliant UPI QR codes stamped with your own UPI VPA for printed and digital invoices. JustGST is not a bank, NBFC, or payment aggregator for your end-customer collections. Payments made by your customers scan directly into your designated bank account.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">6. Data Ownership &amp; Intellectual Property</h3>
        <p>
          You retain 100% ownership of your business data, customer lists, invoice records, and financial ledgers. JustGST owns all intellectual property rights in the software, logos, trademarks, and UI design. You may export your invoice and transaction data anytime in standard formats.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">7. Limitation of Liability &amp; Disclaimers</h3>
        <p>
          JustGST is an invoicing calculation and record-keeping tool. It does not provide certified legal, chartered accountancy, or tax filing advice. Users are responsible for verifying invoice calculations prior to filing official GSTR-1, GSTR-3B, or e-Way bill returns with the GSTN portal.
        </p>
        <p>
          To the maximum extent permitted by Indian Law, our total aggregate liability for any claims arising from the service shall not exceed the amount actually paid by you to JustGST in the previous twelve (12) months.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">8. Governing Law &amp; Jurisdiction</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
        </p>
      </section>
    </div>
  </div>
);

/* ==========================================================================
   PRIVACY POLICY COMPONENT
   ========================================================================== */
const PrivacyContent: React.FC = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4">
      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
        Data Protection &amp; Privacy
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
        Privacy Policy
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Operated by Rajaganapathy Kamalakannan (JustGST) • Compliant with DPDP Act 2023 &amp; IT Rules 2011
      </p>
    </div>

    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account Information:</strong> Name, business name, work email address, phone number, and encrypted password credentials.</li>
          <li><strong>Business &amp; Invoicing Data:</strong> Goods and Services Tax Identification Numbers (GSTIN), PAN, state jurisdiction code, bank account details, UPI VPA, and company signature/logos uploaded by you.</li>
          <li><strong>Transactional Content:</strong> Customer and supplier records, product/service catalogs, HSN/SAC codes, invoice line items, tax breakdowns, and payment reconciliation logs.</li>
          <li><strong>Technical Metadata:</strong> IP addresses, browser user-agent, session timestamps, and diagnostic error logs for system uptime and fraud prevention.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">2. How We Use Your Data</h3>
        <p>Your data is processed strictly for legitimate operational purposes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provisioning your cloud billing workspace and rendering GST-compliant invoices and tax calculations.</li>
          <li>Processing software subscription payments securely through RBI-authorized payment aggregator PayU Payments Private Limited (https://payu.in/).</li>
          <li>Generating PDF invoices, thermal receipts, and downloadable GSTR-compatible reports.</li>
          <li>Sending critical transactional alerts, renewal notices, and security advisories.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">3. Payment Information &amp; Third-Party Processors</h3>
        <p>
          <strong>We never sell, rent, monetize, or trade your business or customer records.</strong>
        </p>
        <p>Data is shared solely with trusted service providers under strict non-disclosure terms:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Payment Aggregator:</strong> All online payments are handled directly by PayU Payments Private Limited (https://payu.in/). We do not store, process, or transmit raw credit/debit card numbers, CVVs, expiry dates, netbanking passwords, or UPI MPINs.</li>
          <li><strong>Cloud Infrastructure:</strong> Cloudflare &amp; Google Cloud servers for high-availability database hosting and 256-bit encrypted data storage in compliant data centers.</li>
          <li><strong>Statutory Authorities:</strong> Disclosed only when strictly required by enforceable legal warrants, court orders, or statutory regulatory bodies under Indian law.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">4. Security Safeguards</h3>
        <p>
          We employ industry-standard administrative, physical, and technical safeguards including HTTPS/TLS 1.3 encryption in transit, AES-256 encryption at rest, tokenized authentication sessions, and automated daily database backups.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">5. User Data Rights &amp; Deletion</h3>
        <p>
          Under the DPDP Act 2023, you have the right to review, update, export, or request the complete deletion of your account and associated billing records. You may export your records anytime via the Reports module or submit a data purge request to <strong>support@justgst.in</strong> or <strong>grievance@justgst.in</strong>.
        </p>
      </section>
    </div>
  </div>
);

/* ==========================================================================
   REFUND & CANCELLATION POLICY (Strictly audited by Payment Gateways)
   ========================================================================== */
const RefundContent: React.FC = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4">
      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
        Payment Gateway Mandate
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
        Cancellation, Return &amp; Refund Policy
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Clear Terms for Subscription Plans &amp; SaaS Services
      </p>
    </div>

    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-xs">
        <strong>Summary:</strong> We offer a 14-day risk-free trial. If you purchase a paid subscription and encounter technical defects or are unsatisfied within <strong>7 days</strong> of payment, you are eligible for a full refund processed back to your original payment method.
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">1. Subscription Cancellation</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>You can cancel your subscription at any time directly through your account dashboard under <strong>Settings &gt; Subscription</strong>, or by emailing our support desk.</li>
          <li>Upon cancellation, your subscription will remain active until the end of your prepaid billing period (e.g., end of the month or year), after which your account will revert to the free/archive tier.</li>
          <li>You will not be billed further after cancellation.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">2. Refund Eligibility &amp; 7-Day Guarantee</h3>
        <p>
          Because JustGST provides a 14-day free trial before any payment is taken, users have ample opportunity to evaluate all features. However, we also provide a <strong>7-Day Money-Back Guarantee</strong> under the following conditions:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Initial Purchase Refund:</strong> If you request a refund within 7 calendar days of your initial subscription payment, a 100% refund will be issued.</li>
          <li><strong>Technical Failure / Defect:</strong> If the platform experiences critical failure preventing GST invoicing that our engineering team cannot resolve within 48 hours, a pro-rata refund for the unused term will be issued.</li>
          <li><strong>Duplicate / Erroneous Deductions:</strong> In case of accidental duplicate charges or failed transaction debits, the entire duplicate amount will be refunded immediately without deduction.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">3. Non-Refundable Items</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Refund requests made after 7 days from the initial payment date for monthly plans.</li>
          <li>Custom enterprise setups, bespoke integration fees, or one-off consultation charges.</li>
          <li>Accounts terminated due to violation of acceptable use or fraudulent invoicing activities.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">4. Refund Processing Timeline</h3>
        <p>
          Once your refund request is approved by our billing team:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Refunds are initiated within <strong>24 to 48 hours</strong> of verification.</li>
          <li>The refund is credited back to the <strong>original source payment method</strong> (Credit/Debit Card, NetBanking, UPI, or Wallet) through the respective payment gateway (PayU / Dodo Payments).</li>
          <li>The funds typically reflect in your bank account or card statement within <strong>5 to 7 business days</strong>, subject to your issuing bank&apos;s settlement schedule.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">5. How to Request a Refund</h3>
        <p>
          To initiate a cancellation or refund, email <strong>support@justgst.in</strong> with your registered email ID, Order/Payment ID, and reason for the request. You can also reach our WhatsApp support desk at <strong>+91-9597992677</strong>.
        </p>
      </section>
    </div>
  </div>
);

/* ==========================================================================
   SHIPPING & DELIVERY POLICY (Crucial for SaaS approval by Payment Gateways)
   ========================================================================== */
const ShippingContent: React.FC = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4">
      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
        SaaS Digital Fulfillment
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
        Shipping &amp; Delivery Policy
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Digital Software Fulfillment • Operated by Rajaganapathy Kamalakannan (Brand: JustGST)
      </p>
    </div>

    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs">
        <strong>100% Digital Goods &amp; Cloud Services:</strong> JustGST is a cloud-hosted Software-as-a-Service (SaaS) application operated by <strong>Rajaganapathy Kamalakannan</strong> as an individual, trading under the brand <strong>JustGST</strong>. We provide purely digital software access and do not manufacture, package, or dispatch any physical tangible goods. Physical courier shipping addresses, transit tracking numbers, and freight charges are <strong>completely not applicable</strong>.
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">1. Instant Electronic Service Provisioning</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Instant Cloud Access:</strong> Access to the JustGST software platform and your tenant workspace is provisioned electronically and immediately upon completing online registration or successful subscription confirmation via PayU.</li>
          <li><strong>Zero Wait Time:</strong> You can create and download GST invoices, generate dynamic UPI payment QRs, print receipts, and manage accounts immediately after payment without any physical dispatch or manual delay.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">2. Tax Invoice &amp; Payment Receipt Delivery</h3>
        <p>
          Upon successful payment processing by our payment gateway partner PayU Payments Private Limited:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>An automated electronic confirmation and GST Tax Invoice containing your subscription plan details and payment transaction reference is delivered to your registered email address within <strong>5 minutes</strong>.</li>
          <li>A downloadable PDF copy of your tax invoice is permanently accessible inside your workspace under <strong>Settings &gt; Billing &amp; Invoices</strong>.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">3. Electronic Fulfillment Support</h3>
        <p>
          If you have completed payment but do not see your account upgraded or haven&apos;t received your confirmation email within 15 minutes, please check your spam folder or contact our support desk directly at <strong>support@justgst.in</strong> or <strong>contact@justgst.in</strong> with your PayU payment reference ID. Your cloud workspace will be synchronized immediately.
        </p>
      </section>
    </div>
  </div>
);

/* ==========================================================================
   CONTACT US & GRIEVANCE REDRESSAL (Mandatory under IT Act & Consumer Rules)
   ========================================================================== */
const ContactContent: React.FC = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4">
      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
        Statutory Merchant Disclosure
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
        Contact Us &amp; Grievance Redressal
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Compliant with the Information Technology (Intermediary Guidelines) Rules, 2021 &amp; Consumer Protection Act, 2019
      </p>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Operating Entity Details */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Merchant / Operating Identity</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Operator / Founder Name</span>
              <p className="font-bold text-slate-900 text-sm">Rajaganapathy Kamalakannan</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Brand / Platform</span>
              <p className="font-semibold text-brand-700">JustGST (Cloud Billing &amp; Invoicing Platform)</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Category &amp; Jurisdiction</span>
              <p className="text-slate-700">Individual (Operating under brand JustGST)</p>
              <p className="text-slate-500 text-[11px]">Tamil Nadu, India (100% Online Cloud Operations)</p>
            </div>
            <div className="pt-1 text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
              <em>Note: Operates as an Individual under personal PAN in accordance with PayU&apos;s Individual Merchant onboarding guidelines. As an intangible, 100% digital cloud SaaS platform, all software functionality, user onboarding, customer care, and billing receipts are delivered over the internet with zero physical storefront requirements.</em>
            </div>
          </div>
        </div>

        {/* Support & Help Desk */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-brand-600" />
            <span>Customer Support &amp; Inquiries</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <p>
              <strong>Customer Support Email:</strong>{' '}
              <a
                href="mailto:support@justgst.in"
                className="text-brand-600 hover:underline font-medium"
              >
                support@justgst.in
              </a>
            </p>
            <p>
              <strong>Direct Merchant Email:</strong>{' '}
              <a
                href="mailto:contact@justgst.in"
                className="text-brand-600 hover:underline font-medium"
              >
                contact@justgst.in
              </a>
            </p>
            <p>
              <strong>Billing &amp; Invoicing:</strong>{' '}
              <a
                href="mailto:billing@justgst.in"
                className="text-brand-600 hover:underline font-medium"
              >
                billing@justgst.in
              </a>
            </p>
            <p>
              <strong>Support Phone / WhatsApp:</strong>{' '}
              <a
                href="tel:+919597992677"
                className="text-slate-900 font-semibold hover:text-brand-600 transition-colors"
              >
                +91-9597992677
              </a>
            </p>
            <p className="text-[11px] text-slate-500">
              <strong>Support Hours:</strong> Monday – Saturday: 9:00 AM – 7:00 PM IST (Online Desk Active)
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Grievance Redressal Officer */}
      <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-700" />
            <span>Designated Grievance Officer (India IT Rules)</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-200/60 text-brand-900">
            Statutory
          </span>
        </div>
        <p className="text-xs text-brand-800">
          In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-brand-950 font-medium">
          <div>
            <span className="text-[10px] text-brand-700 block uppercase">Name &amp; Designation</span>
            <strong>Rajaganapathy Kamalakannan</strong>
            <span className="block text-[10px] text-slate-600 font-normal">Individual Operator &amp; Grievance Officer</span>
          </div>
          <div>
            <span className="text-[10px] text-brand-700 block uppercase">Grievance Contact Email</span>
            <a
              href="mailto:grievance@justgst.in"
              className="text-brand-800 underline font-bold"
            >
              grievance@justgst.in
            </a>
            <span className="block text-[10px] text-slate-600 font-normal">Alternate: support@justgst.in</span>
          </div>
          <div>
            <span className="text-[10px] text-brand-700 block uppercase">Phone &amp; Resolution SLA</span>
            <strong className="block text-slate-900 font-bold">+91-9597992677</strong>
            <span className="block text-[10px] text-slate-600 font-normal">Ack within 36 hrs • Resolution in 15 days</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ==========================================================================
   PAYMENT & GATEWAY SECURITY POLICY
   ========================================================================== */
const SecurityContent: React.FC = () => (
  <div className="space-y-6">
    <div className="border-b border-slate-200 pb-4">
      <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">
        Financial Data Protection
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
        Payment &amp; Gateway Security Policy
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        PayU Payment Gateway Integration • PCI-DSS Level 1 Compliant Architecture
      </p>
    </div>

    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">1. Payment Aggregator Compliance (PayU)</h3>
        <p>
          All subscription payments, plan upgrades, and SaaS billing transactions on JustGST are routed exclusively through RBI-authorized payment aggregators, primarily <strong>PayU Payments Private Limited</strong> (https://payu.in/).
        </p>
        <p>
          JustGST strictly adheres to RBI directives on card tokenization and digital payment safety. <strong>We do not collect, process, or store raw credit/debit card numbers, CVVs, expiration dates, net banking passwords, or UPI MPINs on our application servers.</strong>
        </p>
        <p>
          Payment tokenization and transaction processing are handled within bank-grade, PCI-DSS Level 1 certified infrastructure managed by PayU.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">2. Supported Payment Methods</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800">
            UPI (BHIM, Google Pay, PhonePe, Paytm, Any App)
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800">
            Credit &amp; Debit Cards (RuPay, Visa, MasterCard)
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800">
            NetBanking (50+ Indian Commercial Banks)
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800">
            e-Mandate / UPI AutoPay (RBI Authorized)
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900">3. Encryption &amp; Anti-Fraud Safeguards</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>256-Bit SSL/TLS Encryption:</strong> All data transmissions between your browser and our servers are encrypted using modern Transport Layer Security (TLS 1.3 / 256-bit AES).</li>
          <li><strong>Mandatory Two-Factor Authentication:</strong> Card transactions require mandatory OTP/3D-Secure verification from your issuing bank.</li>
          <li><strong>Real-Time Fraud Prevention:</strong> Automated anomaly detection filters prevent unauthorized transactions and velocity abuse.</li>
        </ul>
      </section>
    </div>
  </div>
);
