import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Plus, CheckCircle2, Shield, Search } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { FeatureFlag } from '../../types/admin';

export const FeatureFlagsView: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(SaaSAdminDB.getFeatureFlags());
  const [search, setSearch] = useState('');

  const reloadData = () => {
    setFlags(SaaSAdminDB.getFeatureFlags());
  };

  const handleToggleGlobal = (flag: FeatureFlag) => {
    const updated: FeatureFlag = {
      ...flag,
      isEnabledGlobal: !flag.isEnabledGlobal,
      updatedOn: new Date().toISOString(),
    };
    SaaSAdminDB.saveFeatureFlag(updated);
    SaaSAdminDB.logAction('TOGGLE_FEATURE_FLAG', 'FEATURE_FLAG', flag.id, flag.name, {
      newVal: `isEnabledGlobal: ${updated.isEnabledGlobal}`,
    });
    reloadData();
  };

  const filteredFlags = flags.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ToggleLeft className="w-6 h-6 text-purple-400" />
            <span>Platform Feature Flags & Toggles</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Safely enable or disable platform capabilities, beta rollouts, and pricing tier features
          </p>
        </div>
      </div>

      {/* Flag Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map((flag) => {
          return (
            <div
              key={flag.id}
              className={`p-5 rounded-2xl bg-slate-950 border flex flex-col justify-between space-y-4 transition-all ${
                flag.isEnabledGlobal ? 'border-purple-500/50' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                    {flag.key}
                  </span>
                  <button
                    onClick={() => handleToggleGlobal(flag)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      flag.isEnabledGlobal
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {flag.isEnabledGlobal ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        <span>ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        <span>DISABLED</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-white">{flag.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{flag.description}</p>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Target Plans:</span>
                  <div className="flex flex-wrap gap-1">
                    {(flag.enabledPlans || []).map((p) => (
                      <span key={p} className="px-1.5 py-0.2 bg-slate-900 text-slate-300 rounded font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Updated: {new Date(flag.updatedOn).toLocaleDateString()}</span>
                <span>Target Orgs: {(flag.targetedOrgIds || []).length} customized</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
