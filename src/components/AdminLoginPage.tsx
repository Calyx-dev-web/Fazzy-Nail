import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import { IMAGES } from '../assets/images';
import { getBusinessSettings, resetAdminCredentials } from '../services/db';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToSite,
}) => {
  const [email, setEmail] = useState('owner@fazzynails.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password view state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const settings = await getBusinessSettings();
      const expectedEmail = (settings.ownerEmail || 'owner@fazzynails.com').trim().toLowerCase();
      const expectedPassword = settings.ownerPassword || 'admin';

      if (email.trim().toLowerCase() === expectedEmail && password === expectedPassword) {
        sessionStorage.setItem('fzn_owner_auth', 'true');
        sessionStorage.setItem('fzn_owner_email', email.trim());
        if (rememberMe) {
          localStorage.setItem('fzn_owner_auth_remember', 'true');
        }
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Invalid owner email or password. Please check your credentials.');
      }
    } catch {
      // Fallback
      if (password === 'admin') {
        sessionStorage.setItem('fzn_owner_auth', 'true');
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Invalid password.');
      }
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetAdminCredentials();
    setEmail('owner@fazzynails.com');
    setPassword('');
    setRecoverySent(true);
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
                src={IMAGES.logo}
                alt="Fazzy Nails Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8F3EC] border border-[#E8D8C7] rounded-full text-[11px] font-semibold text-[#B76E79]">
              <Sparkles className="w-3.5 h-3.5 text-[#B88746]" />
              <span>Owner Management Portal</span>
            </div>

            <h1 className="font-editorial text-3xl font-bold text-[#30231F] tracking-tight">
              {isForgotMode ? 'Reset Login Details' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-[#88766F] font-medium">
              {isForgotMode
                ? 'Reset your owner login credentials back to default'
                : 'Your beauty business, beautifully managed.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium text-center">
              {errorMsg}
            </div>
          )}

          {isForgotMode ? (
            /* PASSWORD RECOVERY FORM */
            recoverySent ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                    Login Details Reset
                  </h3>
                  <p className="text-xs text-[#88766F] leading-relaxed">
                    Your admin login has been reset to the default credentials:
                  </p>
                  <div className="p-3 bg-[#F8F3EC] border border-[#E8D8C7] rounded-2xl text-xs font-mono text-[#30231F] space-y-1">
                    <div>Email: <strong>owner@fazzynails.com</strong></div>
                    <div>Password: <strong>admin</strong></div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setRecoverySent(false);
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
                    onClick={() => setIsForgotMode(false)}
                    className="flex-1 py-3.5 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] text-xs font-semibold rounded-2xl transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] text-xs font-semibold rounded-2xl transition-colors cursor-pointer shadow-sm"
                  >
                    Reset to Default
                  </button>
                </div>
              </form>
            )
          ) : (
            /* OWNER LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-5">
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
                    onClick={() => setIsForgotMode(true)}
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
