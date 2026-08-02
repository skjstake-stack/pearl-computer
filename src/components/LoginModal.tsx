import React, { useState } from 'react';
import { X, User, Lock, BookOpen, Award, ShieldAlert, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: 'student' | 'faculty' | 'admin' | 'center';
  onLoginSuccess: (user: UserSession, studentDetails?: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  portalType,
  onLoginSuccess
}) => {
  const [activePortal, setActivePortal] = useState<'student' | 'faculty' | 'admin' | 'center'>(portalType);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetContact, setResetContact] = useState('');
  const [resetOtpInput, setResetOtpInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showCaptcha && !captchaChecked) {
      setErrorMsg('Please complete the CAPTCHA verification check.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password: password.trim(),
          role: activePortal
        })
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user, data.studentDetails);
        onClose();
      } else {
        setErrorMsg(data.message || 'Login failed. Please check credentials.');
        if (data.requireCaptcha) {
          setShowCaptcha(true);
        }
      }
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (type: 'student' | 'faculty' | 'admin' | 'center') => {
    setActivePortal(type);
    if (type === 'student') {
      setUsernameOrEmail('STU-2026-101');
      setPassword('Pass@2026#Rahul');
    } else if (type === 'faculty') {
      setUsernameOrEmail('rksharma');
      setPassword('Pass@2026');
    } else if (type === 'center') {
      setUsernameOrEmail('CTR-101');
      setPassword('CenterPass@2026');
    } else {
      setUsernameOrEmail('admin');
      setPassword('Admin@12345');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetContact.trim()) return;
    setResetError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/faculty/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: resetContact.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSimulatedOtp(data.simulatedOtp || '123456');
        setResetStep('verify');
        setResetSuccess(data.message);
      } else {
        setResetError(data.message || 'Account not found.');
      }
    } catch (err) {
      setResetError('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtpInput || !newResetPassword) return;
    setResetError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/faculty/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: resetContact.trim(),
          otp: resetOtpInput.trim(),
          newPassword: newResetPassword.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setResetSuccess('Password reset successfully! Please log in with your new password.');
        setTimeout(() => {
          setShowForgot(false);
          setResetStep('request');
          setResetSuccess('');
        }, 2000);
      } else {
        setResetError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setResetError('Network error during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-orange-400" />
            <div>
              <h3 className="text-xl font-bold">Portal Authentication</h3>
              <p className="text-xs text-blue-200">Pearl Computer & Target Academy</p>
            </div>
          </div>

          {/* Portal Tabs */}
          <div className="mt-4 grid grid-cols-4 gap-1 bg-blue-950/60 p-1 rounded-xl text-[10px] font-semibold text-center">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                activePortal === 'student' ? 'bg-orange-500 text-white font-bold' : 'text-blue-300 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('center')}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                activePortal === 'center' ? 'bg-orange-500 text-white font-bold' : 'text-blue-300 hover:text-white'
              }`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('faculty')}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                activePortal === 'faculty' ? 'bg-orange-500 text-white font-bold' : 'text-blue-300 hover:text-white'
              }`}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                activePortal === 'admin' ? 'bg-orange-500 text-white font-bold' : 'text-blue-300 hover:text-white'
              }`}
            >
              Director
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {!showForgot ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {showCaptcha && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-[11px]">
                      Security Check Required (Multiple Failed Attempts)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={captchaChecked}
                      onChange={(e) => setCaptchaChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>I am not a robot (CAPTCHA Verified)</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {activePortal === 'student'
                    ? 'Student ID / Registration No / Mobile / Username'
                    : activePortal === 'center'
                    ? 'Center ID / Username / Registered Email / Mobile'
                    : activePortal === 'faculty'
                    ? 'Faculty Employee ID / Email / Username'
                    : 'Director Username / Email'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Enter login identifier..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setResetStep('request');
                      setResetError('');
                      setResetSuccess('');
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                {isSubmitting
                  ? 'Authenticating...'
                  : activePortal === 'admin'
                  ? 'Log In to Director Portal'
                  : `Log In to ${activePortal.toUpperCase()} Portal`}
              </button>


            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b pb-2">
                <KeyRound className="w-5 h-5 text-orange-500" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Reset Account Password</h4>
                  <p className="text-[11px] text-slate-500">Secure OTP verification & password update</p>
                </div>
              </div>

              {resetError && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium">
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-medium">
                  {resetSuccess}
                </div>
              )}

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">
                    Enter your registered <strong>Email Address</strong>, <strong>Mobile Number</strong>, or <strong>Username</strong>:
                  </p>
                  <input
                    type="text"
                    required
                    value={resetContact}
                    onChange={(e) => setResetContact(e.target.value)}
                    placeholder="Registered Email / Mobile / Username..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Sending OTP...' : 'Send Password Reset OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-[11px] text-blue-800 dark:text-blue-200 font-mono">
                    Test OTP Verification Code: <strong>{simulatedOtp}</strong>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetOtpInput}
                      onChange={(e) => setResetOtpInput(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">New Secure Password</label>
                    <input
                      type="password"
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Min 8 chars (1 Upper, 1 Lower, 1 Num, 1 Spec)"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                    />
                    {/* Password Rules Checklist */}
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                      <span className={newResetPassword.length >= 8 ? 'text-emerald-600 font-bold' : ''}>
                        • Min 8 Characters
                      </span>
                      <span className={/[A-Z]/.test(newResetPassword) ? 'text-emerald-600 font-bold' : ''}>
                        • 1 Uppercase (A-Z)
                      </span>
                      <span className={/[a-z]/.test(newResetPassword) ? 'text-emerald-600 font-bold' : ''}>
                        • 1 Lowercase (a-z)
                      </span>
                      <span className={/[0-9]/.test(newResetPassword) ? 'text-emerald-600 font-bold' : ''}>
                        • 1 Number (0-9)
                      </span>
                      <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newResetPassword) ? 'text-emerald-600 font-bold' : ''}>
                        • 1 Special Symbol
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Updating Password...' : 'Verify OTP & Reset Password'}
                  </button>
                </form>
              )}

              <div className="flex justify-between items-center pt-2 border-t text-[11px]">
                {resetStep === 'verify' && (
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-blue-600 underline font-semibold"
                  >
                    ← Resend OTP
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setResetStep('request');
                    setResetError('');
                  }}
                  className="text-slate-500 hover:underline ml-auto"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
