'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function FacultyManager() {
  const {
    view,
    setView,
    dept,
    activeFaculty,
    setActiveFaculty,
    facultyFormData,
    setFacultyFormData,
    facultyImageFile,
    setFacultyImageFile,
    apiUrl,
    handleSaveFaculty,
    deleteFaculty,
    showConfirm
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [view, errors]);

  const handleSaveFacultyLocal = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!facultyFormData.name?.trim()) {
      newErrors.name = 'Faculty Name is required';
    }
    if (!facultyFormData.designation?.trim()) {
      newErrors.designation = 'Designation is required';
    }
    if (!facultyFormData.email?.trim()) {
      newErrors.email = 'Email Address is required';
    }
    if (!facultyFormData.specialization?.trim()) {
      newErrors.specialization = 'Area of Specialization is required';
    }
    if (!facultyFormData.profile_url?.trim()) {
      newErrors.profile_url = 'Faculty Profile URL is required';
    }
    if (!facultyFormData.image_url?.trim() && !facultyImageFile) {
      newErrors.image = 'Faculty Photo is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSaveFaculty(e);
  };

  if (view === 'faculty-manager') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 m-0">Faculty Management</h2>
          <button
            onClick={() => {
              setActiveFaculty({});
              setFacultyFormData({ name: '', designation: '', email: '', specialization: '', is_former: 0, order_index: 0, image_url: '', profile_url: '' });
              setView('faculty-editor');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition cursor-pointer border-none"
          >
            + Add New Faculty
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(() => {
            const standardFaculties = (dept.faculties?.filter(f => f.is_former === 0 || f.is_former === 1) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
            if (standardFaculties.length === 0) {
              return (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">No faculty members found.</p>
                </div>
              );
            }
            return standardFaculties.map(f => (
              <div key={f.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                    {f.image_url ? (
                      <img
                        src={f.image_url.startsWith('http') ? f.image_url : `${apiUrl.replace('/api', '')}${f.image_url}`}
                        className="w-full h-full object-cover"
                        alt={f.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">👤</div>
                    )}
                  </div>
                  <div>
                    <h4 className="m-0 font-bold text-gray-800">{f.name}</h4>
                    <div className="text-xs text-gray-400 mt-1 uppercase font-bold flex gap-2">
                      <span>{f.designation}</span>
                      <span className={`px-2 rounded-full ${f.is_former ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {f.is_former ? 'Former' : 'Current'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveFaculty(f);
                      setFacultyFormData({
                        name: f.name,
                        designation: f.designation,
                        email: f.email,
                        specialization: f.specialization,
                        is_former: f.is_former,
                        order_index: f.order_index,
                        image_url: f.image_url,
                        profile_url: f.profile_url
                      });
                      setView('faculty-editor');
                    }}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer border-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Delete Faculty Member',
                        message: 'Are you sure you want to delete this faculty member?',
                        itemName: f.name
                      });
                      if (confirmed) deleteFaculty(f.id);
                    }}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition cursor-pointer border-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>

        <button onClick={() => setView('dashboard')} className="text-gray-500 font-bold hover:text-blue-600 bg-transparent border-none cursor-pointer">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (view === 'faculty-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setView('faculty-manager')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold border-none bg-transparent cursor-pointer">← Back to Faculty List</button>
          <button onClick={handleSaveFacultyLocal} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md">
            {activeFaculty.id ? 'Update Faculty Member' : 'Add Faculty Member'}
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Faculty Name</label>
              <input type="text" value={facultyFormData.name || ''} onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. Dr. S. Kadhiravan" />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Designation</label>
              <input type="text" value={facultyFormData.designation || ''} onChange={(e) => setFacultyFormData({ ...facultyFormData, designation: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. Professor and Head" />
              {errors.designation && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.designation}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
              <input type="email" value={facultyFormData.email || ''} onChange={(e) => setFacultyFormData({ ...facultyFormData, email: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. email@periyaruniversity.ac.in" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Type</label>
              <select value={facultyFormData.is_former || 0} onChange={(e) => setFacultyFormData({ ...facultyFormData, is_former: parseInt(e.target.value) })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none bg-white">
                <option value={0}>Current Faculty</option>
                <option value={1}>Former Faculty</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Display Order (Lower numbers first)</label>
              <input type="number" value={facultyFormData.order_index || 0} onChange={(e) => setFacultyFormData({ ...facultyFormData, order_index: parseInt(e.target.value) })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="0" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Area of Specialization</label>
              <textarea value={facultyFormData.specialization || ''} onChange={(e) => setFacultyFormData({ ...facultyFormData, specialization: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none min-h-[120px]" placeholder="e.g. Psychology, Counselling..." />
              {errors.specialization && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.specialization}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Faculty Photo</label>
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                  {facultyImageFile ? (
                    <img src={URL.createObjectURL(facultyImageFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : facultyFormData.image_url ? (
                    <img src={facultyFormData.image_url.startsWith('http') ? facultyFormData.image_url : `${apiUrl.replace('/api', '')}${facultyFormData.image_url}`} className="w-full h-full object-cover" alt="Faculty" />
                  ) : (
                    <span className="text-2xl text-gray-200">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFacultyImageFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="mt-1 text-[10px] text-gray-400 font-medium tracking-tight uppercase">Recommended: 300x400px (Portrait)</p>
                </div>
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.image}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Faculty Profile URL (Link to Profile)</label>
              <input type="text" value={facultyFormData.profile_url || ''} onChange={(e) => setFacultyFormData({ ...facultyFormData, profile_url: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="https://faculty.periyaruniversity.ac.in/faculty/profile?id=..." />
              {errors.profile_url && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.profile_url}</p>}
            </div>
          </div>
        </div>
        
        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl">
          <button
            onClick={handleSaveFaculty}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md font-sans text-sm"
          >
            {activeFaculty.id ? 'Save Faculty Details & Finish' : 'Add Faculty Member & Finish'}
          </button>
          <button
            onClick={() => setView('faculty-manager')}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer font-sans text-sm shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
}
