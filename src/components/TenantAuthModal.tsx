import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Building2, Mail, Lock, AlertCircle, Server, Cloud } from 'lucide-react';
import dataManager from '../lib/db';

export default function TenantAuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncBackend, setSyncBackend] = useState<'firebase' | 'custom'>(
    (localStorage.getItem('otec_sync_backend') as 'firebase' | 'custom') || 'firebase'
  );
  const [customServerUrl, setCustomServerUrl] = useState(
    localStorage.getItem('otec_custom_server_url') || 'http://localhost:5555'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (syncBackend === 'firebase') {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      } else {
        // Custom LAN Server authentication
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const res = await fetch(`${customServerUrl.replace(/\/$/, '')}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to connect to Custom Server');
        
        // Save the mock user token and settings
        localStorage.setItem('otec_custom_user', JSON.stringify(data.user));
      }
      
      localStorage.setItem('otec_sync_backend', syncBackend);
      if (syncBackend === 'custom') {
        localStorage.setItem('otec_custom_server_url', customServerUrl);
      }
      
      localStorage.removeItem('otec_manually_signed_out');
      localStorage.removeItem('otec_offline_only_mode');
      
      // Force a full page reload so db.ts re-initializes with the new user session
      window.location.reload();
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid school credentials. Please check your email and password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('A school is already registered with this email address.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    localStorage.setItem('otec_offline_only_mode', 'true');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-inner">
              <Building2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'School Login' : 'Register School'}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {isLogin 
                ? 'Connect this computer to your cloud database.' 
                : 'Create a new secure cloud database for your school.'}
            </p>
          </div>

          <div className="mb-6 bg-slate-50 p-1.5 rounded-xl flex gap-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setSyncBackend('firebase')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                syncBackend === 'firebase'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Cloud size={14} /> Firebase (Cloud)
            </button>
            <button
              type="button"
              onClick={() => setSyncBackend('custom')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                syncBackend === 'custom'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Server size={14} /> Custom LAN Server
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {syncBackend === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Custom Server URL</label>
                <div className="relative">
                  <Server size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    required
                    placeholder="http://192.168.1.50:5555"
                    value={customServerUrl}
                    onChange={e => setCustomServerUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-indigo-50/30 border border-indigo-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@school.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${syncBackend === 'custom' ? 'focus:ring-indigo-600' : 'focus:ring-blue-600'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Secure Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${syncBackend === 'custom' ? 'focus:ring-indigo-600' : 'focus:ring-blue-600'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-sm ${syncBackend === 'custom' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Connecting...' : isLogin ? 'Connect to Cloud' : 'Create Database'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Register your school" : 'Already registered? Log in'}
            </button>
            
            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleOfflineMode}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                Continue in Local Offline Mode (No Cloud Sync)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
