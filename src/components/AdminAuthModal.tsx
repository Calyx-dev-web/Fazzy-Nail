import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, KeyRound, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { IMAGES } from '../assets/images';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [hasPasscode, setHasPasscode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedPin = localStorage.getItem('fzn_custom_admin_pin');
      setHasPasscode(!!savedPin && savedPin.trim().length > 0);
      setPin('');
      setNewPasscode('');
      setConfirmPasscode('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsResetMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const savedPin = localStorage.getItem('fzn_custom_admin_pin');

    if (!savedPin) {
      // First time setting passcode
      if (pin.trim().length < 4) {
        setErrorMsg('Passcode must be at least 4 characters long.');
        return;
      }
      localStorage.setItem('fzn_custom_admin_pin', pin.trim());
      sessionStorage.setItem('fzn_admin_auth', 'true');
      sessionStorage.setItem('fzn_admin_auth_time', new Date().toISOString());
      onAuthenticated();
      onClose();
      return;
    }

    if (pin.trim() === savedPin) {
      sessionStorage.setItem('fzn_admin_auth', 'true');
      sessionStorage.setItem('fzn_admin_auth_time', new Date().toISOString());
      onAuthenticated();
      onClose();
    } else {
      setErrorMsg('Incorrect administrator passcode. Please try again.');
    }
  };

  const handleSetNewPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPasscode.trim().length < 4) {
      setErrorMsg('New passcode must be at least 4 characters long.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setErrorMsg('Passcodes do not match. Please re-enter.');
      return;
    }

    localStorage.setItem('fzn_custom_admin_pin', newPasscode.trim());
    setHasPasscode(true);
    setSuccessMsg('Passcode updated successfully! You are now logged in.');

    setTimeout(() => {
      sessionStorage.setItem('fzn_admin_auth', 'true');
      sessionStorage.setItem('fzn_admin_auth_time', new Date().toISOString());
      onAuthenticated();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center space-y-2 mb-6">
          <div className="relative w-16 h-16 mx-auto rounded-full p-1 bg-stone-900 border-2 border-amber-300 shadow-md flex items-center justify-center overflow-hidden">
            <img
              src={IMAGES.logo}
              alt="Fazzynails Official Logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-rose-50 border border-rose-200 rounded-full text-[11px] font-semibold text-rose-950">
            <Shield className="w-3.5 h-3.5 text-rose-700" />
            <span>Salon Admin Portal</span>
          </div>

          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            Administrator Portal
          </h3>
          <p className="text-xs text-stone-500">
            {isResetMode
              ? 'Reset Administrator Passcode'
              : hasPasscode
              ? 'Enter your security passcode to unlock dashboard'
              : 'Create your administrator passcode to secure your dashboard'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {isResetMode ? (
          /* RESET PASSCODE FORM */
          <form onSubmit={handleSetNewPasscode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Passcode (min 4 characters)
              </label>
              <input
                type="password"
                required
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new admin passcode"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-center text-lg font-mono tracking-widest text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm New Passcode
              </label>
              <input
                type="password"
                required
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Re-enter new admin passcode"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-center text-lg font-mono tracking-widest text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setErrorMsg('');
                }}
                className="flex-1 py-3 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                Back to Login
              </button>

              <button
                type="submit"
                className="flex-2 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Save & Continue
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-700" />
                  <span>{hasPasscode ? 'Admin Passcode' : 'Create Admin Passcode'}</span>
                </span>
                {hasPasscode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer transition-colors"
                  >
                    Reset Passcode?
                  </button>
                )}
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={hasPasscode ? 'Enter admin passcode' : 'Set a new admin passcode'}
                  className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-300 rounded-xl text-center text-lg font-mono tracking-widest text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!pin.trim()}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-rose-300" />
              <span>{hasPasscode ? 'Login to Dashboard' : 'Save Passcode & Login'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
