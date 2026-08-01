'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';
import ActivitiesTableBuilder from './builders/ActivitiesTableBuilder';

export default function GuestFacultyManager() {
  const {
    view,
    setView,
    dept,
    apiUrl,
    id,
    fetchDeptDetails,

    // Context states for the Table Builder
    setActiveBuilderTab,
    setShowTemplateBuilder,
    setActiveSection,
    setOriginalRawContent,
    setActivityCustomTableData,
    setActivityTableTitle,
    setIsActivitiesTableInserted,
    isActivitiesTableInserted,
    handleFinishActivitiesTable,

    // Context getters
    activeSection,
    originalRawContent,
    parseHtmlTableToData,
    showConfirm
  } = useEditDepartment();

  // Active sub-tab inside Guest Faculty Manager ('cards', 'table', or 'pdf')
  const [activeSubTab, setActiveSubTab] = useState('cards');

  // Local state management for Guest Faculty cards
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    specialization: '',
    is_former: 2,
    order_index: 0,
    image_url: '',
    profile_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Local state for PDF Link Button
  const [pdfLinkText, setPdfLinkText] = useState('');
  const [localPdfFile, setLocalPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [view, activeSubTab, errors]);

  // Sync active context variables when switching to the Table Builder tab
  useEffect(() => {
    if (activeSubTab === 'table') {
      setActiveBuilderTab('table');
      setShowTemplateBuilder(true);

      const sect = dept.sections?.find(s => s.category === 'guest-faculty');
      if (sect) {
        if (activeSection !== sect) setActiveSection(sect);
        if (originalRawContent !== sect.content) setOriginalRawContent(sect.content);
      } else {
        const newSect = { section_title: 'Guest Faculty Details', content: '', category: 'guest-faculty' };
        if (activeSection?.section_title !== newSect.section_title || activeSection?.content !== newSect.content) {
          setActiveSection(newSect);
        }
        if (originalRawContent !== '') setOriginalRawContent('');
        setActivityCustomTableData({ headers: [], rows: [] });
        setActivityTableTitle('');
        if (isActivitiesTableInserted) setIsActivitiesTableInserted(false);
      }
    }
  }, [activeSubTab, dept, activeSection, originalRawContent, isActivitiesTableInserted, setActiveBuilderTab, setShowTemplateBuilder, setActiveSection, setOriginalRawContent, setActivityCustomTableData, setActivityTableTitle, setIsActivitiesTableInserted]);

  // Sync and parse active section when switching to PDF Button tab
  useEffect(() => {
    if (activeSubTab === 'pdf') {
      const sect = dept.sections?.find(s => s.category === 'guest-faculty');
      if (sect) {
        if (activeSection !== sect) setActiveSection(sect);
        if (originalRawContent !== sect.content) setOriginalRawContent(sect.content);
        
        if (sect.content) {
          const match = sect.content.match(/href="([^"]+\.pdf)"/i);
          const matchUrl = match ? match[1] : '';
          if (existingPdfUrl !== matchUrl) {
            setExistingPdfUrl(matchUrl);
          }
          const textMatch = sect.content.match(/<\/svg>\s*([^<]+)\s*<\/a>/i);
          const matchText = textMatch ? textMatch[1].trim() : '';
          if (pdfLinkText !== matchText) {
            setPdfLinkText(matchText);
          }
        } else {
          if (existingPdfUrl !== '') setExistingPdfUrl('');
          if (pdfLinkText !== '') setPdfLinkText('');
        }
      } else {
        const newSect = { section_title: 'Guest Faculty Details', content: '', category: 'guest-faculty' };
        if (activeSection?.section_title !== newSect.section_title || activeSection?.content !== newSect.content) {
          setActiveSection(newSect);
        }
        if (originalRawContent !== '') setOriginalRawContent('');
        if (existingPdfUrl !== '') setExistingPdfUrl('');
        if (pdfLinkText !== '') setPdfLinkText('');
      }
    }
  }, [activeSubTab, dept, activeSection, originalRawContent, existingPdfUrl, pdfLinkText, setActiveSection, setOriginalRawContent]);

  // Filter faculties list to show only guest faculties (is_former === 2)
  const guestFaculties = (dept.faculties?.filter(f => f.is_former === 2) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const handleSaveLocal = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.designation?.trim()) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.specialization?.trim()) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.image_url?.trim() && !imageFile) {
      newErrors.image_url = 'Faculty Image is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSave(e);
  };

  const handleUploadGuestFacultyPdfLocal = () => {
    const newErrors = {};
    if (!pdfLinkText?.trim()) {
      newErrors.pdfLinkText = 'Button Label Text is required';
    }
    if (!localPdfFile && !existingPdfUrl) {
      newErrors.localPdfFile = 'Please select a PDF file';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleUploadGuestFacultyPdf();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim() ||
        !formData.designation?.trim() ||
        !formData.email?.trim() ||
        !formData.specialization?.trim() ||
        (!formData.image_url?.trim() && !imageFile)) {
      alert("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    let finalImageUrl = formData.image_url;

    if (imageFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);
      uploadFormData.append('folder', 'faculties');
      try {
        const upRes = await fetch(`${apiUrl}/admin/upload?folder=faculties`, {
          method: 'POST',
          body: uploadFormData
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalImageUrl = upData.url;
        } else {
          const upData = await upRes.json();
          alert('Image upload failed: ' + (upData.detail || 'Upload failed'));
          setUploading(false);
          return;
        }
      } catch (err) {
        alert('Image upload failed');
        setUploading(false);
        return;
      }
    }

    const isUpdate = activeFaculty?.id;
    const method = isUpdate ? 'PUT' : 'POST';
    const endpoint = isUpdate ? `${apiUrl}/admin/faculties/${activeFaculty.id}` : `${apiUrl}/admin/faculties`;

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          name: formData.name,
          designation: formData.designation,
          email: formData.email,
          specialization: formData.specialization,
          image_url: finalImageUrl,
          profile_url: '',
          is_former: 2,
          order: parseInt(formData.order_index || 0)
        })
      });

      if (res.ok) {
        alert(isUpdate ? 'Guest Faculty member updated! ✓' : 'Guest Faculty member added! ✓');
        setActiveFaculty(null);
        setFormData({
          name: '',
          designation: '',
          email: '',
          specialization: '',
          is_former: 2,
          order_index: 0,
          image_url: '',
          profile_url: ''
        });
        setImageFile(null);
        setView('guest-faculty-manager');
        fetchDeptDetails();
      } else {
        alert('Failed to save guest faculty.');
      }
    } catch (err) {
      alert('Error saving guest faculty.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    try {
      const res = await fetch(`${apiUrl}/admin/remove-faculty/${facultyId}`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Guest faculty member deleted! ✓');
        fetchDeptDetails();
      } else {
        alert('Failed to delete guest faculty member.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting guest faculty member.');
    }
  };

  // PDF Link Creator Handler
  const handleUploadGuestFacultyPdf = async () => {
    if (!pdfLinkText.trim() || !localPdfFile) {
      alert("Please enter both the link text and select a PDF file.");
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', localPdfFile);
    formData.append('folder', 'activities');

    try {
      const res = await fetch(`${apiUrl}/admin/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const base = apiUrl.replace('/api', '');
        const fullUrl = `${base}${data.url}`;

        const linkBtnHtml = `
<div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: flex-start;">
  <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background-color: #990033; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold; text-decoration: none; font-family: 'CMU Sans Serif Demi borderless', sans-serif; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ${pdfLinkText.trim().toUpperCase()}
  </a>
</div>
        `.trim();

        let cleanContent = activeSection.content || '';
        cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i, '');
        const finalContent = linkBtnHtml + "\n" + cleanContent.trim();

        const method = activeSection.id ? 'PUT' : 'POST';
        const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

        const saveRes = await fetch(endpoint, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dept_id: parseInt(id),
            title: activeSection.section_title || 'Guest Faculty Details',
            category: 'guest-faculty',
            content: finalContent
          })
        });

        if (saveRes.ok) {
          setExistingPdfUrl(fullUrl);
          setLocalPdfFile(null);
          alert('✓ Guest Faculty PDF successfully uploaded and button linked!');
          await fetchDeptDetails();
        } else {
          alert('Failed to save PDF button to department section.');
        }
      } else {
        const errData = await res.json();
        alert('Failed to upload PDF file: ' + (errData.detail || 'Upload failed'));
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading or saving file.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemoveGuestFacultyPdf = async () => {
    const confirmed = await showConfirm({
      title: 'Remove PDF Link Button',
      message: 'Are you sure you want to remove this PDF Link Button?',
      itemName: 'PDF Button Link'
    });
    if (!confirmed) return;

    let cleanContent = activeSection.content || '';
    cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i, '');

    const method = activeSection.id ? 'PUT' : 'POST';
    const endpoint = activeSection.id ? `${apiUrl}/admin/sections/${activeSection.id}` : `${apiUrl}/admin/sections`;

    try {
      const saveRes = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dept_id: parseInt(id),
          title: activeSection.section_title || 'Guest Faculty Details',
          category: 'guest-faculty',
          content: cleanContent.trim()
        })
      });

      if (saveRes.ok) {
        setExistingPdfUrl('');
        setLocalPdfFile(null);
        setPdfLinkText('');
        alert('✓ PDF link button removed successfully!');
        await fetchDeptDetails();
      } else {
        alert('Failed to remove PDF link button from database.');
      }
    } catch (err) {
      console.error(err);
      alert('Error removing PDF link.');
    }
  };

  if (view === 'guest-faculty-manager') {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        {/* Header Panel */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 m-0">👥 Guest Faculty Manager</h2>
            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
              Manage guest faculty cards, dynamic table spreadsheet documents, and attachments.
            </p>
          </div>
          <button
            onClick={() => setView('dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm flex items-center gap-1.5"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tab Switcher Headers */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-xl shadow-inner gap-1 flex-wrap">
          <button
            onClick={() => setActiveSubTab('cards')}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${
              activeSubTab === 'cards'
                ? 'bg-white text-sky-650 shadow-md scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
          >
            👥 Guest Faculty Cards
          </button>
          <button
            onClick={() => setActiveSubTab('table')}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${
              activeSubTab === 'table'
                ? 'bg-white text-sky-650 shadow-md scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
          >
            📊 Dynamic Table Builder
          </button>
          <button
            onClick={() => setActiveSubTab('pdf')}
            className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm border-none cursor-pointer transition-all duration-300 ${
              activeSubTab === 'pdf'
                ? 'bg-white text-sky-650 shadow-md scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
            }`}
          >
            📁 Upload PDF File
          </button>
        </div>

        {/* SUB-TAB 1: GUEST FACULTY GRID CARDS */}
        {activeSubTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="m-0 font-bold text-gray-700 font-sans">Visual profile cards list</h4>
              <button
                onClick={() => {
                  setActiveFaculty(null);
                  setFormData({
                    name: '',
                    designation: '',
                    email: '',
                    specialization: '',
                    is_former: 2,
                    order_index: 0,
                    image_url: '',
                    profile_url: ''
                  });
                  setImageFile(null);
                  setView('guest-faculty-editor');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans"
              >
                + Add Guest Faculty Card
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {guestFaculties.map(f => (
                <div key={f.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                      {f.image_url ? (
                        <img
                          src={f.image_url.startsWith('http') ? f.image_url : `${apiUrl.replace('/api', '')}${f.image_url}`}
                          className="w-full h-full object-cover"
                          alt={f.name}
                        />
                      ) : (
                        <span className="text-xl text-gray-300">👤</span>
                      )}
                    </div>
                    <div>
                      <h4 className="m-0 font-bold text-gray-800 font-sans">{f.name}</h4>
                      <div className="text-xs text-gray-400 mt-1 uppercase font-bold flex gap-2 font-sans">
                        <span>{f.designation || 'No PG Specialization'}</span>
                        <span className="bg-blue-50 text-blue-600 px-2 rounded-full">
                          Guest Faculty
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveFaculty(f);
                        setFormData({
                          name: f.name,
                          designation: f.designation || '',
                          email: f.email || '',
                          specialization: f.specialization || '',
                          is_former: 2,
                          order_index: f.order_index || 0,
                          image_url: f.image_url || '',
                          profile_url: ''
                        });
                        setImageFile(null);
                        setView('guest-faculty-editor');
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer border-none font-sans text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await showConfirm({
                          title: 'Delete Guest Faculty',
                          message: 'Are you sure you want to delete this guest faculty member?',
                          itemName: f.name
                        });
                        if (confirmed) handleDelete(f.id);
                      }}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition cursor-pointer border-none font-sans text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {guestFaculties.length === 0 && (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold font-sans">No guest faculty members found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: INTERACTIVE SPREADSHEET TABLE BUILDER */}
        {activeSubTab === 'table' && (
          <div className="space-y-6">
            {originalRawContent && originalRawContent.includes('<table') && !isActivitiesTableInserted && (
              <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-250/30 flex justify-between items-center flex-wrap gap-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow">📊</span>
                  <div>
                    <span className="text-sm font-bold text-amber-900 block">Existing Table Detected in this Section!</span>
                    <span className="text-xs text-amber-700/90 block mt-0.5">Would you like to import this table back into the interactive Visual Spreadsheet Editor?</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseHtmlTableToData(originalRawContent);
                    if (parsed) {
                      setActivityCustomTableData(parsed);
                      setActivityTableTitle(parsed.title || '');
                      setIsActivitiesTableInserted(true);
                      setShowTemplateBuilder(true);
                      setActiveBuilderTab('table');
                      alert("✓ Successfully loaded the table back into the visual Spreadsheet Editor!");
                    } else {
                      alert("Could not parse table structure. You can set it up from scratch.");
                    }
                  }}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition"
                >
                  ✏️ Edit Table in Spreadsheet
                </button>
              </div>
            )}

            {isActivitiesTableInserted ? (
              <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-150 flex-wrap gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800 m-0">📝 Interactive Spreadsheet Editor</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Directly fill out dynamic cell contents, add/delete rows, and publish to the public site.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActivityCustomTableData(prev => ({
                          ...prev,
                          rows: [...prev.rows, Array(prev.headers.length).fill('')]
                        }));
                      }}
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition flex items-center gap-1.5"
                    >
                      ➕ Add New Row
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActivitiesTableInserted(false);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition"
                    >
                      Modify Columns
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishActivitiesTable}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition flex items-center gap-1.5"
                    >
                      💾 Save & Publish Table
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl bg-gray-50 p-2">
                  <ActivitiesTableBuilder spreadsheetViewOnly={true} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm">
                <ActivitiesTableBuilder spreadsheetViewOnly={false} />
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: PDF BUTTON ATTACHMENT */}
        {activeSubTab === 'pdf' && (
          <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 p-6 rounded-2xl border-2 border-teal-100 shadow-sm space-y-4">
              <div>
                <span className="text-sm font-black text-teal-900 block flex items-center gap-2">
                  📁 Dynamic PDF Download Button Link
                </span>
                <p className="text-xs text-teal-700/80 mt-1">
                  Provide a custom download button text label (e.g., &quot;GUEST FACULTY SYLLABUS & DIRECTORY&quot;) and select a PDF file. This automatically registers and links a beautiful download button into the Guest Faculty page!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5 tracking-wider">
                    Button Label Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GUEST FACULTY LIST PDF"
                    value={pdfLinkText}
                    onChange={(e) => setPdfLinkText(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 bg-white font-sans text-sm font-extrabold uppercase animate-none"
                  />
                  {errors.pdfLinkText && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.pdfLinkText}</p>}
                </div>

                <div className="flex gap-4 items-end flex-wrap pt-2">
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5 tracking-wider">
                      Select PDF File
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setLocalPdfFile(e.target.files[0])}
                      className="p-2 border border-slate-200 rounded-xl bg-white w-full cursor-pointer text-xs"
                    />
                    {errors.localPdfFile && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.localPdfFile}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleUploadGuestFacultyPdfLocal}
                    disabled={uploadingPdf}
                    className="px-6 py-3.5 bg-[#990033] hover:bg-[#80002a] disabled:bg-slate-300 text-white rounded-xl text-xs font-extrabold border-none cursor-pointer shadow-md transition whitespace-nowrap"
                  >
                    {uploadingPdf ? 'Uploading...' : 'Upload & Link PDF'}
                  </button>
                </div>
              </div>

              {existingPdfUrl && (
                <div className="flex items-center gap-2 bg-green-50 text-green-800 p-4 rounded-xl border border-green-150 text-xs font-bold mt-4 shadow-inner">
                  <span>✓ Active Guest Faculty PDF Linked:</span>
                  <a
                    href={existingPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-950 break-all"
                  >
                    {existingPdfUrl.split('/').pop()}
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveGuestFacultyPdf}
                    className="ml-auto text-red-650 hover:text-red-800 font-extrabold border-none bg-transparent cursor-pointer"
                  >
                    Remove Link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'guest-faculty-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setView('guest-faculty-manager')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold border-none bg-transparent cursor-pointer font-sans">← Back to Guest Faculty List</button>
          <button onClick={handleSaveLocal} disabled={uploading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md font-sans">
            {uploading ? 'Saving...' : activeFaculty ? 'Update Guest Faculty' : 'Add Guest Faculty'}
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest font-sans">Guest Faculty Name</label>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none font-sans" placeholder="e.g. Dr. M. Dhanarasu" />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest font-sans">PG Specialization</label>
              <input type="text" value={formData.designation || ''} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none font-sans" placeholder="e.g. Energy Studies" />
              {errors.designation && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.designation}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest font-sans">Area of Interest</label>
              <textarea value={formData.specialization || ''} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none min-h-[100px] font-sans" placeholder="e.g. Bio Energy, Solar Energy, Energy Storage" />
              {errors.specialization && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.specialization}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest font-sans">Email Address</label>
              <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none font-sans" placeholder="e.g. dhanarasu1994@gmail.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest font-sans">Display Order (Lower numbers first)</label>
              <input type="number" value={formData.order_index || 0} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none font-sans" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest font-sans">Photo</label>
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : formData.image_url ? (
                    <img src={formData.image_url.startsWith('http') ? formData.image_url : `${apiUrl.replace('/api', '')}${formData.image_url}`} className="w-full h-full object-cover" alt="Faculty" />
                  ) : (
                    <span className="text-2xl text-gray-200">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer font-sans"
                  />
                  <p className="mt-1 text-[10px] text-gray-400 font-medium tracking-tight uppercase font-sans">Recommended: Portrait Size Image</p>
                  {errors.image_url && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.image_url}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl">
          <button
            onClick={handleSave}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md font-sans text-sm disabled:bg-blue-400"
          >
            {uploading ? 'Saving...' : activeFaculty ? 'Update Guest Faculty & Finish' : 'Add Guest Faculty & Finish'}
          </button>
          <button
            onClick={() => setView('guest-faculty-manager')}
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
