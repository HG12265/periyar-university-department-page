'use client';

import React from 'react';
import { useEditDepartment } from '../EditDepartmentContext';

export default function ConferenceBuilder() {
  const {
    conferenceText,
    setConferenceText,
    conferenceFile,
    setConferenceFile,
    activeSection,
    setActiveSection,
    uploading,
    setUploading,
    apiUrl
  } = useEditDepartment();

  const [errors, setErrors] = React.useState({});

  const handleAddConferenceRowLocal = async () => {
    const newErrors = {};
    if (!conferenceFile) {
      newErrors.conferenceFile = 'Conference PDF file is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please select a PDF file for the conference details.");
      return;
    }
    setErrors({});
    await handleAddConferenceRow();
  };

  const handleAddConferenceRow = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', conferenceFile);
      const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Upload failed');

      const fileUrl = `${apiUrl.replace('/api', '')}${data.url}`;
      let currentHtml = activeSection.content || '';

      const newRow = `
    <tr style="border-bottom: 1px solid #e2e8f0 !important; background-color: #ffffff !important; transition: all 0.2s !important;">
      <td style="border: 1px solid #e2e8f0 !important; padding: 16px 20px !important; text-align: left !important; vertical-align: middle !important; color: #334155 !important; font-size: 15px !important; line-height: 1.6 !important;">${conferenceText || ''}</td>
      <td style="border: 1px solid #e2e8f0 !important; padding: 16px 20px !important; text-align: center !important; vertical-align: middle !important; width: 160px !important;"><a href="${fileUrl}" target="_blank" style="display: inline-block !important; background-color: #1fa2b8 !important; color: #ffffff !important; font-weight: bold !important; padding: 8px 18px !important; border-radius: 6px !important; text-decoration: none !important; font-size: 12px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; box-shadow: 0 2px 4px rgba(31,162,184,0.15) !important; transition: all 0.2s ease !important; border: 1px solid #1fa2b8 !important;">Brochure</a></td>
    </tr>`;

      if (!currentHtml.includes('<table')) {
        currentHtml = `
<table style="width: 100% !important; border-collapse: collapse !important; border: 1px solid #e2e8f0 !important; margin: 20px 0 !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;">
  <tbody>${newRow}
  </tbody>
</table>`;
      } else {
        currentHtml = currentHtml.replace('</tbody>', `${newRow}\n  </tbody>`);
      }

      setActiveSection({ ...activeSection, content: currentHtml });
      setConferenceText('');
      setConferenceFile(null);
      alert('✓ Conference Row Added! Click "Update Section" to save.');
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-indigo-50 border-dashed mb-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 m-0">Conference Table Row Builder</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current Section: {activeSection.section_title || 'Conference'}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Conference details / Description</label>
            <input
              type="text"
              value={conferenceText ?? ''}
              onChange={(e) => setConferenceText(e.target.value)}
              className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition-all"
              placeholder="Enter conference description or title..."
            />
          </div>
          <div className="w-full md:w-80">
            <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Conference PDF File (Brochure)</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  setConferenceFile(e.target.files[0]);
                  if (errors.conferenceFile) setErrors({});
                }}
                className={`flex-1 p-2 text-xs border rounded-lg bg-white file:bg-indigo-50 file:border-0 file:rounded file:text-xs file:font-semibold cursor-pointer transition-all ${errors.conferenceFile ? 'border-red-400 focus:border-red-500 bg-red-50/5' : 'border-gray-250'}`}
              />
            </div>
            {errors.conferenceFile && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{errors.conferenceFile}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddConferenceRowLocal}
            disabled={uploading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:bg-gray-400 transition-all cursor-pointer shadow-md"
          >
            {uploading ? 'UPLOADING...' : '+ ADD CONFERENCE ROW'}
          </button>
        </div>
      </div>
    </div>
  );
}
