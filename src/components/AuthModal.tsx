import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { X, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import dataManager from '../lib/db';
import { SystemUserAccount } from '../types';
import { defaultSystemUsers } from '../lib/defaults';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SystemUserAccount[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (isOpen) {
      const activeUsers = defaultSystemUsers().filter(u => u.active);
      setUsers(activeUsers);
      if (activeUsers.length > 0 && !selectedUserId) {
        setSelectedUserId(activeUsers[0].id);
      }
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userToLogin = users.find(u => u.id === selectedUserId);

    if (!userToLogin) {
      setError('Please select a valid user.');
      setLoading(false);
      return;
    }

    if (userToLogin.pinOrPassword !== password) {
      setError('Invalid password for this account.');
      setLoading(false);
      return;
    }

    // Passwords match locally
    try {
      // Set the local session for UI/RBAC
      dataManager.setLocalActiveUser(userToLogin);

      // If Super Admin, attempt to login to Firebase for Cloud Sync
      if (userToLogin.role === 'superuser' && userToLogin.username === 'admin') {
        const finalEmail = 'admin@otec-reportcards.local';
        try {
          await signInWithEmailAndPassword(auth, finalEmail, password);
        } catch (err: any) {
          // If the admin firebase account doesn't exist yet, register it silently
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
            try {
              await createUserWithEmailAndPassword(auth, finalEmail, password);
            } catch (createErr) {
              console.warn("Failed to create cloud sync account", createErr);
            }
          }
        }
      }

      localStorage.removeItem('otec_manually_signed_out');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3">
              <UserIcon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              System Access
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select your role and enter your secure password.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select User Account</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all cursor-pointer appearance-none"
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/10 hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
