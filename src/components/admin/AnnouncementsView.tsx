import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { PlatformAnnouncement } from '../../types/admin';

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(
    SaaSAdminDB.getAnnouncements()
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<PlatformAnnouncement['type']>('INFO');
  const [targetAudience, setTargetAudience] = useState<PlatformAnnouncement['targetAudience']>('ALL');
  const [dismissible, setDismissible] = useState(true);

  const reloadData = () => {
    setAnnouncements(SaaSAdminDB.getAnnouncements());
  };

  const handleToggleActive = (ann: PlatformAnnouncement) => {
    const updated = { ...ann, isActive: !ann.isActive };
    SaaSAdminDB.saveAnnouncement(updated);
    SaaSAdminDB.logAction('BROADCAST_ANNOUNCEMENT', 'ANNOUNCEMENT', ann.id, ann.title, {
      newVal: `isActive: ${updated.isActive}`,
    });
    reloadData();
  };

  const handleDelete = (ann: PlatformAnnouncement) => {
    if (window.confirm(`Delete broadcast "${ann.title}"?`)) {
      SaaSAdminDB.deleteAnnouncement(ann.id);
      SaaSAdminDB.logAction('DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT', ann.id, ann.title);
      reloadData();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newAnn: PlatformAnnouncement = {
      id: `ann_${Date.now()}`,
      title,
      message,
      type,
      targetAudience,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      isDismissible: dismissible,
      isActive: true,
      createdOn: new Date().toISOString(),
    };

    SaaSAdminDB.saveAnnouncement(newAnn);
    SaaSAdminDB.logAction('CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', newAnn.id, newAnn.title, {
      newVal: `Type: ${type}, Audience: ${targetAudience}`,
    });
    reloadData();
    setIsCreateOpen(false);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-brand-400" />
            <span>Platform Broadcast Announcements & Banners</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast urgent system notices, maintenance alerts, and promotional banners to tenant workspaces
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-900/30 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => {
          return (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl bg-slate-950 border flex flex-col justify-between space-y-4 ${
                ann.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      ann.type === 'MAINTENANCE'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : ann.type === 'WARNING'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : ann.type === 'PROMOTION'
                        ? 'bg-purple-950 text-purple-400 border border-purple-800'
                        : 'bg-brand-950 text-brand-400 border border-brand-800'
                    }`}
                  >
                    {ann.type}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ann.isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ann.isActive ? 'BROADCASTING' : 'INACTIVE'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{ann.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ann.message}</p>

                <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                  <span>Audience: <strong className="text-slate-300">{ann.targetAudience}</strong></span>
                  <span>Dismissible: {ann.dismissible ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleActive(ann)}
                  className="font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  {ann.isActive ? 'Pause Broadcast' : 'Resume Broadcast'}
                </button>
                <button
                  onClick={() => handleDelete(ann)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-400" />
              <span>Create Platform Announcement</span>
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled GST E-Invoicing Server Maintenance"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Announcement Body *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed notification message shown to tenant operators..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Banner Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="INFO">INFO (Blue)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Amber)</option>
                    <option value="WARNING">WARNING (Rose)</option>
                    <option value="PROMOTION">PROMOTION (Purple)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="ALL">All Tenants</option>
                    <option value="TRIAL">Trial Tenants Only</option>
                    <option value="PAID">Paid Subscriptions Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Launch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
