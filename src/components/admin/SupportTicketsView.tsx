import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  Building2,
  Paperclip,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SupportTicket, SupportTicketMessage } from '../../types/admin';

export const SupportTicketsView: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(SaaSAdminDB.getSupportTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const reloadData = () => {
    const updated = SaaSAdminDB.getSupportTickets();
    setTickets(updated);
    if (selectedTicket) {
      const refreshedSelected = updated.find((t) => t.id === selectedTicket.id);
      if (refreshedSelected) setSelectedTicket(refreshedSelected);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const admin = SaaSAdminDB.getActiveAdminUser();
    const newMsg: SupportTicketMessage = {
      id: `msg_${Date.now()}`,
      senderName: `${admin.name} (Super Admin)`,
      senderRole: 'ADMIN',
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      status: 'IN_PROGRESS',
      lastUpdated: new Date().toISOString(),
      messages: [...selectedTicket.messages, newMsg],
    };

    SaaSAdminDB.saveSupportTicket(updatedTicket);
    SaaSAdminDB.logAction('REPLY_SUPPORT_TICKET', 'TICKET', selectedTicket.id, selectedTicket.subject, {
      newVal: replyText.trim(),
    });
    setReplyText('');
    reloadData();
  };

  const handleUpdateStatus = (newStatus: SupportTicket['status']) => {
    if (!selectedTicket) return;
    const updated: SupportTicket = {
      ...selectedTicket,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    };
    SaaSAdminDB.saveSupportTicket(updated);
    SaaSAdminDB.logAction('RESOLVE_SUPPORT_TICKET', 'TICKET', selectedTicket.id, selectedTicket.subject, {
      newVal: `Status: ${newStatus}`,
    });
    reloadData();
  };

  const filteredTickets = tickets.filter(
    (t) => statusFilter === 'ALL' || t.status === statusFilter
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-amber-400" />
            <span>Support Desk & Customer Incident Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolve tenant queries, investigate billing disputes, and assist business users in real-time
          </p>
        </div>
      </div>

      {/* 2-Pane Helpdesk Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[650px]">
        {/* Left List of Tickets */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center gap-1 bg-slate-900/60 overflow-x-auto text-xs">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border border-amber-500/40 text-white'
                      : 'hover:bg-slate-900 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-500">{t.id}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-950 text-rose-400'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <div className="font-bold text-xs truncate">{t.subject}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {t.organizationName} • {t.userName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Ticket Thread */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">{selectedTicket.subject}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Tenant: <strong className="text-slate-200">{selectedTicket.organizationName}</strong> | User:{' '}
                    {selectedTicket.userName} ({selectedTicket.userEmail})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>

              {/* Message History Bubble List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedTicket.messages.map((m) => {
                  const isAdmin = m.senderRole === 'ADMIN';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-500 mb-1 px-1 flex items-center gap-1">
                        <span className="font-bold text-slate-400">{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-lg text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official support response to customer..."
                  className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a ticket on the left to view conversation thread
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
