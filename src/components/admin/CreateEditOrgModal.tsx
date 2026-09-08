import React, { useState, useEffect } from 'react';
import { Building2, X, Check, Globe, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import {
  TenantOrganizationFull,
  SaaSPlan,
  OrgSubscriptionStatus,
  OrgAccountStatus,
} from '../../types/admin';

interface CreateEditOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationToEdit?: TenantOrganizationFull | null;
  onSaved: () => void;
}

export const CreateEditOrgModal: React.FC<CreateEditOrgModalProps> = ({
  isOpen,
  onClose,
  organizationToEdit,
  onSaved,
}) => {
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [planId, setPlanId] = useState('plan_starter');
  const [subscriptionStatus, setSubscriptionStatus] = useState<OrgSubscriptionStatus>('ACTIVE');
  const [accountStatus, setAccountStatus] = useState<OrgAccountStatus>('ACTIVE');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY' | 'LIFETIME' | 'TRIAL'>('MONTHLY');
  const [trialEndDate, setTrialEndDate] = useState<string>('');
  const [renewalDate, setRenewalDate] = useState<string>('');
  const [customDomain, setCustomDomain] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPlans(SaaSAdminDB.getPlans());
      if (organizationToEdit) {
        setName(organizationToEdit.name);
        setOwnerName(organizationToEdit.ownerName);
        setAdminEmail(organizationToEdit.adminEmail);
        setMobile(organizationToEdit.mobile);
        setRegisterNumber(organizationToEdit.registerNumber || '');
        setAddress(organizationToEdit.notes || '');
        setCity(organizationToEdit.city || 'Bengaluru');
        setState(organizationToEdit.state || 'Karnataka');
        setCountry(organizationToEdit.country || 'India');
        setPlanId(organizationToEdit.planId);
        setSubscriptionStatus(organizationToEdit.subscriptionStatus);
        setAccountStatus(organizationToEdit.accountStatus);
        setBillingCycle(organizationToEdit.billingCycle);
        setTrialEndDate(
          organizationToEdit.trialEndDate
            ? organizationToEdit.trialEndDate.split('T')[0]
            : new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
        );
        setRenewalDate(
          organizationToEdit.renewalDate
            ? organizationToEdit.renewalDate.split('T')[0]
            : new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
        );
        setCustomDomain(organizationToEdit.customDomain || '');
        setNotes(organizationToEdit.notes || '');
      } else {
        setName('');
        setOwnerName('');
        setAdminEmail('');
        setMobile('+91 9');
        setRegisterNumber('');
        setAddress('');
        setCity('Bengaluru');
        setState('Karnataka');
        setCountry('India');
        setPlanId('plan_starter');
        setSubscriptionStatus('TRIAL');
        setAccountStatus('ACTIVE');
        setBillingCycle('MONTHLY');
        setTrialEndDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
        setRenewalDate(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
        setCustomDomain('');
        setNotes('');
      }
    }
  }, [isOpen, organizationToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !adminEmail || !ownerName) {
      alert('Please fill in required fields (Name, Owner, Email)');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
    const isNew = !organizationToEdit;
    const orgId = organizationToEdit ? organizationToEdit.id : `org_${Date.now().toString(36)}`;

    const savedOrg: TenantOrganizationFull = {
      id: orgId,
      name,
      slug: organizationToEdit?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ownerName,
      adminEmail,
      mobile,
      registerNumber,
      city,
      state,
      country,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      subscriptionStatus,
      accountStatus,
      billingCycle,
      subscriptionStartDate: organizationToEdit?.subscriptionStartDate || new Date().toISOString().split('T')[0],
      mrr: billingCycle === 'YEARLY' ? Math.round(selectedPlan.yearlyPriceInr / 12) : selectedPlan.monthlyPriceInr,
      renewalDate: renewalDate ? new Date(renewalDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      trialEndDate: trialEndDate ? new Date(trialEndDate).toISOString() : new Date(Date.now() + 15 * 86400000).toISOString(),
      usersCount: organizationToEdit?.usersCount || 1,
      customDomain: customDomain || undefined,
      notes: notes ? `${notes} (Address: ${address})` : (address || undefined),
      usage: organizationToEdit?.usage || {
        invoicesCreated: 0,
        estimatesCreated: 0,
        customersCount: 0,
        suppliersCount: 0,
        productsCount: 0,
        storageUsedMB: 0.1,
        pdfGenerationsCount: 0,
        gstTaxHandledInr: 0,
        paymentLedgerEntries: 0,
      },
      createdDate: organizationToEdit?.createdDate || new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    SaaSAdminDB.saveOrganization(savedOrg);
    SaaSAdminDB.logAction(
      isNew ? 'CREATE_ORGANIZATION' : 'UPDATE_ORGANIZATION',
      'ORGANIZATION',
      savedOrg.id,
      savedOrg.name,
      { orgId: savedOrg.id, orgName: savedOrg.name, newVal: `Plan: ${savedOrg.planName}, Status: ${savedOrg.subscriptionStatus}` }
    );

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600/20 text-brand-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {organizationToEdit ? 'Edit Tenant Organization' : 'Provision New Organization'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure business metadata, subscription tiers, and limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Business / Company Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Logistics Pvt Ltd"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Owner Full Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Admin Email Address *</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="rajesh@apexlogistics.in"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Phone / Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Tax ID / GSTIN</label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">City & State</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Assigned Plan Tier</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.monthlyPriceInr}/mo)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Subscription Status</label>
              <select
                value={subscriptionStatus}
                onChange={(e) => setSubscriptionStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIAL">TRIAL</option>
                <option value="PAST_DUE">PAST_DUE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Billing Interval</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="HALF_YEARLY">6 Months</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          {/* Usage Time Period & Expiry Configuration */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Usage Time Period & Expiration Dates
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Trial End Date (if Trial)</label>
                <input
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Paid Renewal Date (if Paid)</label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-bold mr-1">Quick Presets:</span>
              {[
                { label: '+7 Days', days: 7 },
                { label: '+15 Days', days: 15 },
                { label: '+30 Days', days: 30 },
                { label: '+90 Days', days: 90 },
                { label: '+1 Year', days: 365 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    const target = subscriptionStatus === 'TRIAL' ? trialEndDate : renewalDate;
                    const base = target ? new Date(target) : new Date();
                    const next = isNaN(base.getTime()) ? new Date() : new Date(base);
                    next.setDate(next.getDate() + p.days);
                    const iso = next.toISOString().split('T')[0];
                    if (subscriptionStatus === 'TRIAL') setTrialEndDate(iso);
                    else setRenewalDate(iso);
                  }}
                  className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[10px] font-bold cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Custom CNAME Domain</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="billing.customerdomain.com"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Internal Admin Operator Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enterprise custom terms, GST exemption notes, support escalation contacts..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-brand-900/30"
            >
              <Check className="w-4 h-4" />
              <span>{organizationToEdit ? 'Save Changes' : 'Provision Organization'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
