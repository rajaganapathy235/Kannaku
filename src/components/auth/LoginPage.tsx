import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
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
  initialEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToSignup,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-brand-600 selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <img
              src="/logo-horizontal-light.svg"
              alt="JustGST"
              className="w-auto object-contain shrink-0"
              style={{ height: '52px', minHeight: '48px' }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-2">
            Sign in to your Workspace
          </h2>
          <p className="text-xs text-slate-400">
            Access your company GST invoices, inventory ledger & customer balances
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Registered Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotPasswordOpen(true);
                    setResetSent(false);
                  }}
                  className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
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
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-medium">Keep me signed in</span>
              </label>

              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit Edge SSL</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
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

          {/* Optional Demo Credentials Toggle for Testing */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-400 flex items-center justify-between w-full transition-colors cursor-pointer py-1"
            >
              <span>Testing / Demo Accounts</span>
              <span className="text-[10px] text-brand-400 font-mono">
                {showQuickFill ? 'Hide' : 'Show'}
              </span>
            </button>

            {showQuickFill && (
              <div className="pt-2 space-y-2 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setEmail('rajaganapathy235@gmail.com');
                      setPassword('');
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/50 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-brand-400 truncate flex items-center justify-between">
                      <span>SuperAdmin Portal</span>
                      <Sparkles className="w-3 h-3 text-brand-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                      <span className="text-brand-400 font-mono font-bold">rajaganapathy235@gmail.com</span>
                      <span className="text-[9px] text-brand-400 font-mono">Fill Email</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setEmail('hytexcottonmills@gmail.com');
                      setPassword('');
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-brand-400 truncate flex items-center justify-between">
                      <span>HYTEX COTTON MILLS</span>
                      <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                      <span className="text-emerald-400 font-mono">hytexcottonmills@gmail.com</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Fill Email</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signup Redirect Footer */}
        <div className="text-center text-xs text-slate-400 space-y-2">
          <div>
            Don't have a business workspace yet?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-brand-400 hover:text-brand-300 font-bold underline underline-offset-4 cursor-pointer"
            >
              Start 14-Day Free Pro Trial
            </button>
          </div>
          <div className="text-[11px] text-slate-500">
            Compliant with Indian GST & E-Invoicing Rules • Cloudflare Edge Certified
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Receive OTP reset verification link</p>
              </div>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password Reset Link Dispatched!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  We have sent instructions and OTP to <strong>{forgotEmail}</strong>. Follow the link to choose a new password.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
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
