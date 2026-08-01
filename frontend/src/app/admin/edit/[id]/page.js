'use client';

import React, { useRef } from 'react';
import { EditDepartmentProvider, useEditDepartment } from './components/EditDepartmentContext';
import AdminSidebar from '@/components/AdminSidebar';
import Link from 'next/link';

// Component Imports
import DashboardView from './components/DashboardView';
import CategoryView from './components/CategoryView';
import SectionEditor from './components/SectionEditor';
import FacultyManager from './components/FacultyManager';
import AlumniManager from './components/AlumniManager';
import VisitingFacultyManager from './components/VisitingFacultyManager';
import PhdAwardedManager from './components/PhdAwardedManager';
import DstFacultyManager from './components/DstFacultyManager';
import MuseumManager from './components/MuseumManager';
import ActivityGalleryManager from './components/ActivityGalleryManager';
import EnergyParkManager from './components/EnergyParkManager';
import StudentProjectManager from './components/StudentProjectManager';
import FacilityManager from './components/FacilityManager';
import PlacementManager from './components/PlacementManager';
import GuestFacultyManager from './components/GuestFacultyManager';
import BestPracticesManager from './components/BestPracticesManager';
import FinanceDetailsManager from './components/FinanceDetailsManager';

function EditDepartmentContent() {
  const {
    view,
    dept,
    loading,
    setView,
    activeCategory,
    setActiveCategory,
    getDeptIcon,
    uploading,
    handleUpdateBannerImage,
    handleRemoveBannerImage,
    globalConfirm,
    globalPrompt
  } = useEditDepartment();



  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-200 border-t-[#000033] rounded-full mb-4"></div>
    </div>
  );
  if (!dept) return <div className="p-20 text-center text-red-500 font-bold">Department not found</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumbs / Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              <Link href="/admin" className="hover:text-blue-600 no-underline transition-colors">Admin</Link>
              <span>/</span>
              <span onClick={() => { setView('dashboard'); setActiveCategory(null); }} className="cursor-pointer hover:text-blue-600 transition-colors">{dept.name}</span>
              {activeCategory && (
                <>
                  <span>/</span>
                  <span onClick={() => setView('category')} className="cursor-pointer hover:text-blue-600 transition-colors font-black text-slate-600">{activeCategory.name}</span>
                </>
              )}
            </div>

            {/* Department Info Header Banner Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {/* 3D Academic Emblem Badge */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-50 flex items-center justify-center text-4xl shadow-sm shadow-blue-500/5">
                  {getDeptIcon(dept.name)}
                </div>

                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none m-0">
                    {view === 'dashboard' ? dept.name : (activeCategory?.name || '')}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                      /{dept.slug}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {view === 'dashboard' ? 'Department Dashboard' : `${activeCategory?.name || ''} manager`}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/dept/${dept.slug}`}
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center text-center bg-white text-slate-700 hover:text-blue-900 border border-slate-200 px-5 py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all no-underline shadow-sm"
              >
                🌐 View Public Site
              </Link>
            </div>
          </div>

          {/* Banner Image Management Card — shown only on dashboard */}
          {view === 'dashboard' && (() => {
            const bannerInputRef = React.createRef();
            const apiBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
            const bannerUrl = dept.banner_image && dept.banner_image !== '/logo.JPG' && dept.banner_image !== '/logo.jpg'
              ? (dept.banner_image.startsWith('/api/') ? `${apiBase}${dept.banner_image}` : dept.banner_image)
              : null;

            return (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                {/* Banner Preview */}
                <div className="relative w-full h-36 bg-slate-100">
                  {bannerUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bannerUrl} alt="Department banner" className="w-full h-full object-cover" />
                      {/* Title overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="bg-white/90 text-[#000033] text-sm font-extrabold px-6 py-2 rounded-xl shadow tracking-widest uppercase">
                          {dept.title || `Department of ${dept.name}`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => { if (!uploading) bannerInputRef.current?.click(); }}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 cursor-pointer hover:bg-slate-200/50 hover:text-slate-450 transition-all duration-300"
                    >
                      <span className="text-4xl">🖼️</span>
                      <span className="text-xs font-bold">No banner image set</span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-black text-slate-600 m-0">Department Banner Image</p>
                    <p className="text-[10px] text-slate-400 m-0 mt-0.5">
                      {bannerUrl ? 'Banner is active — displayed on the public department page' : 'Upload a wide image to use as the department page banner'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {bannerUrl && (
                      <button
                        onClick={handleRemoveBannerImage}
                        disabled={uploading}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer bg-white disabled:opacity-50"
                      >
                        ✕ Remove
                      </button>
                    )}
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-1.5 rounded-xl text-[10px] font-bold bg-[#000033] text-[#ffc107] hover:bg-[#0b0b47] transition cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? '⏳ Uploading...' : bannerUrl ? '🔄 Change Banner' : '📁 Upload Banner'}
                    </button>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files[0]) handleUpdateBannerImage(e.target.files[0]); }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dynamic Views Rendering */}
          {view === 'dashboard' && <DashboardView />}
          {view === 'category' && <CategoryView />}
          {view === 'editor' && <SectionEditor />}
          
          {/* Managers */}
          {(view === 'faculty-manager' || view === 'faculty-editor') && <FacultyManager />}
          {(view === 'alumni-manager' || view === 'alumni-editor' || view === 'alumni-event-editor') && <AlumniManager />}
          {view === 'visiting-faculty-manager' && <VisitingFacultyManager />}
          {view === 'phd-awarded-manager' && <PhdAwardedManager />}
          {(view === 'dst-faculty-manager' || view === 'dst-faculty-editor') && <DstFacultyManager />}
          {view === 'museum-manager' && <MuseumManager />}
          {(view === 'gallery-manager' || view === 'gallery-event-editor' || view === 'activity-gallery-editor') && <ActivityGalleryManager />}
          {view === 'energy-park-manager' && <EnergyParkManager />}
          {view === 'student-project-manager' && <StudentProjectManager />}
          {view === 'facilities-manager' && <FacilityManager />}
          {(view === 'placement-manager' || view === 'placement-editor' || view === 'placement-event-editor') && <PlacementManager />}
          {(view === 'guest-faculty-manager' || view === 'guest-faculty-editor') && <GuestFacultyManager />}
          {view === 'best-practices-manager' && <BestPracticesManager />}
          {view === 'finance-details-manager' && <FinanceDetailsManager />}

        </div>
      </main>

      {/* Global Confirmation Modal */}
      {globalConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out opacity-100"
          onClick={() => globalConfirm.resolve(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center transition-all duration-300 ease-out transform scale-100 translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Trash Warning Icon Container */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5 shadow-inner border border-red-150 animate-pulse">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-800 m-0 leading-tight">
              {globalConfirm.title}
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
              {globalConfirm.message}
            </p>

            {/* Item details */}
            {globalConfirm.itemName && (
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center my-4 font-bold text-slate-700 truncate max-w-xs text-xs">
                {globalConfirm.itemName}
              </div>
            )}

            {/* Buttons Row */}
            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={() => globalConfirm.resolve(false)}
                className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition rounded-xl cursor-pointer bg-white text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={() => globalConfirm.resolve(true)}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-750 text-white font-bold transition rounded-xl border-none cursor-pointer shadow-sm shadow-red-500/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Prompt Input Modal */}
      {globalPrompt && <PromptModal globalPrompt={globalPrompt} />}
    </div>
  );
}

function PromptModal({ globalPrompt }) {
  const [promptInputVal, setPromptInputVal] = React.useState(globalPrompt.defaultValue || '');

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out opacity-100"
      onClick={() => globalPrompt.resolve(null)}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center transition-all duration-300 ease-out transform scale-100 translate-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document link Icon badge container */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-5 shadow-inner border border-blue-150">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-800 m-0 leading-tight">
          {globalPrompt.title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
          {globalPrompt.message}
        </p>

        {/* Input field */}
        <input
          type="text"
          value={promptInputVal}
          onChange={(e) => setPromptInputVal(e.target.value)}
          placeholder={globalPrompt.placeholder || "e.g. View Attachment, Winners list..."}
          className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-slate-50 font-sans font-semibold text-slate-800 my-4 shadow-inner"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              globalPrompt.resolve(promptInputVal);
            }
          }}
          autoFocus
        />

        {/* Buttons Row */}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={() => globalPrompt.resolve(null)}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition rounded-xl cursor-pointer bg-white text-xs uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={() => globalPrompt.resolve(promptInputVal)}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-750 text-white font-bold transition rounded-xl border-none cursor-pointer shadow-sm shadow-blue-500/10 text-xs uppercase tracking-wider flex items-center justify-center"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

import { ToastProvider } from './components/ToastContext';

export default function EditDepartment() {
  return (
    <ToastProvider>
      <EditDepartmentProvider>
        <EditDepartmentContent />
      </EditDepartmentProvider>
    </ToastProvider>
  );
}
