import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '../firebase';
import { getBusinessSettings, saveBusinessSettings } from '../services/db';
import { IMAGES, resolveImageUrl } from '../assets/images';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
  logoUrl?: string;
}

function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in a few minutes.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Authentication settings.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing sign-in.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication settings.';
    default:
      return 'Authentication failed. Please check your credentials and try again.';
  }
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToSite,
  logoUrl,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password view state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // In-app password reset (when returning from email reset link with oobCode)
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [resetAccountEmail, setResetAccountEmail] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (mode === 'resetPassword' && oobCode && auth) {
      setIsForgotMode(true);
      verifyPasswordResetCode(auth, oobCode)
        .then((verifiedEmail) => {
          setResetOobCode(oobCode);
          setResetAccountEmail(verifiedEmail);
          setEmail(verifiedEmail);
        })
        .catch(() => {
          setErrorMsg('This password reset link is invalid or has expired. Please request a new one.');
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (!auth) {
      setErrorMsg('Firebase Authentication is not configured. Please add VITE_FIREBASE_* environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);

      try {
        const currentSettings = await getBusinessSettings();
        await saveBusinessSettings({
          ...currentSettings,
          ownerEmail: email.trim(),
          ownerPassword: password,
        });
      } catch {
        // Non-fatal if local settings sync fails
      }

      setIsLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(mapFirebaseAuthError(err?.code || ''));
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recoveryEmail.trim()) {
      setErrorMsg('Please enter your owner email address.');
      return;
    }

    if (!auth) {
      setErrorMsg('Firebase Authentication is not configured.');
      return;
    }

    setIsLoading(true);
    try {
      const targetEmail = recoveryEmail.trim();
      try {
        await sendPasswordResetEmail(auth, targetEmail, {
          url: `${window.location.origin}/Admin`,
        });
      } catch {
        await sendPasswordResetEmail(auth, targetEmail);
      }

      try {
        const currentSettings = await getBusinessSettings();
        await saveBusinessSettings({
          ...currentSettings,
          ownerEmail: targetEmail,
        });
      } catch {
        // Non-fatal
      }

      setEmail(targetEmail);
      setIsLoading(false);
      setRecoverySent(true);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(mapFirebaseAuthError(err?.code || ''));
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetOobCode || !auth) return;
    if (newResetPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, resetOobCode, newResetPassword);

      try {
        const currentSettings = await getBusinessSettings();
        await saveBusinessSettings({
          ...currentSettings,
          ownerEmail: resetAccountEmail || currentSettings.ownerEmail,
          ownerPassword: newResetPassword,
        });
      } catch {
        // Non-fatal
      }

      setEmail(resetAccountEmail);
      setPassword(newResetPassword);
      setIsLoading(false);
      setResetCompleted(true);
      window.history.replaceState({}, '', '/Admin');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(mapFirebaseAuthError(err?.code || ''));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8F3EC] text-[#30231F] relative overflow-hidden font-sans selection:bg-[#B76E79]/20">
      {/* Luxury Champagne & Dusty-Rose Radial Glow Background Effects */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#B88746]/15 via-[#B76E79]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#B76E79]/15 via-[#B88746]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Top return link */}
        <div className="mb-6 text-center">
          <button
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#88766F] hover:text-[#B88746] transition-colors cursor-pointer group"
          >
            <span>← Return to Fazzy Nails Public Site</span>
          </button>
        </div>

        {/* Branded Card */}
        <div className="bg-[#FFFCF8] rounded-3xl p-8 sm:p-10 shadow-xl border border-[#E8D8C7] relative overflow-hidden">
          {/* Subtle gold top ribbon accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B88746] via-[#B76E79] to-[#B88746]" />

          {/* Logo & Lockup */}
          <div className="text-center space-y-3 mb-8">
            <div className="relative w-20 h-20 mx-auto rounded-full p-1 bg-[#F8F3EC] border-2 border-[#B88746] shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={resolveImageUrl(logoUrl || IMAGES.logo)}
                alt="Fazzy Nails Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8F3EC] border border-[#E8D8C7] rounded-full text-[11px] font-semibold text-[#B76E79]">
              <Sparkles className="w-3.5 h-3.5 text-[#B88746]" />
              <span>Owner Management Portal</span>
            </div>

            <h1 className="font-editorial text-3xl font-bold text-[#30231F] tracking-tight">
              {isForgotMode ? 'Password Recovery' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-[#88766F] font-medium">
              {isForgotMode
                ? 'Enter your owner email to receive a password reset link'
                : 'Your beauty business, beautifully managed.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium text-center">
              {errorMsg}
            </div>
          )}

          {isForgotMode ? (
            /* PASSWORD RECOVERY / IN-APP RESET FORM */
            resetCompleted ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                    Password Updated
                  </h3>
                  <p className="text-xs text-[#88766F] leading-relaxed">
                    Your password for <strong>{resetAccountEmail}</strong> has been updated and synced to your Admin Settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setResetCompleted(false);
                    setResetOobCode(null);
                    setErrorMsg('');
                  }}
                  className="w-full py-3 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-semibold rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  Continue to Owner Login
                </button>
              </div>
            ) : resetOobCode ? (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#30231F] mb-2">
                    Owner Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={resetAccountEmail}
                    className="w-full px-4 py-3 bg-[#F8F3EC]/70 border border-[#E8D8C7] rounded-2xl text-xs text-[#88766F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#30231F] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#88766F] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC] border border-[#E8D8C7] rounded-2xl text-xs text-[#30231F] focus:outline-none focus:ring-2 focus:ring-[#B88746] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#30231F] mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#88766F] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC] border border-[#E8D8C7] rounded-2xl text-xs text-[#30231F] focus:outline-none focus:ring-2 focus:ring-[#B88746] font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] text-xs font-semibold rounded-2xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            ) : recoverySent ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                    Recovery Email Sent
                  </h3>
                  <p className="text-xs text-[#88766F] leading-relaxed">
                    We sent password reset instructions to <strong>{recoveryEmail}</strong>. Check your inbox to set a new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setRecoverySent(false);
                    setErrorMsg('');
                  }}
                  className="w-full py-3 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-semibold rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  Return to Owner Login
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordRecovery} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#30231F] mb-2">
                    Owner Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#88766F] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="owner@fazzynails.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC] border border-[#E8D8C7] rounded-2xl text-xs text-[#30231F] focus:outline-none focus:ring-2 focus:ring-[#B88746]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setErrorMsg('');
                    }}
                    className="flex-1 py-3.5 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] text-xs font-semibold rounded-2xl transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] text-xs font-semibold rounded-2xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* OWNER LOGIN / SIGNUP FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#30231F] mb-2">
                  Owner Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#88766F] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="owner@fazzynails.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC] border border-[#E8D8C7] rounded-2xl text-xs text-[#30231F] focus:outline-none focus:ring-2 focus:ring-[#B88746]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#30231F]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-semibold text-[#B76E79] hover:text-[#B88746] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#88766F] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#F8F3EC] border border-[#E8D8C7] rounded-2xl text-xs text-[#30231F] focus:outline-none focus:ring-2 focus:ring-[#B88746] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#88766F] hover:text-[#30231F] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#88766F]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E8D8C7] text-[#B88746] focus:ring-[#B88746]"
                  />
                  <span>Keep me logged in on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#B88746] via-[#A07032] to-[#B88746] hover:opacity-95 text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Owner Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#FFFCF8]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Branding Note */}
          <div className="mt-8 pt-6 border-t border-[#E8D8C7]/60 text-center">
            <p className="text-[11px] text-[#88766F] flex items-center justify-center gap-1">
              <span>Fazzy Nails Management Portal</span>
              <Heart className="w-3 h-3 text-[#B76E79] fill-[#B76E79]" />
              <span>Pretty Nails ✦ Greater You</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
