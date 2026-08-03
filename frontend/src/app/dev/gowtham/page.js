'use client';

import React from 'react';
import Link from 'next/link';

export default function GowthamDevPage() {
  const skills = [
    'React Js',
    'Tailwind CSS',
    'Mongo Database',
    'MySQL Database',
    'Python',
    'Node Js',
    'Docker',
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ebf1f7] via-[#f3f6fb] to-[#e8eef5] flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Developer Card Container */}
      <div className="w-full max-w-[820px] bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/80 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight m-0 uppercase">
            G GOWTHAM
          </h1>
          <p className="text-sm md:text-base font-semibold text-slate-500 mt-1.5 m-0">
            Master of Computer Application
          </p>
        </div>

        {/* Card Content Grid */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          
          {/* Left Side: Developer Photo */}
          <div className="w-full md:w-auto flex justify-center shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <img
                src="/gowtham.jpg"
                alt="G Gowtham"
                className="relative w-[220px] sm:w-[240px] md:w-[250px] h-[280px] sm:h-[300px] md:h-[310px] object-cover rounded-2xl shadow-md border border-slate-100/80"
              />
            </div>
          </div>

          {/* Right Side: Details & Contact Links */}
          <div className="flex-1 w-full flex flex-col justify-between">
            
            <div>
              {/* Role Badge */}
              <div className="mb-4">
                <span className="inline-block bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs">
                  FULL-STACK DEVELOPER
                </span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] text-[12px] font-semibold px-3 py-1 rounded-xl shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Details List */}
            <div className="space-y-3">
              
              {/* Email Card */}
              <a
                href="mailto:gowtham114411@gmail.com"
                className="flex items-center gap-3.5 p-3 md:p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white/70 hover:bg-blue-50/30 transition-all group no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-widest leading-none mb-1">
                    EMAIL ADDRESS
                  </span>
                  <span className="text-xs md:text-sm font-bold text-slate-800 truncate block">
                    gowtham114411@gmail.com
                  </span>
                </div>
              </a>

              {/* Phone Card */}
              <a
                href="tel:+919344232465"
                className="flex items-center gap-3.5 p-3 md:p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white/70 hover:bg-blue-50/30 transition-all group no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-widest leading-none mb-1">
                    PHONE CONTACT
                  </span>
                  <span className="text-xs md:text-sm font-bold text-slate-800 truncate block">
                    +91 93442 32465
                  </span>
                </div>
              </a>

              {/* Vercel Portfolio Card */}
              <a
                href="https://itsgowtham.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3.5 p-3 md:p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white/70 hover:bg-blue-50/30 transition-all group no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" x2="22" y1="12" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-widest leading-none mb-1">
                    VERCEL PORTFOLIO
                  </span>
                  <span className="text-xs md:text-sm font-bold text-slate-800 truncate block">
                    itsgowtham.vercel.app
                  </span>
                </div>
              </a>

            </div>

          </div>

        </div>

        {/* Card Footer: Back to Portal Button */}
        <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs no-underline active:scale-95"
          >
            ← Back to Portal
          </Link>
        </div>

      </div>

    </div>
  );
}
