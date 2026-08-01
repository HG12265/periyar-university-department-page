'use client';

import React from 'react';
import { useEditDepartment } from '../EditDepartmentContext';

export default function SyllabusBuilder() {
  const {
    syllabusFormData,
    setSyllabusFormData,
    activeSection,
    setActiveSection,
    uploading,
    setUploading,
    apiUrl
  } = useEditDepartment();

  const [errors, setErrors] = React.useState({});
  const [showYearModal, setShowYearModal] = React.useState(false);
  const [yearInput, setYearInput] = React.useState('2023 - 2024 ONWARDS');
  
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [existingFileUrl, setExistingFileUrl] = React.useState('');
  const [editingYearIndex, setEditingYearIndex] = React.useState(null);

  const handleAddYearHeaderRow = () => {
    setYearInput('2023 - 2024 ONWARDS');
    setEditingYearIndex(null);
    setShowYearModal(true);
  };

  const handleConfirmYearHeader = () => {
    if (!yearInput.trim()) return;
    const userYear = yearInput.trim();
    
    const newItem = {
      type: 'year',
      yearText: userYear
    };

    const currentItems = getExistingSyllabusItems();
    
    if (editingYearIndex !== null) {
      currentItems[editingYearIndex] = newItem;
      rebuildSyllabusTable(currentItems);
      setEditingYearIndex(null);
      alert('✓ Academic Year Header Updated Successfully!');
    } else {
      const hasTable = activeSection.content?.toLowerCase().includes('</tbody>') || activeSection.content?.toLowerCase().includes('</table>');
      if (hasTable) {
        currentItems.push(newItem);
        rebuildSyllabusTable(currentItems);
      } else {
        rebuildSyllabusTable([newItem]);
      }
      alert('✓ Year Header Row Added successfully!');
    }
    setShowYearModal(false);
  };

  const handleInsertSyllabusTable = () => {
    const template = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; border: none;"><tbody><tr style="background-color: #fff; border-bottom: 2px solid #eee;"><td style="padding: 15px 12px; text-align: left; width: 15%; font-weight: bold; color: #333; font-size: 15px; text-transform: uppercase;">S.No</td><td style="padding: 15px 12px; text-align: left; width: 65%; font-weight: bold; color: #333; font-size: 15px; text-transform: uppercase;">PROGRAMMES</td><td style="padding: 15px 12px; text-align: left; width: 20%; font-weight: bold; color: #333; font-size: 15px; text-transform: uppercase;">DETAILS</td></tr></tbody></table>`;
    setActiveSection({ ...activeSection, content: (activeSection.content || '') + template });
  };

  // Helper to parse syllabus items dynamically from activeSection.content
  const getExistingSyllabusItems = () => {
    const html = activeSection.content;
    if (!html) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      
      const items = [];
      let trs = [];
      
      if (table) {
        trs = Array.from(table.querySelectorAll('tr'));
      } else {
        trs = Array.from(doc.querySelectorAll('tr'));
      }
      
      if (trs.length === 0) return [];

      trs.forEach((tr) => {
        const tds = Array.from(tr.querySelectorAll('td, th'));
        if (tds.length >= 3) {
          const cell0Text = tds[0].textContent.trim();
          const cell1Text = tds[1].textContent.trim();
          const cell2Text = tds[2].textContent.trim();

          // 1. Skip standard table header row
          const isTableHeader = 
            cell0Text.toLowerCase() === 's.no' || 
            cell1Text.toLowerCase() === 'programmes' || 
            cell2Text.toLowerCase() === 'details';
          if (isTableHeader) return;

          // 2. Check if it's an Academic Year Header Row (teal colored banner with outer empty cells)
          const isYearHeader = 
            (cell0Text === '' || cell0Text === '\u00a0' || cell0Text === '&nbsp;') && 
            (cell2Text === '' || cell2Text === '\u00a0' || cell2Text === '&nbsp;') && 
            cell1Text !== '';

          if (isYearHeader) {
            items.push({
              type: 'year',
              yearText: cell1Text
            });
          } else {
            // Standard Syllabus Row
            const anchor = tds[2].querySelector('a');
            const fileUrl = anchor ? anchor.getAttribute('href') : '';
            const fileLabel = anchor ? anchor.textContent.trim() : 'SYLLABUS';
            items.push({
              type: 'row',
              sno: cell0Text,
              title: cell1Text,
              fileUrl,
              fileLabel
            });
          }
        }
      });
      return items;
    } catch (e) {
      console.error("Error parsing syllabus table:", e);
      return [];
    }
  };

  const existingSyllabusItems = getExistingSyllabusItems();

  const rebuildSyllabusTable = (itemsArray) => {
    const headerRow = `<tr style="background-color: #fff; border-bottom: 2px solid #eee;"><td style="padding: 15px 12px; text-align: left; width: 15%; font-weight: bold; color: #333; font-size: 15px; text-transform: uppercase;">S.No</td><td style="padding: 15px 12px; text-align: left; width: 65%; font-weight: bold; color: #333; font-size: 15px; text-transform: uppercase;">PROGRAMMES</td><td style="padding: 15px 12px; text-align: left; width: 20%; font-weight: bold; color: #333; font-size: 15px; text-transform: uppercase;">DETAILS</td></tr>`;
    
    let isEven = false;
    const rowsHtml = itemsArray.map(item => {
      if (item.type === 'year') {
        return `<tr style="background-color: #1fa2b8;"><td style="padding: 12px; background-color: #1fa2b8; border:none;">&nbsp;</td><td style="padding: 12px; background-color: #1fa2b8; color: #333; font-weight: bold; text-align: center; font-family: sans-serif; text-transform: uppercase; font-size: 14px; border:none;">${item.yearText}</td><td style="padding: 12px; background-color: #1fa2b8; border:none;">&nbsp;</td></tr>`;
      } else {
        const rowBg = isEven ? '#f9f9f9' : '#ffffff';
        isEven = !isEven;
        return `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #eee;"><td style="padding: 15px 12px; color: #555; font-size: 14px; text-align: left;">${item.sno}</td><td style="padding: 15px 12px; color: #333; font-size: 14px; text-align: left;">${item.title}</td><td style="padding: 15px 12px; text-align: left;"><a href="${item.fileUrl}" target="_blank" style="color: #cc0000; font-weight: normal; text-decoration: none; font-size: 14px; text-transform: uppercase;">SYLLABUS</a></td></tr>`;
      }
    }).join('');

    const newContent = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; border: none;"><tbody>${headerRow}${rowsHtml}</tbody></table>`;
    setActiveSection({ ...activeSection, content: newContent });
  };

  const handleEditRow = (idx, item) => {
    setEditingIndex(idx);
    setExistingFileUrl(item.fileUrl);
    setSyllabusFormData({
      sno: item.sno,
      title: item.title,
      file: null
    });
  };

  const handleEditYearHeader = (idx, item) => {
    setEditingYearIndex(idx);
    setYearInput(item.yearText);
    setShowYearModal(true);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setExistingFileUrl('');
    setSyllabusFormData({ sno: '', title: '', file: null });
  };

  const handleDeleteRow = (idx) => {
    if (!confirm('Are you sure you want to delete this row/header?')) return;
    const currentItems = getExistingSyllabusItems();
    currentItems.splice(idx, 1);
    rebuildSyllabusTable(currentItems);
  };

  const handleMoveRow = (idx, direction) => {
    const currentItems = getExistingSyllabusItems();
    if (direction === 'up' && idx > 0) {
      const temp = currentItems[idx];
      currentItems[idx] = currentItems[idx - 1];
      currentItems[idx - 1] = temp;
    } else if (direction === 'down' && idx < currentItems.length - 1) {
      const temp = currentItems[idx];
      currentItems[idx] = currentItems[idx + 1];
      currentItems[idx + 1] = temp;
    }
    rebuildSyllabusTable(currentItems);
  };

  const handleAddRowToTable = async () => {
    const newErrors = {};
    if (!syllabusFormData.sno?.trim()) {
      newErrors.sno = 'S.No is required';
    }
    if (!syllabusFormData.title?.trim()) {
      newErrors.title = 'Programme Name is required';
    }
    if (editingIndex === null && !syllabusFormData.file) {
      newErrors.file = 'PDF file is required';
    } else if (editingIndex !== null && !syllabusFormData.file && !existingFileUrl) {
      newErrors.file = 'PDF file is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("⚠️ Please enter the S.No, Title, and select a PDF file before adding a row.");
      return;
    }
    setErrors({});

    setUploading(true);
    
    try {
      let finalFileUrl = existingFileUrl;
      
      if (syllabusFormData.file) {
        const formData = new FormData();
        formData.append('file', syllabusFormData.file);
        const base = apiUrl.replace('/api', '');
        const res = await fetch(`${apiUrl}/admin/upload?folder=syllabus`, { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Upload failed');
        }
        finalFileUrl = `${base}${data.url}`;
      }

      const resetForm = { sno: '', title: '', file: null };
      const currentItems = getExistingSyllabusItems();
      const newItem = {
        type: 'row',
        sno: syllabusFormData.sno,
        title: syllabusFormData.title,
        fileUrl: finalFileUrl,
        fileLabel: 'SYLLABUS'
      };

      if (editingIndex !== null) {
        currentItems[editingIndex] = newItem;
        rebuildSyllabusTable(currentItems);
        setEditingIndex(null);
        setExistingFileUrl('');
        alert('✓ Syllabus Row Updated Successfully!');
      } else {
        const hasTable = activeSection.content?.toLowerCase().includes('</tbody>') || activeSection.content?.toLowerCase().includes('</table>');
        if (hasTable) {
          currentItems.push(newItem);
          rebuildSyllabusTable(currentItems);
        } else {
          rebuildSyllabusTable([newItem]);
        }
        alert('✓ New Syllabus Row Added successfully!');
      }
      
      setSyllabusFormData(resetForm);
    } catch (err) {
      alert('Failed to save row: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-blue-50 border-dashed">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 m-0">Syllabus Row Builder</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current Section: {activeSection.section_title || 'Syllabus'}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAddYearHeaderRow}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600 transition border-none cursor-pointer shadow-sm animate-in fade-in"
          >
            + Add Year Header Row
          </button>
          <button
            type="button"
            onClick={handleInsertSyllabusTable}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-black transition border-none cursor-pointer shadow-sm"
          >
            + Insert Syllabus Table
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in slide-in-from-bottom-2">
        <div className="w-full md:w-20">
          <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">S.No</label>
          <input
            type="text"
            value={syllabusFormData.sno ?? ''}
            onChange={(e) => {
              setSyllabusFormData({ ...syllabusFormData, sno: e.target.value });
              if (errors.sno) setErrors({ ...errors, sno: null });
            }}
            className={`w-full p-3 text-sm border-2 rounded-lg focus:outline-none bg-white transition-all font-bold text-center ${errors.sno ? 'border-red-400 focus:border-blue-400 bg-red-50/5' : 'border-gray-200 focus:border-blue-400'}`}
            placeholder="1"
          />
          {errors.sno && (
            <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-[9px] font-bold uppercase tracking-wider">{errors.sno}</span>
            </div>
          )}
        </div>
        <div className="flex-1 w-full">
          <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Programme Name</label>
          <input
            type="text"
            value={syllabusFormData.title ?? ''}
            onChange={(e) => {
              setSyllabusFormData({ ...syllabusFormData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            className={`w-full p-3 text-sm border-2 rounded-lg focus:outline-none bg-white transition-all ${errors.title ? 'border-red-400 focus:border-blue-400 bg-red-50/5' : 'border-gray-200 focus:border-blue-400'}`}
            placeholder="e.g. M.Sc. Biochemistry (2024-25)"
          />
          {errors.title && (
            <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-[9px] font-bold uppercase tracking-wider">{errors.title}</span>
            </div>
          )}
        </div>
        <div className="w-full md:w-64">
          <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Syllabus PDF File</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                setSyllabusFormData({ ...syllabusFormData, file: e.target.files[0] });
                if (errors.file) setErrors({ ...errors, file: null });
              }}
              className={`flex-1 p-2 text-xs border-2 rounded-lg bg-white file:bg-blue-50 file:border-0 file:rounded file:text-[10px] file:font-semibold cursor-pointer ${errors.file ? 'border-red-400 focus:border-blue-400' : 'border-gray-200 focus:border-blue-400'}`}
            />
            {syllabusFormData.file ? (
              <button
                type="button"
                onClick={() => window.open(URL.createObjectURL(syllabusFormData.file))}
                className="px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200 text-[10px] font-bold hover:bg-red-100 transition whitespace-nowrap"
              >
                PREVIEW
              </button>
            ) : existingFileUrl ? (
              <button
                type="button"
                onClick={() => window.open(existingFileUrl)}
                className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200 text-[10px] font-bold hover:bg-green-100 transition whitespace-nowrap"
              >
                VIEW CURRENT
              </button>
            ) : null}
          </div>
          {errors.file && (
            <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-[9px] font-bold uppercase tracking-wider">{errors.file}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 md:flex-none bg-white hover:bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border border-gray-200"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleAddRowToTable}
            disabled={uploading}
            className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:bg-gray-400 transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap"
          >
            {uploading ? 'UPLOADING...' : (editingIndex !== null ? 'UPDATE ROW' : 'ADD ROW TO TABLE')}
          </button>
        </div>
      </div>

      {/* Existing Syllabus Items List Manager */}
      {existingSyllabusItems.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            Manage Syllabus Rows ({existingSyllabusItems.length})
          </h4>
          <div className="space-y-3">
            {existingSyllabusItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 
                  ${item.type === 'year' 
                    ? 'border-teal-200 bg-teal-50/15 hover:bg-teal-50/25' 
                    : (editingIndex === idx ? 'border-blue-300 bg-blue-50/20' : 'border-gray-150 bg-slate-50/50 hover:bg-slate-50')}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.type === 'year' ? (
                    <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 bg-teal-500 text-white rounded-lg tracking-wider shrink-0 shadow-sm animate-pulse">
                      📅 Academic Year
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {item.sno}
                    </span>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-slate-800 truncate block">
                      {item.type === 'year' ? item.yearText : item.title}
                    </span>
                    {item.type === 'row' && item.fileUrl && (
                      <span className="text-[10px] text-red-600 font-bold block mt-1 hover:underline">
                        📄 <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-red-600 no-underline font-bold uppercase">{item.fileLabel || 'SYLLABUS'}</a>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    onClick={() => handleMoveRow(idx, 'up')}
                    disabled={idx === 0}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-500 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRow(idx, 'down')}
                    disabled={idx === existingSyllabusItems.length - 1}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-500 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Down"
                  >
                    ▼
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => item.type === 'year' ? handleEditYearHeader(idx, item) : handleEditRow(idx, item)}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                    title="Edit Item"
                  >
                    ✏️ Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(idx)}
                    className="w-8 h-8 rounded-lg bg-white border border-rose-100 text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition"
                    title="Delete Item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Year Header Prompt Modal */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800 m-0 font-sans">
                🗓️ {editingYearIndex !== null ? 'Edit Academic Year Header' : 'Add Academic Year Header'}
              </h3>
              <button
                onClick={() => setShowYearModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold border-none bg-transparent cursor-pointer text-lg font-sans"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 font-sans">
                  Academic Year Header Text
                </label>
                <input
                  type="text"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm font-bold font-sans text-slate-800"
                  placeholder="e.g. 2023 - 2024 ONWARDS"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmYearHeader();
                  }}
                />
                <p className="mt-2 text-[10px] text-gray-400 font-medium tracking-tight uppercase font-sans">
                  Example: 2023 - 2024 ONWARDS, 2024 - 2025 ONWARDS
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-2 font-sans">
              <button
                onClick={() => setShowYearModal(false)}
                className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl font-bold transition text-xs font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmYearHeader}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition text-xs font-sans shadow-md border-none cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
