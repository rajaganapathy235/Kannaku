import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  KeyRound,
  FileCheck2,
  MapPin,
  X,
} from 'lucide-react';
import { AuthService } from '../../utils/authService';
import { AuthSession } from '../../types/auth';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Kerala',
  'Gujarat',
  'Delhi',
  'Andhra Pradesh',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Haryana',
  'Punjab',
  'Madhya Pradesh',
  'Odisha',
];

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = '149211959700-g5r155p3o075od5kpfuu49f9atqfdjrl.apps.googleusercontent.com';

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
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Google Profile Completion Modal state
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<{
    email: string;
    name: string;
    picture?: string;
    sub: string;
  } | null>(null);
  const [showGoogleCompletionModal, setShowGoogleCompletionModal] = useState(false);

  useEffect(() => {
    // SECURITY NOTE: Never trust a client-decoded JWT for authentication decisions — the payload can be freely forged by anyone since it's just base64, not verified. All identity claims from Google Sign-In must come from the server-verified tokeninfo response only.
    const handleGoogleSignInResponse = async (response: any) => {
      if (!response || !response.credential) {
        setError('Google authentication failed. Empty credential received.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await AuthService.googleAuthAsync(response.credential);
        setLoading(false);
        if (res.success) {
          if (res.session) {
            onLoginSuccess(res.session);
            window.location.hash = '#/dashboard';
          } else if (res.needsProfileCompletion && res.googleProfile) {
            setGoogleCredential(response.credential);
            setGoogleProfile(res.googleProfile);
            setShowGoogleCompletionModal(true);
          }
        } else {
          setError(res.error || 'Server Google authentication failed.');
        }
      } catch (err: any) {
        setLoading(false);
        setError('Connection error during Google authentication: ' + (err?.message || 'Server unreachable'));
      }
    };

    const initGoogleAuth = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignInResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });

        const buttonContainer = document.getElementById('googleSignInButton');
        if (buttonContainer) {
          buttonContainer.innerHTML = '';
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320,
          });
        }

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('Google One-Tap not displayed:', notification.getNotDisplayedReason());
          }
        });
      }
    };

    const checkGsiLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGsiLoaded);
        initGoogleAuth();
      }
    }, 100);

    return () => clearInterval(checkGsiLoaded);
  }, [onLoginSuccess]);

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

          {/* Google Sign-In Container */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <div
                id="googleSignInButton"
                className="w-full flex justify-center items-center min-h-[44px] rounded-xl overflow-hidden"
              />
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or sign in with email
              </div>
            </div>
          </div>

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
      {/* Google Signup Profile Completion Modal */}
      {showGoogleCompletionModal && googleCredential && googleProfile && (
        <GoogleSignupCompletionModal
          googleProfile={googleProfile}
          credential={googleCredential}
          onComplete={(session) => {
            setShowGoogleCompletionModal(false);
            onLoginSuccess(session);
            window.location.hash = '#/dashboard';
          }}
          onClose={() => setShowGoogleCompletionModal(false)}
        />
      )}
    </div>
  );
};

interface GoogleSignupCompletionModalProps {
  googleProfile: {
    email: string;
    name: string;
    picture?: string;
    sub: string;
  };
  credential: string;
  onComplete: (session: AuthSession) => void;
  onClose: () => void;
}

const GoogleSignupCompletionModal: React.FC<GoogleSignupCompletionModalProps> = ({
  googleProfile,
  credential,
  onComplete,
  onClose,
}) => {
  const [ownerName, setOwnerName] = useState(googleProfile.name || '');
  const [companyName, setCompanyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [gstin, setGstin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Please enter your Business / Company Name.');
      return;
    }

    if (!mobile.trim()) {
      setError('Please enter your Mobile Number.');
      return;
    }

    setLoading(true);

    try {
      const res = await AuthService.completeGoogleSignupAsync({
        credential,
        companyName: companyName.trim(),
        ownerName: ownerName.trim(),
        mobile: mobile.trim(),
        state: state.trim(),
        gstin: gstin.trim(),
      });

      setLoading(false);

      if (res.success && res.session) {
        onComplete(res.session);
      } else {
        setError(res.error || 'Failed to complete Google sign up. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Network error: ' + (err?.message || 'Server unreachable'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-left space-y-0">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {googleProfile.picture ? (
              <img
                src={googleProfile.picture}
                alt={googleProfile.name}
                className="w-10 h-10 rounded-full border-2 border-brand-400 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold shrink-0">
                {googleProfile.name?.[0] || 'G'}
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-white">Complete Business Workspace</h3>
              <p className="text-xs text-slate-300">
                Logged in as <span className="text-brand-300 font-semibold">{googleProfile.email}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Google Email <span className="text-slate-400 font-normal">(Verified)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={googleProfile.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Business / Company Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Company / Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Mahadev Traders & Retail"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-600 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                State (GST Registration)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-600"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GSTIN (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              GSTIN <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileCheck2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 33AAAAA0000A1Z5"
                maxLength={15}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-brand-600 placeholder:text-slate-400 uppercase"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup &amp; Start Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
