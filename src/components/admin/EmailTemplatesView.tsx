import React, { useState } from 'react';
import { Mail, Edit, Eye, Send, Check, Copy } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { EmailTemplate } from '../../types/admin';

export const EmailTemplatesView: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(SaaSAdminDB.getEmailTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0] || null);
  const [subject, setSubject] = useState(templates[0]?.subject || '');
  const [body, setBody] = useState(templates[0]?.bodyHtml || '');
  const [testEmail, setTestEmail] = useState('admin@kannaku.in');
  const [testSent, setTestSent] = useState(false);

  const handleSelectTemplate = (t: EmailTemplate) => {
    setSelectedTemplate(t);
    setSubject(t.subject);
    setBody(t.bodyHtml);
    setTestSent(false);
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    const updated: EmailTemplate = {
      ...selectedTemplate,
      subject,
      bodyHtml: body,
      lastEdited: new Date().toISOString(),
    };
    SaaSAdminDB.saveEmailTemplate(updated);
    SaaSAdminDB.logAction('UPDATE_EMAIL_TEMPLATE', 'SETTING', updated.id, updated.name, {
      newVal: `Subject: ${subject}`,
    });
    setTemplates(SaaSAdminDB.getEmailTemplates());
    alert(`Template "${updated.name}" saved successfully.`);
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand-400" />
            <span>Automated Email Notification Templates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated transactional email copy, merge variables, and payment notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Template List */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5 h-fit">
          <div className="text-[11px] font-extrabold uppercase text-slate-400 px-3 py-1">
            System Templates ({templates.length})
          </div>
          {templates.map((t) => {
            const isSelected = selectedTemplate?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-950'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="text-xs">{t.name}</div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isSelected ? 'text-brand-200' : 'text-slate-500'
                  }`}
                >
                  {t.subject}
                </div>
              </div>
            );
          })}
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          {selectedTemplate && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedTemplate.name}</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Available Variables:{' '}
                    {selectedTemplate.variables.map((v) => (
                      <span
                        key={v}
                        className="inline-block font-mono bg-slate-900 text-brand-400 px-1.5 py-0.2 rounded border border-slate-800 mr-1"
                      >
                        {v}
                      </span>
                    ))}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-900/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Template</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Email Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Email Body (Markdown / Text)</label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono leading-relaxed focus:outline-none"
                />
              </div>

              {/* Test Sender Bar */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full bg-transparent text-white focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSent ? 'Dispatched!' : 'Send Test'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
