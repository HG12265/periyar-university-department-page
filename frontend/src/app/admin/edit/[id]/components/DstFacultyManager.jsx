'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function DstFacultyManager() {
  const {
    view,
    setView,
    dstFacultyRows,
    setDstFacultyRows,
    activeDstFaculty,
    setActiveDstFaculty,
    dstFacultyFormData,
    setDstFacultyFormData,
    saveDstFacultyRowsDirectly,
    showConfirm
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [view, errors]);

  if (view === 'dst-faculty-manager') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 m-0">DST-Faculty Manager</h2>
            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Manage department DST-Faculty details</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setActiveDstFaculty('new');
                setDstFacultyFormData({ name: '', email: '', mobile: '' });
                setView('dst-faculty-editor');
              }}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-sm text-xs uppercase tracking-wider"
            >
              + Add DST-Faculty Member
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm text-xs uppercase tracking-wider"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Members List Table Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current DST-Faculty Members ({dstFacultyRows.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="p-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider w-[8%]">S.No</th>
                  <th className="p-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider w-[35%]">Name</th>
                  <th className="p-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider w-[25%]">Email</th>
                  <th className="p-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider w-[20%]">Mobile</th>
                  <th className="p-4 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider w-[12%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dstFacultyRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 font-bold text-xs">
                      No DST-Faculty members added yet. Click &quot;+ Add DST-Faculty Member&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  dstFacultyRows.map((member, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 text-xs font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-4 text-xs font-extrabold text-slate-800">{member.name}</td>
                      <td className="p-4 text-xs font-medium text-slate-600">
                        <a href={`mailto:${member.email}`} className="text-red-700 hover:underline">{member.email}</a>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-650">{member.mobile}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setActiveDstFaculty(idx);
                              setDstFacultyFormData({ ...member });
                              setView('dst-faculty-editor');
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg border-none bg-transparent cursor-pointer transition active:scale-95 text-xs font-bold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await showConfirm({
                                title: 'Delete DST-Faculty Member',
                                message: 'Are you sure you want to delete this DST-Faculty member from the list?',
                                itemName: member.name || ''
                              });
                              if (confirmed) {
                                const remaining = dstFacultyRows.filter((_, i) => i !== idx);
                                setDstFacultyRows(remaining);
                                await saveDstFacultyRowsDirectly(remaining);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg border-none bg-transparent cursor-pointer transition active:scale-95 text-xs font-bold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dst-faculty-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setView('dst-faculty-manager')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold border-none bg-transparent cursor-pointer"
          >
            ← Back to DST-Faculty List
          </button>
          <button
            onClick={async () => {
              const newErrors = {};
              if (!dstFacultyFormData.name?.trim()) {
                newErrors.name = 'Faculty Name is required';
              }
              if (!dstFacultyFormData.email?.trim()) {
                newErrors.email = 'Email Address is required';
              }
              if (!dstFacultyFormData.mobile?.trim()) {
                newErrors.mobile = 'Mobile Number is required';
              }
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
              }
              setErrors({});

              let updated;
              if (activeDstFaculty === 'new') {
                updated = [...dstFacultyRows, { ...dstFacultyFormData }];
              } else {
                updated = [...dstFacultyRows];
                updated[activeDstFaculty] = { ...dstFacultyFormData };
              }
              setDstFacultyRows(updated);
              setView('dst-faculty-manager');
              await saveDstFacultyRowsDirectly(updated);
            }}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md"
          >
            {activeDstFaculty === 'new' ? 'Add DST-Faculty to List' : 'Update DST-Faculty in List'}
          </button>
        </div>

        <div className="p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Faculty Name</label>
            <input
              type="text"
              value={dstFacultyFormData.name || ''}
              onChange={(e) => setDstFacultyFormData({ ...dstFacultyFormData, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-slate-800 font-bold text-sm bg-slate-50/20"
              placeholder="e.g. Dr. D. Navaneethan"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
            <input
              type="email"
              value={dstFacultyFormData.email || ''}
              onChange={(e) => setDstFacultyFormData({ ...dstFacultyFormData, email: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-slate-800 font-semibold text-sm bg-slate-50/20"
              placeholder="e.g. email@gmail.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Mobile Number</label>
            <input
              type="text"
              value={dstFacultyFormData.mobile || ''}
              onChange={(e) => setDstFacultyFormData({ ...dstFacultyFormData, mobile: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-slate-800 font-semibold text-sm bg-slate-50/20"
              placeholder="e.g. +91 8675475577"
            />
            {errors.mobile && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.mobile}</p>}
          </div>
        </div>
        
        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl font-sans">
          <button
            onClick={async () => {
              if (!dstFacultyFormData.name) {
                alert("Please enter a name!");
                return;
              }
              let updated;
              if (activeDstFaculty === 'new') {
                updated = [...dstFacultyRows, { ...dstFacultyFormData }];
              } else {
                updated = [...dstFacultyRows];
                updated[activeDstFaculty] = { ...dstFacultyFormData };
              }
              setDstFacultyRows(updated);
              setView('dst-faculty-manager');
              await saveDstFacultyRowsDirectly(updated);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans"
          >
            {activeDstFaculty === 'new' ? 'Add DST-Faculty & Finish' : 'Update DST-Faculty & Finish'}
          </button>
          <button
            onClick={() => setView('dst-faculty-manager')}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer text-sm shadow-sm font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
}
