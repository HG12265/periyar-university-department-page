'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function StudentProjectManager() {
  const {
    setView,
    uploading,
    studentProjects,
    studentProjectsUploading,
    studentProjectForm,
    setStudentProjectForm,
    editingStudentProjectIdx,
    setEditingStudentProjectIdx,
    handleUploadStudentProjectImage,
    handleSubmitStudentProject,
    handleEditStudentProject,
    handleDeleteStudentProject,
    handleMoveStudentProject
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
  }, [editingStudentProjectIdx]);

  const handleSubmitStudentProjectLocal = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!studentProjectForm.title?.trim()) {
      newErrors.title = 'Project Title is required';
    }
    if (!studentProjectForm.student?.trim()) {
      newErrors.student = 'Student Name is required';
    }
    if (!studentProjectForm.degree?.trim()) {
      newErrors.degree = 'Degree is required';
    }
    if (!studentProjectForm.image_url?.trim()) {
      newErrors.image_url = 'Project Photo is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSubmitStudentProject(e);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">Student's Project Manager</h2>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
            Add and manage student project cards (image + title + student + degree)
          </p>
        </div>
        <button
          onClick={() => {
            setView('dashboard');
            setEditingStudentProjectIdx(null);
            setStudentProjectForm({ title: '', student: '', degree: '', image_url: '' });
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* ── Left: Add / Edit Form ── */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5 sticky top-6">
          <h3 className="text-base font-black text-slate-800 m-0 border-b border-slate-100 pb-3">
            {editingStudentProjectIdx !== null ? '✏️ Edit Project' : '➕ Add New Project'}
          </h3>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Project Photo</label>
            <div className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition group ${errors.image_url ? 'border-red-400 bg-red-50/5 hover:border-red-500' : 'border-slate-200 hover:border-violet-400 bg-slate-50/50'}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadStudentProjectImage}
                disabled={studentProjectsUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {studentProjectForm.image_url ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(() => {
                      const base = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
                      const url = studentProjectForm.image_url;
                      return url.startsWith('/api/') ? `${base}${url}` : url;
                    })()}
                    alt="Preview"
                    className="w-full h-36 object-contain rounded-xl mx-auto border border-slate-100"
                  />
                  <p className="text-xs text-slate-400 font-medium">Click to change image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1 py-4">
                  <span className="text-3xl">{studentProjectsUploading ? '⏳' : '🖼️'}</span>
                  <span className="font-bold text-sm text-slate-600">
                    {studentProjectsUploading ? 'Uploading...' : 'Click to Upload Photo'}
                  </span>
                  <span className="text-xs text-slate-400">JPEG, PNG, WebP</span>
                </div>
              )}
            </div>
            {errors.image_url && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{errors.image_url}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Project Title *</label>
            <textarea
              rows={3}
              value={studentProjectForm.title}
              onChange={(e) => setStudentProjectForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Design and Fabrication of Wind Tree Aeroleaf Using 3D Printing"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none font-sans text-sm resize-none transition-all ${errors.title ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-violet-500 bg-white'}`}
            />
            {errors.title && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{errors.title}</span>
              </div>
            )}
          </div>

          {/* Student Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Student Name</label>
            <input
              type="text"
              value={studentProjectForm.student}
              onChange={(e) => setStudentProjectForm(prev => ({ ...prev, student: e.target.value }))}
              placeholder="e.g. Mr. Hari Prasath.M (2022-2024)"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none font-sans text-sm transition-all ${errors.student ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-violet-500 bg-white'}`}
            />
            {errors.student && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{errors.student}</span>
              </div>
            )}
          </div>

          {/* Degree */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Degree</label>
            <input
              type="text"
              value={studentProjectForm.degree}
              onChange={(e) => setStudentProjectForm(prev => ({ ...prev, degree: e.target.value }))}
              placeholder="e.g. M.Tech / M.Sc"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none font-sans text-sm transition-all ${errors.degree ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-violet-500 bg-white'}`}
            />
            {errors.degree && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{errors.degree}</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmitStudentProjectLocal}
              disabled={uploading}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md"
            >
              {uploading ? 'Saving...' : editingStudentProjectIdx !== null ? 'Update Project' : 'Add Project'}
            </button>
            {editingStudentProjectIdx !== null && (
              <button
                onClick={() => { setEditingStudentProjectIdx(null); setStudentProjectForm({ title: '', student: '', degree: '', image_url: '' }); }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition cursor-pointer border-none"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Project Cards List ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-black text-slate-700 m-0">
              All Projects <span className="ml-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{studentProjects.length}</span>
            </h3>
          </div>

          {studentProjects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
              <p className="text-4xl mb-3">🎓</p>
              <p className="text-slate-400 font-bold text-base">No projects added yet.</p>
              <p className="text-slate-400 text-xs mt-1">Fill in the form on the left and click "Add Project".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentProjects.map((proj, idx) => {
                const base = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
                const fullUrl = proj.image_url
                  ? (proj.image_url.startsWith('/api/') ? `${base}${proj.image_url}` : proj.image_url)
                  : '';

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl border shadow-sm transition p-4 flex items-center gap-4 ${editingStudentProjectIdx === idx ? 'border-violet-400 ring-2 ring-violet-100' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {fullUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fullUrl} alt={proj.title} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl text-slate-300">📄</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{proj.title || <span className="text-slate-400 italic">Untitled</span>}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {proj.student && <span className="text-xs text-slate-500 font-medium">{proj.student}</span>}
                        {proj.degree && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{proj.degree}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleMoveStudentProject(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 rounded-lg border-none cursor-pointer text-xs"
                        title="Move Up"
                      >⬆️</button>
                      <button
                        onClick={() => handleMoveStudentProject(idx, 'down')}
                        disabled={idx === studentProjects.length - 1}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 rounded-lg border-none cursor-pointer text-xs"
                        title="Move Down"
                      >⬇️</button>
                      <button
                        onClick={() => handleEditStudentProject(idx)}
                        className="p-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg border-none cursor-pointer text-xs"
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDeleteStudentProject(idx)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border-none cursor-pointer text-xs"
                        title="Delete"
                      >🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
