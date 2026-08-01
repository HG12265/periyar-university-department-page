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
    handleOpenSpecializedManager
  } = useEditDepartment();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
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

            {/* Icon Container with subtle radial halo */}
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
  );
}
