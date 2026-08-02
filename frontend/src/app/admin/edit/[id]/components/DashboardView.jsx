'use client';

import React from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function DashboardView() {
  const {
    categories,
    getItemCountText,
    setActiveCategory,
    setView,
    hasCustomManager,
    hasDynamicSection,
    hasCustomDataOnly,
    handleOpenSpecializedManager,
    toggleModuleSection
  } = useEditDepartment();

  const allAvailableModules = [
    { name: 'Placement', slug: 'placement', icon: '💼', description: 'Placement statistics & recruiter photo block' },
    { name: 'Alumni', slug: 'alumni', icon: '🎓', description: 'Alumni directory & meet events' },
    { name: 'Guest Faculty', slug: 'guest-faculty', icon: '👥', description: 'Guest faculty directory & profiles' },
    { name: 'Museum', slug: 'museum', icon: '🏛️', description: 'Department museum artifact gallery & info' },
    { name: 'Facilities', slug: 'facilities', icon: '🏢', description: 'Departmental lab & research infrastructure' },
    { name: 'Energy & Environment Park', slug: 'energy-environment-park', icon: '🌲', description: 'Environmental park equipment & photos' },
    { name: 'UGC-MRP Projects', slug: 'ugc-mrp', icon: '🛡️', description: 'UGC Major/Minor Research Projects' },
    { name: 'Best Practices', slug: 'best-practices', icon: '⭐', description: 'Departmental innovations & best practices' },
    { name: 'Student Projects', slug: 'student-project', icon: '📝', description: 'Student research & field projects' },
    { name: 'Finance Details', slug: 'finance-details', icon: '💵', description: 'Financial statements & fee details' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* ── 1. ACTIVE CATEGORIES GRID ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight m-0">Active Department Sections</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Manage content for active sub-navbar sections</p>
          </div>
          <span className="text-xs font-black bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
            {categories.length} Sections Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const countText = getItemCountText(cat.slug);
            const colorSchemes = {
              home: 'from-blue-500 to-indigo-600',
              programmes: 'from-teal-500 to-emerald-600',
              syllabus: 'from-purple-500 to-pink-600',
              faculty: 'from-sky-500 to-blue-600',
              activities: 'from-amber-500 to-orange-600',
              facilities: 'from-indigo-500 to-violet-600',
              projects: 'from-rose-500 to-red-600',
              alumni: 'from-emerald-500 to-teal-600',
              contact: 'from-[#000033] to-[#0b0b47]',
              pdf: 'from-cyan-500 to-blue-600',
              'ugc-mrp': 'from-indigo-600 to-indigo-800',
              journal: 'from-fuchsia-500 to-pink-600',
              conference: 'from-violet-500 to-purple-600',
              'visiting-faculty': 'from-emerald-500 to-green-600',
              'phd-awarded': 'from-yellow-500 to-amber-600',
              'former-faculty': 'from-slate-500 to-slate-700',
              'dst-faculty': 'from-rose-500 to-rose-700',
              museum: 'from-amber-600 to-stone-700',
              'best-practices': 'from-yellow-400 to-orange-500',
              'student-details': 'from-teal-500 to-emerald-700',
              'fees-details': 'from-lime-500 to-green-600',
              'finance-details': 'from-emerald-600 to-teal-800',
              'guest-faculty': 'from-sky-500 to-cyan-600',
              guestfaculty: 'from-sky-500 to-cyan-600',
              'visting-professor': 'from-violet-500 to-purple-700',
              aicte: 'from-rose-600 to-orange-600',
              gallery: 'from-pink-500 to-rose-600',
              'energy-environment-park': 'from-green-500 to-emerald-700',
              'student-project': 'from-cyan-600 to-teal-700',
              placement: 'from-indigo-600 to-sky-700'
            };
            const gradColors = colorSchemes[cat.slug] || colorSchemes.home;

            return (
              <div
                key={cat.slug}
                onClick={() => {
                  setActiveCategory(cat);
                  if (hasCustomManager(cat.slug) && hasCustomDataOnly(cat.slug) && !hasDynamicSection(cat.slug)) {
                    handleOpenSpecializedManager(cat.slug);
                  } else {
                    setView('category');
                  }
                }}
                className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl hover:translate-y-[-4px] hover:border-slate-200 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden"
              >
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradColors} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300`}></div>

                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradColors} opacity-10 rounded-2xl`}></div>
                  <span className="relative z-10">{cat.icon}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug m-0 group-hover:text-blue-900 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-400 mt-2 font-semibold leading-relaxed max-w-[200px]">
                  Configure {cat.name.toLowerCase()} dynamic layouts and resources.
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. MODULAR SECTIONS TOGGLE MANAGER ────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              <h3 className="text-xl font-black text-white m-0 tracking-tight">Enable / Disable Optional Modules</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Toggle any module below to add or remove its tab for this department (e.g. Placement, Alumni, Guest Faculty, Museum).
            </p>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs text-slate-300 font-medium">
            💡 Changes take effect on Save All Changes
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAvailableModules.map((mod) => {
            const isActive = categories.some(c => c.slug === mod.slug);

            return (
              <div
                key={mod.slug}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-slate-800/90 border-emerald-500/40 shadow-inner'
                    : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0 p-2 bg-slate-800 rounded-xl border border-slate-700/50">{mod.icon}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{mod.name}</span>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">{mod.description}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleModuleSection(mod.slug, mod.name)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition shrink-0 border-none ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-rose-500/20 hover:text-rose-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isActive ? '✓ Active (Disable)' : '+ Enable'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

