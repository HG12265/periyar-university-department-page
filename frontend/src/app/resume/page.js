'use client';

import React, { useState } from 'react';
import Topbar from '@/components/Topbar';
import MainHeader from '@/components/MainHeader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FacultyProfileModal from '@/components/FacultyProfileModal';
import { ToastProvider, useToast } from '@/components/ToastContext';

function ResumePortalContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedFaculty, setVerifiedFaculty] = useState(null);
  const { showToast } = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter an email address.', 'warning');
      return;
    }

    setLoading(true);
    setError('');
    setVerifiedFaculty(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/resume/verify-email?email=${encodeURIComponent(email.trim())}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast('✓ Email verified successfully! Loading profile...');
        
        // Construct faculty object structure expected by FacultyProfileModal
        const facultyObj = {
          id: data.faculty_id,
          name: data.name,
          designation: data.designation,
          email: data.email,
          image_url: data.resume?.generated_resume_json?.personal?.image_url || '',
          specialization: data.resume?.generated_resume_json?.skills?.join(', ') || ''
        };
        
        setVerifiedFaculty(facultyObj);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || 'No faculty record found with the official email address.';
        setError(errMsg);
        showToast(errMsg, 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the verification server.');
      showToast('Error connecting to backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Topbar />
      <MainHeader />
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
          {/* Top colored accent line */}
          <div className="absolute top-0 inset-x-0 h-2 bg-[#000066]" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffc107] to-[#e0a800] flex items-center justify-center text-3xl shadow-lg shadow-[#ffc107]/20 mx-auto mb-4">
              📄
            </div>
            <h2 className="text-[#000066] text-2xl font-black tracking-tight m-0">Faculty Resume Portal</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1.5 m-0">Verification & Access Portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Official Email Address</label>
              <input
                type="email"
                placeholder="e.g. name@periyaruniversity.ac.in"
                className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold bg-slate-50/50 text-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-relaxed">
                Provide your registered university email to load and download your generated resume document.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#990033] hover:bg-[#80002a] text-white font-extrabold rounded-2xl shadow-lg shadow-red-950/10 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer transition-all text-sm tracking-wide border-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>Verify & Enter</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {verifiedFaculty && (
        <FacultyProfileModal
          faculty={verifiedFaculty}
          onClose={() => setVerifiedFaculty(null)}
        />
      )}
    </div>
  );
}

export default function ResumePortal() {
  return (
    <ToastProvider>
      <ResumePortalContent />
    </ToastProvider>
  );
}
