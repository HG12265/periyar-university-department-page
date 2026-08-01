'use client';

import React from 'react';
import { useEditDepartment } from '../EditDepartmentContext';

export default function JournalBuilder() {
  const {
    journalBuilderMode,
    setJournalBuilderMode,
    activeSection,
    setActiveSection,
    journalText,
    setJournalText,
    journalFile,
    setJournalFile,
    journalImageFile,
    setJournalImageFile,
    uploading,
    setUploading,
    apiUrl
  } = useEditDepartment();

  const [errors, setErrors] = React.useState({});

  const handleAddJournalEntryLocal = async () => {
    const newErrors = {};
    if (!journalFile) {
      newErrors.journalFile = 'Journal PDF file is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please select a PDF file before adding the entry.");
      return;
    }
    setErrors({});
    await handleAddJournalEntry();
  };

  const handleAddJournalLogoLocal = async () => {
    const newErrors = {};
    if (!journalImageFile) {
      newErrors.journalImageFile = 'Journal Logo image is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please select a logo image file to add.");
      return;
    }
    setErrors({});
    await handleAddJournalLogo();
  };

  const handleAddJournalEntry = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', journalFile);
      const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Upload failed');

      const fileUrl = `${apiUrl.replace('/api', '')}${data.url}`;
      const newEntry = `<li style="margin-bottom: 10px;"><a href="${fileUrl}" target="_blank" style="color: #0056b3; font-weight: bold; text-decoration: none;">${journalText || ''}</a></li>`;

      let currentHtml = activeSection.content || '';
      if (!currentHtml.includes('<ul')) {
        currentHtml = `<ul style="list-style-type: disc; margin-left: 20px; line-height: 1.8;">${newEntry}</ul>`;
      } else {
        currentHtml = currentHtml.replace('</ul>', `${newEntry}</ul>`);
      }

      setActiveSection({ ...activeSection, content: currentHtml });
      setJournalText('');
      setJournalFile(null);
      alert('✓ Journal Entry Added! Click "Update Section" to save.');
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  const handleAddJournalLogo = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', journalImageFile);
      const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Upload failed');

      const imageUrl = `${apiUrl.replace('/api', '')}${data.url}`;
      const imgTag = `<img src="${imageUrl}" alt="Journal Logo" style="display: block !important; width: 300px !important; height: 70px !important; object-fit: contain !important; margin-bottom: 20px !important;" />`;

      setActiveSection({ ...activeSection, content: (activeSection.content || '') + imgTag });
      setJournalImageFile(null);
      alert('✓ Journal Logo Added! Click "Update Section" to save.');
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-indigo-50 border-dashed mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 m-0">Journal Entry Builder</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current Section: {activeSection.section_title || 'Journal'}</p>
        </div>
      </div>

      <div className="flex border-b border-gray-150 mb-6">
        <button
          type="button"
          onClick={() => setJournalBuilderMode('entry')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            journalBuilderMode === 'entry'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          📰 Add Journal Text & PDF
        </button>
        <button
          type="button"
          onClick={() => setJournalBuilderMode('image')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            journalBuilderMode === 'image'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          🖼️ Add Journal Logo
        </button>
      </div>

      {journalBuilderMode === 'entry' ? (
        <div key="journal-entry-container" className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Journal Text / Details</label>
              <input
                key="journal-text-input"
                type="text"
                value={journalText ?? ''}
                onChange={(e) => setJournalText(e.target.value)}
                className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition-all"
                placeholder="Enter journal title or details..."
              />
            </div>
            <div className="w-full md:w-80">
              <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Journal PDF File</label>
              <div className="flex gap-2">
                <input
                  key="journal-file-input"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    setJournalFile(e.target.files[0]);
                    if (errors.journalFile) setErrors({});
                  }}
                  className="flex-1 p-2 text-xs border-2 border-gray-200 rounded-lg bg-white file:bg-indigo-50 file:border-0 file:rounded file:text-xs file:font-semibold cursor-pointer"
                />
              </div>
              {errors.journalFile && <p className="text-red-500 text-[10px] mt-1 font-semibold m-0">{errors.journalFile}</p>}
            </div>
            <button
              type="button"
              onClick={handleAddJournalEntryLocal}
              disabled={uploading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:bg-gray-400 transition-all cursor-pointer shadow-md"
            >
              {uploading ? 'UPLOADING...' : '+ ADD JOURNAL ENTRY'}
            </button>
          </div>
        </div>
      ) : (
        <div key="journal-logo-container" className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Journal Logo / Image</label>
              <input
                key="journal-logo-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setJournalImageFile(e.target.files[0]);
                  if (errors.journalImageFile) setErrors({});
                }}
                className="w-full p-2 text-xs border-2 border-gray-200 rounded-lg bg-white file:bg-indigo-50 file:border-0 file:rounded file:text-xs file:font-semibold cursor-pointer"
              />
              {errors.journalImageFile && <p className="text-red-500 text-[10px] mt-1 font-semibold m-0">{errors.journalImageFile}</p>}
              <p className="text-[10px] text-gray-400 mt-2">Image will be sized automatically to 300x70 px.</p>
            </div>
            <button
              type="button"
              onClick={handleAddJournalLogoLocal}
              disabled={uploading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:bg-gray-400 transition-all cursor-pointer shadow-md"
            >
              {uploading ? 'UPLOADING...' : '+ ADD IMAGE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
