import React, { useState } from 'react';
import {
  Clock,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { TenantOrganizationFull } from '../../types/admin';

export const TrialManagementView: React.FC = () => {
  const [organizations, setOrganizations] = useState<TenantOrganizationFull[]>(
    SaaSAdminDB.getOrganizations()
  );
  const [search, setSearch] = useState('');

  const reloadData = () => {
    setOrganizations(SaaSAdminDB.getOrganizations());
  };

  const trialOrgs = organizations.filter(
    (o) => o.subscriptionStatus === 'TRIAL' || o.planId === 'plan_free'
  );

  const handleExtend = (org: TenantOrganizationFull, days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    const updated: TenantOrganizationFull = {
      ...org,
      subscriptionStatus: 'TRIAL',
      trialEndDate: nextDate.toISOString().split('T')[0],
      renewalDate: nextDate.toISOString().split('T')[0],
    };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'EXTEND_TRIAL',
      'ORGANIZATION',
      org.id,
      org.name,
      { newVal: `Extended trial by +${days} days to ${updated.trialEndDate}` }
    );
    reloadData();
    alert(`Trial extended by +${days} days for ${org.name}.`);
  };

  const handleConvertToPaid = (org: TenantOrganizationFull) => {
    const updated: TenantOrganizationFull = {
      ...org,
      subscriptionStatus: 'ACTIVE',
      planId: 'plan_starter',
      planName: 'Starter Business',
      mrr: 799,
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'CONVERT_TRIAL_TO_PAID',
      'ORGANIZATION',
      org.id,
      org.name,
      { newVal: `Converted to paid Starter Business (₹799/mo)` }
    );
    reloadData();
    alert(`${org.name} successfully converted to Paid Active status.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Trial Accounts & Conversion Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor active trial engagements, extend trial deadlines, and accelerate conversions
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Platform Trial Conversion Rate: 68.4%</span>
        </div>
      </div>

      {/* Trial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trialOrgs.map((org) => {
          const daysLeft = Math.max(
            0,
            Math.ceil(
              (new Date(org.trialEndDate || org.renewalDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          );

          return (
            <div
              key={org.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                      {org.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{org.name}</div>
                      <div className="text-[11px] text-slate-400">{org.adminEmail}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      daysLeft <= 3
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {daysLeft === 0 ? 'Expires Today' : `${daysLeft} Days Left`}
                  </span>
                </div>

                {/* Activity stats during trial */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Invoices Created:</span>
                    <strong className="text-white">{org.usage.invoicesCreated}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Customers Logged:</span>
                    <strong className="text-white">{org.usage.customersCount}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Trial Expiry:</span>
                    <strong className="text-amber-400 font-mono">
                      {new Date(org.trialEndDate || org.renewalDate).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleConvertToPaid(org)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Convert to Paid Active Plan</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExtend(org, 7)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    +7 Days
                  </button>
                  <button
                    onClick={() => handleExtend(org, 14)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    +14 Days
                  </button>
                  <button
                    onClick={() => handleExtend(org, 30)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    +30 Days
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
