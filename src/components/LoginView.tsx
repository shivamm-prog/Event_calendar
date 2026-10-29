import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import { AvenueOfService } from '../types/rotaract';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, signIn, signUp, quickLoginDemo } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let msg = err.message || 'Google sign-in was cancelled or encountered an error.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed before completing. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by browser. Please allow popups for this site.';
      }
      setErrorMsg(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUp(email.trim(), password, displayName.trim());
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/operation-not-allowed' || msg.includes('disabled')) {
        msg = 'Email/Password sign-in is not enabled in Firebase. Please click "Sign In with Google" above.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoNotice = async (role: 'core' | 'bod', avenue?: AvenueOfService) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await quickLoginDemo(role, avenue);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick sign-in requires Google authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#780000] p-4 sm:p-6 lg:p-8 selection:bg-white selection:text-[#780000]">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center text-white space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#780000] shadow-lg">
            <Award className="h-9 w-9 stroke-[2.5]" />
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-red-200">
            Rotaract Club of RSCOE · District 3131
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Event Management System
          </h1>
          <p className="text-xs sm:text-sm text-red-200 max-w-md mx-auto">
            Authorized team portal for Core Team members & Board of Directors (BOD).
          </p>
        </div>

        {/* Login Card (Pure White) */}
        <div className="rounded-2xl border-2 border-red-300 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-gray-100 pb-4 text-center sm:text-left">
            <h2 className="text-xl font-extrabold text-gray-900">
              Club Member Sign In
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Authenticate with your Google account to access club events and avenue schedules.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#800000] mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {errorMsg.includes('Google') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="font-bold underline text-[#800000] hover:text-[#550000]"
                    >
                      Click here to Sign In with Google
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary Action: Google Sign In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-3.5 px-4 text-sm font-extrabold text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-md transition-all disabled:opacity-50"
            >
              {/* Google SVG Icon */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
              <span>{googleLoading ? 'Signing in with Google...' : 'Sign In with Google Account'}</span>
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/60 p-3 text-xs text-gray-700">
              <ShieldCheck className="h-4 w-4 text-[#800000] shrink-0" />
              <span>
                Pre-configured Firebase authentication. The initial signed-in user or designated administrator is automatically granted Core Team privileges.
              </span>
            </div>
          </div>

          {/* Collapsible Email/Password option */}
          <div className="border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(!showEmailForm);
                setErrorMsg(null);
              }}
              className="text-xs font-bold text-gray-600 hover:text-[#800000] flex items-center justify-between w-full"
            >
              <span>{showEmailForm ? 'Hide Email & Password Form' : 'Or Sign in using Email & Password'}</span>
              <span className="text-[11px] underline">
                {showEmailForm ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {showEmailForm && (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-gray-700">
                    {isRegisterMode ? 'New Account Registration' : 'Club Credentials'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setErrorMsg(null);
                    }}
                    className="font-bold text-[#800000] hover:underline"
                  >
                    {isRegisterMode ? 'Already have an account? Sign in' : 'Create new account'}
                  </button>
                </div>

                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
                      Full Name <span className="text-[#800000]">*</span>
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Rtr. Ananya Joshi"
                        className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
                    Club Email Address <span className="text-[#800000]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@rscoe.ac.in or club@rscoe.org"
                      className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
                    Password <span className="text-[#800000]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#800000] py-3 text-sm font-bold text-white hover:bg-[#660000] shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="border-t border-gray-100 pt-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                Role Verification & Testing Note
              </span>
              <p className="text-xs text-gray-500 mb-3">
                Clicking Google Sign-In above connects you to the live Cloud Firestore database:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoNotice('core')}
                disabled={loading}
                className="flex items-center gap-2.5 rounded-xl border-2 border-red-300 bg-red-50/80 p-3 text-left hover:border-[#800000] hover:bg-red-100/70 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#800000] text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 block">
                    Core Team Admin
                  </span>
                  <span className="text-[11px] text-[#800000] font-medium block">
                    Manage all 7 avenues
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoNotice('bod', 'Community Service')}
                disabled={loading}
                className="flex items-center gap-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 p-3 text-left hover:border-[#800000] hover:bg-red-50/50 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-white">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 block">
                    BOD Director
                  </span>
                  <span className="text-[11px] text-gray-600 font-medium block">
                    Assigned: Community Service
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* College footer note */}
        <div className="text-center text-xs text-red-200">
          JSPM's Rajarshi Shahu College of Engineering, Tathawade, Pune · R.I. District 3131
        </div>
      </div>
    </div>
  );
};
