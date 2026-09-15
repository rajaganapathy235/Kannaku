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
  Loader2,
  Send,
} from 'lucide-react';
import { AuthService } from '../../utils/authService';
import { ApiService } from '../../utils/apiService';
import { AuthSession } from '../../types/auth';
import { INDIAN_STATES as ALL_INDIAN_STATES } from '../../utils/gstValidation';

// Full list of all Indian states & UTs, sourced from the single authoritative
// list in gstValidation.ts (used for GST state-code validation) — do not
// maintain a separate, potentially-incomplete copy here.
const INDIAN_STATES = ALL_INDIAN_STATES.map((s) => s.name);

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
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'success'>('request');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleOpenForgotPassword = (prefillEmail?: string) => {
    setForgotEmail(prefillEmail || email || '');
    setForgotStep('request');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotSuccessMsg(null);
    setDevOtpHint(null);
    setForgotPasswordOpen(true);
  };

  const handleSendResetEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccessMsg(null);

    try {
      const res = await ApiService.requestForgotPassword(forgotEmail);
      if (res.success) {
        setForgotStep('verify');
        setForgotSuccessMsg(res.data?.message || 'Password reset OTP code sent via Resend!');
        if (res.data?.devOtpHint) {
          setDevOtpHint(res.data.devOtpHint);
        }
      } else {
        setForgotError(res.error || 'Failed to send password reset email via Resend.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'An unexpected error occurred sending reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);

    if (!forgotOtp || forgotOtp.length < 4) {
      setForgotError('Please enter the verification OTP code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await ApiService.resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword,
      });

      if (res.success) {
        setForgotStep('success');
        setForgotSuccessMsg(res.data?.message || 'Password reset successfully!');
        setEmail(forgotEmail);
      } else {
        setForgotError(res.error || 'Invalid OTP code or reset failed.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'An unexpected error occurred during password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

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

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        (event.reason.name === 'NotAllowedError' ||
          (typeof event.reason.message === 'string' &&
            event.reason.message.includes('identity-credentials-get')))
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id) return;
      const buttonContainer = document.getElementById('googleSignInButton');
      if (!buttonContainer) return;

      const parentWidth =
        buttonContainer.parentElement?.clientWidth ||
        buttonContainer.clientWidth ||
        320;
      // Google GSI button width allowed range: 200px to 400px
      const calculatedWidth = Math.min(400, Math.max(200, Math.floor(parentWidth)));

      try {
        buttonContainer.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: calculatedWidth,
        });
      } catch (err) {
        console.warn('Failed to render Google button:', err);
      }
    };

    const initGoogleAuth = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignInResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });

          renderGoogleButton();

          // Only invoke One-Tap prompt if not running inside a nested cross-origin iframe
          const isIframe = window.self !== window.top;
          if (!isIframe) {
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed()) {
                console.log('Google One-Tap not displayed:', notification.getNotDisplayedReason());
              }
            });
          }
        } catch (err) {
          console.warn('Google Identity Services initialization notice:', err);
        }
      }
    };

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.google?.accounts?.id) {
          renderGoogleButton();
        }
      }, 200);
    };
    window.addEventListener('resize', handleResize);

    const checkGsiLoaded = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGsiLoaded);
        initGoogleAuth();
      }
    }, 100);

    return () => {
      clearInterval(checkGsiLoaded);
      clearTimeout(resizeTimer);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('resize', handleResize);
    };
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
            <div className="flex justify-center w-full">
              <div
                id="googleSignInButton"
                className="w-full flex justify-center items-center min-h-[44px] rounded-xl overflow-hidden [&>div]:max-w-full [&>div]:w-full [&_iframe]:max-w-full [&_iframe]:!w-full [&_iframe]:mx-auto"
              >
                {/* Fallback loader / styled button before GSI renders */}
                <button
                  type="button"
                  className="w-full max-w-[400px] h-11 px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-2xs hover:bg-slate-50 flex items-center justify-center gap-3 transition-all cursor-pointer font-medium text-xs text-slate-700"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
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
                  onClick={() => handleOpenForgotPassword(email)}
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

      {/* Forgot Password Modal (Resend Integration) */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md my-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Account Password</h3>
                  <p className="text-xs text-slate-500">
                    {forgotStep === 'request' && 'Send 6-digit verification code via Resend'}
                    {forgotStep === 'verify' && 'Verify OTP & set your new password'}
                    {forgotStep === 'success' && 'Password updated successfully'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {devOtpHint && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <span className="font-mono text-[11px]">Dev Test OTP Code: <strong>{devOtpHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setForgotOtp(devOtpHint)}
                  className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 rounded text-[10px] font-bold text-amber-900 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {forgotStep === 'request' && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will send a 6-digit password reset verification code to this email via <strong>Resend</strong> API.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending via Resend...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reset OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'verify' && (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-widest font-mono text-lg py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-300 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleSendResetEmail()}
                    disabled={forgotLoading}
                    className="text-xs text-brand-600 hover:text-brand-700 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Resend OTP Email
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 flex items-center gap-2 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Reset Password</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="py-4 space-y-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Password Changed!</h4>
                  <p className="text-xs text-slate-600">
                    Your password has been successfully updated. You can now sign in to your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-brand-600/20 transition-all"
                >
                  Back to Sign In
                </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-left space-y-0 max-h-[90vh] flex flex-col">
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
