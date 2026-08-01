'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Publications', href: '/admin/publications', icon: '📚' },
    { label: 'Foreign Visits', href: '/admin/foreign-visits', icon: '✈️' },
    { label: 'Event Organizers', href: '/admin/organizers', icon: '🎪' },
    { label: 'Resume Management', href: '/admin/resumes', icon: '📄' },
    { label: 'View Live Site', href: '/', icon: '🌐' }
  ];

  return (
    <>
      {/* Mobile Header / Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#000033] text-white p-4 sticky top-0 z-50 border-b border-white/10 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <span className="font-bold tracking-wider text-[#ffc107] text-lg">Periyar Admin</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-[#ffc107] bg-transparent border-none p-2 cursor-pointer focus:outline-none transition-colors text-2xl"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Responsive Drawer on Mobile, Sticky Column on Desktop) */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#000033] to-[#04041a] text-white p-6 z-50 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        md:sticky md:top-0 md:h-screen md:flex md:flex-col transition-transform duration-300 ease-in-out flex-shrink-0 shadow-2xl border-r border-white/5
      `}>
        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffc107] to-[#e0a800] flex items-center justify-center text-xl shadow-lg shadow-[#ffc107]/20">
            🏛️
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wide m-0 text-white">Periyar University</h2>
            <span className="text-xs text-[#ffc107] font-semibold tracking-wider uppercase">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1">
          <ul className="list-none p-0 m-0 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl no-underline font-semibold transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#ffc107]/20 to-[#ffc107]/5 text-[#ffc107] border-l-4 border-[#ffc107] pl-3 shadow-md shadow-black/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile/System Footer */}
        <div className="mt-auto border-t border-white/10 pt-5 flex flex-col gap-4 bg-black/20 -mx-6 -mb-6 p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-600 flex items-center justify-center font-bold text-sm text-white">
              A
            </div>
            <div>
              <p className="m-0 text-xs font-bold text-gray-200">Admin</p>
              <p className="m-0 text-[10px] text-gray-400">PUdeptadmin</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                await fetch(`${apiUrl}/admin/logout`, { method: 'POST' });
              } catch (err) {
                console.error("Logout request failed:", err);
              }
              localStorage.removeItem('PU_DEPT_ADMIN_AUTHED');
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 font-bold border border-rose-600/20 hover:border-rose-600/40 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

