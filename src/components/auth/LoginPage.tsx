import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  KeyRound,
  FileCheck2,
  Zap,
} from 'lucide-react';
import { AuthService } from '../../utils/authService';
import { AuthSession } from '../../types/auth';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
  onSwitchToSignup: () => void;
  onBackToHome?: () => void;
  initialEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToSignup,
  onBackToHome,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await AuthService.loginAsync({ email, password, rememberMe });
      setLoading(false);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setLoading(false);
      setError('Connection error. Please try again.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-900 font-sans antialiased selection:bg-brand-600 selection:text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full mx-auto space-y-6">
        {/* Optional Back to Homepage */}
        {onBackToHome && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to JustGST Home</span>
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <img
              src="/logo-horizontal.svg"
              alt="JustGST"
              className="w-auto object-contain shrink-0"
              style={{ height: '44px', minHeight: '40px' }}
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign in to your Workspace
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Access your company GST invoices, inventory ledger &amp; customer balances
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Registered Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotPasswordOpen(true);
                    setResetSent(false);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
              </label>

              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>256-bit Edge SSL</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill / Demo Accounts */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center justify-between w-full transition-colors cursor-pointer py-1"
            >
              <span>Testing / Demo Accounts</span>
              <span className="text-xs text-brand-600 font-bold font-mono">
                {showQuickFill ? 'Hide' : 'Show'}
              </span>
            </button>

            {showQuickFill && (
              <div className="pt-2 space-y-2 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setEmail('rajaganapathy235@gmail.com');
                      setPassword('');
                    }}
                    className="p-3 bg-slate-50 hover:bg-brand-50/60 border border-slate-200 hover:border-brand-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-brand-700 truncate flex items-center justify-between">
                      <span>SuperAdmin Portal</span>
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span className="text-brand-600 font-mono font-medium truncate mr-1">rajaganapathy235@gmail.com</span>
                      <span className="text-[10px] text-brand-700 font-semibold shrink-0">Fill</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setEmail('hytexcottonmills@gmail.com');
                      setPassword('');
                    }}
                    className="p-3 bg-slate-50 hover:bg-brand-50/60 border border-slate-200 hover:border-brand-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-brand-700 truncate flex items-center justify-between">
                      <span>HYTEX COTTON MILLS</span>
                      <Zap className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span className="text-brand-600 font-mono font-medium truncate mr-1">hytexcottonmills@gmail.com</span>
                      <span className="text-[10px] text-brand-700 font-semibold shrink-0">Fill</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signup Redirect Footer */}
        <div className="text-center text-xs text-slate-600 space-y-2">
          <div>
            Don't have a business workspace yet?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-brand-600 hover:text-brand-700 font-bold underline underline-offset-4 cursor-pointer"
            >
              Start 14-Day Free Pro Trial
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Compliant with Indian GST &amp; E-Invoicing Rules • Cloudflare Edge Certified
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Account Password</h3>
                <p className="text-xs text-slate-500">Receive OTP reset verification link</p>
              </div>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Password Reset Link Dispatched!</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  We have sent instructions and OTP to <strong>{forgotEmail}</strong>. Follow the link to choose a new password.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

