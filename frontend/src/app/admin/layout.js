'use client';

import React, { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated via cookies
    const checkAuth = async () => {
      const authedHint = localStorage.getItem('PU_DEPT_ADMIN_AUTHED');
      if (authedHint === 'true') {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
          let res = await fetch(`${apiUrl}/admin/me`);
          
          // Silent Refresh Flow: if 401, attempt token rotation using the secure refresh cookie
          if (res.status === 401) {
            const refreshRes = await fetch(`${apiUrl}/admin/refresh`, {
              method: 'POST'
            });
            if (refreshRes.ok) {
              res = await fetch(`${apiUrl}/admin/me`);
            }
          }

          if (res.ok) {
            setIsAuthed(true);
            localStorage.setItem('PU_DEPT_ADMIN_AUTHED', 'true');
          } else {
            localStorage.removeItem('PU_DEPT_ADMIN_AUTHED');
            setIsAuthed(false);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          setIsAuthed(false);
        }
      } else {
        setIsAuthed(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });
      if (res.ok) {
        // Auth success: the backend sets HttpOnly cookies. Store only a boolean indicator, NOT the token!
        localStorage.setItem('PU_DEPT_ADMIN_AUTHED', 'true');
        setIsAuthed(true);
        setError('');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError('Connection to security server failed. Please ensure the backend is running.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#000033] rounded-full"></div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000033] via-[#04041a] to-[#990033] px-4 font-sans">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10">
          
          {/* Emblem & Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffc107] to-[#e0a800] flex items-center justify-center text-3xl shadow-lg shadow-[#ffc107]/20 mx-auto mb-4">
              🏛️
            </div>
            <h2 className="text-[#000033] text-2xl font-black tracking-tight m-0">Periyar University</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1 m-0">Admin Portal Sign-In</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xs">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Username</label>
              <input
                type="text"
                className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold bg-slate-50/50"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold bg-slate-50/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-[#000033] hover:bg-[#0b0b47] text-[#ffc107] font-extrabold rounded-2xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer transition-all text-sm tracking-wide border-none"
              >
                Sign In
              </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
