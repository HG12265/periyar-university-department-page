'use client';

import React from 'react';
import { useEditDepartment } from '../EditDepartmentContext';
import { sanitizeHtml } from '@/utils/sanitize';

export default function ProgrammesBuilder() {
  const {
    programmeFormData,
    setProgrammeFormData,
    activeSection,
    setActiveSection,
    uploading,
    setUploading,
    apiUrl
  } = useEditDepartment();

  const handleInsertProgrammesTable = () => {
    const template = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; table-layout: fixed; word-wrap: break-word;"><tbody><tr><td style="padding: 15px 12px; border-bottom: 2px solid #ccc; font-weight: bold; color: #333; font-size: 14px; text-transform: uppercase; width: 35%; vertical-align: top; white-space: normal;">PROGRAMMES OFFERED</td><td style="padding: 15px 12px; border-bottom: 2px solid #ccc; font-weight: bold; color: #333; font-size: 14px; text-transform: uppercase; width: 65%; vertical-align: top; white-space: normal;">ELIGIBILITY</td></tr></tbody></table>`;
    setActiveSection({ ...activeSection, content: (activeSection.content || '') + template });
  };

  const insertTextAtCursor = (text) => {
    const textarea = document.getElementById('programme-eligibility-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = programmeFormData.eligibility || '';
    const newVal = currentVal.substring(0, start) + text + currentVal.substring(end);
    
    setProgrammeFormData({
      ...programmeFormData,
      eligibility: newVal
    });

    // Reset selection and focus after state update
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  };

  const [errors, setErrors] = React.useState({});
  const [alertState, setAlertState] = React.useState({
    isOpen: false,
    message: '',
    fields: []
  });
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [existingLinks, setExistingLinks] = React.useState([]);

  // Helper to parse programmes from activeSection.content dynamically
  const getExistingProgrammes = () => {
    const html = activeSection.content;
    if (!html) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      
      const rows = [];
      let trs = [];
      
      if (table) {
        trs = Array.from(table.querySelectorAll('tr'));
      } else {
        trs = Array.from(doc.querySelectorAll('tr'));
      }
      
      if (trs.length === 0) return [];

      trs.forEach((tr, index) => {
        const tds = Array.from(tr.querySelectorAll('td, th'));
        if (tds.length >= 2) {
          const name = tds[0].textContent.trim();
          const eligibilityHtml = tds[1].innerHTML.trim();
          
          // Skip header row strictly if it is th or matches exact header title
          const cleanName = name.toLowerCase().trim();
          const cleanEligibility = eligibilityHtml.toLowerCase().trim();
          const isHeader = 
            tr.querySelector('th') !== null ||
            cleanName === 'programmes offered' || 
            (cleanName.includes('programmes offered') && cleanEligibility.includes('eligibility'));
            
          if (!isHeader && name) {
            rows.push({
              index,
              name,
              eligibilityHtml
            });
          }
        }
      });
      return rows;
    } catch (e) {
      console.error("Error parsing programmes table:", e);
      return [];
    }
  };

  const existingProgrammes = getExistingProgrammes();

  const rebuildProgrammesTable = (programmesArray) => {
    const headerRow = `<tr><td style="padding: 15px 12px; border-bottom: 2px solid #ccc; font-weight: bold; color: #333; font-size: 14px; text-transform: uppercase; width: 35%; vertical-align: top; white-space: normal;">PROGRAMMES OFFERED</td><td style="padding: 15px 12px; border-bottom: 2px solid #ccc; font-weight: bold; color: #333; font-size: 14px; text-transform: uppercase; width: 65%; vertical-align: top; white-space: normal;">ELIGIBILITY</td></tr>`;
    
    const rowsHtml = programmesArray.map(p => {
      return `<tr><td style="padding: 15px 12px; border-bottom: 1px solid #eee; color: #444; font-size: 14px; vertical-align: top; width: 35%; white-space: normal; word-wrap: break-word;">${p.name}</td><td style="padding: 15px 12px; border-bottom: 1px solid #eee; color: #555; font-size: 14px; vertical-align: top; line-height: 1.6; width: 65%; white-space: normal; word-wrap: break-word;">${p.eligibilityHtml}</td></tr>`;
    }).join('');

    const newContent = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; table-layout: fixed; word-wrap: break-word;"><tbody>${headerRow}${rowsHtml}</tbody></table>`;
    setActiveSection({ ...activeSection, content: newContent });
  };

  const handleEditRow = (idx, prog) => {
    setEditingIndex(idx);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(prog.eligibilityHtml, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));
    
    links.forEach(a => a.remove());
    let cleanEligibilityHtml = doc.body.innerHTML.trim();
    
    cleanEligibilityHtml = cleanEligibilityHtml.replace(/(?:<br\s*\/?>\s*)+$/gi, '');
    const cleanEligibilityText = cleanEligibilityHtml.replace(/<br\s*\/?>/gi, '\n');

    const loadedForm = {
      name: prog.name,
      eligibility: cleanEligibilityText,
      link1Text: links[0] ? links[0].textContent.trim() : '',
      link1File: null,
      link2Text: links[1] ? links[1].textContent.trim() : '',
      link2File: null,
      link3Text: links[2] ? links[2].textContent.trim() : '',
      link3File: null,
      link4Text: links[3] ? links[3].textContent.trim() : '',
      link4File: null
    };

    const urls = links.map(a => ({ text: a.textContent.trim(), url: a.getAttribute('href') }));
    setExistingLinks(urls);
    setProgrammeFormData(loadedForm);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setExistingLinks([]);
    setProgrammeFormData({
      name: '',
      eligibility: '',
      link1Text: '',
      link1File: null,
      link2Text: '',
      link2File: null,
      link3Text: '',
      link3File: null,
      link4Text: '',
      link4File: null
    });
  };

  const handleDeleteRow = (idx) => {
    if (!confirm('Are you sure you want to delete this programme?')) return;
    const currentProgs = getExistingProgrammes();
    currentProgs.splice(idx, 1);
    rebuildProgrammesTable(currentProgs);
  };

  const handleMoveRow = (idx, direction) => {
    const currentProgs = getExistingProgrammes();
    if (direction === 'up' && idx > 0) {
      const temp = currentProgs[idx];
      currentProgs[idx] = currentProgs[idx - 1];
      currentProgs[idx - 1] = temp;
    } else if (direction === 'down' && idx < currentProgs.length - 1) {
      const temp = currentProgs[idx];
      currentProgs[idx] = currentProgs[idx + 1];
      currentProgs[idx + 1] = temp;
    }
    rebuildProgrammesTable(currentProgs);
  };

  const handleAddProgrammeLocal = async () => {
    const newErrors = {};
    const missing = [];
    if (!programmeFormData.name?.trim()) {
      newErrors.name = 'Programme Name is required';
      missing.push('Programme Name');
    }
    if (programmeFormData.link1Text && !programmeFormData.link1File && !existingLinks[0]) {
      newErrors.link1File = 'Link 1 PDF file is required';
      missing.push('Link 1 PDF File');
    }
    if (programmeFormData.link2Text && !programmeFormData.link2File && !existingLinks[1]) {
      newErrors.link2File = 'Link 2 PDF file is required';
      missing.push('Link 2 PDF File');
    }
    if (programmeFormData.link3Text && !programmeFormData.link3File && !existingLinks[2]) {
      newErrors.link3File = 'Link 3 PDF file is required';
      missing.push('Link 3 PDF File');
    }
    if (programmeFormData.link4Text && !programmeFormData.link4File && !existingLinks[3]) {
      newErrors.link4File = 'Link 4 PDF file is required';
      missing.push('Link 4 PDF File');
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlertState({
        isOpen: true,
        message: 'Required Fields Missing',
        fields: missing
      });
      return;
    }
    setErrors({});
    await handleAddProgramme();
  };

  const handleAddProgramme = async () => {
    setUploading(true);
    let eligibilityHtml = (programmeFormData.eligibility || '').replace(/\n/g, '<br/>');

    const base = apiUrl.replace('/api', '');
    const linksArray = [];

    // Link 1
    if (programmeFormData.link1Text) {
      if (programmeFormData.link1File) {
        const fd1 = new FormData();
        fd1.append('file', programmeFormData.link1File);
        try {
          const res1 = await fetch(`${apiUrl}/admin/upload?folder=syllabus`, { method: 'POST', body: fd1 });
          const data1 = await res1.json();
          linksArray.push({ url: `${base}${data1.url}`, text: programmeFormData.link1Text });
        } catch (err) { alert('Failed to upload Link 1'); }
      } else if (existingLinks[0]) {
        linksArray.push({ url: existingLinks[0].url, text: programmeFormData.link1Text });
      }
    }

    // Link 2
    if (programmeFormData.link2Text) {
      if (programmeFormData.link2File) {
        const fd2 = new FormData();
        fd2.append('file', programmeFormData.link2File);
        try {
          const res2 = await fetch(`${apiUrl}/admin/upload?folder=syllabus`, { method: 'POST', body: fd2 });
          const data2 = await res2.json();
          linksArray.push({ url: `${base}${data2.url}`, text: programmeFormData.link2Text });
        } catch (err) { alert('Failed to upload Link 2'); }
      } else if (existingLinks[1]) {
        linksArray.push({ url: existingLinks[1].url, text: programmeFormData.link2Text });
      }
    }

    // Link 3
    if (programmeFormData.link3Text) {
      if (programmeFormData.link3File) {
        const fd3 = new FormData();
        fd3.append('file', programmeFormData.link3File);
        try {
          const res3 = await fetch(`${apiUrl}/admin/upload?folder=syllabus`, { method: 'POST', body: fd3 });
          const data3 = await res3.json();
          linksArray.push({ url: `${base}${data3.url}`, text: programmeFormData.link3Text });
        } catch (err) { alert('Failed to upload Link 3'); }
      } else if (existingLinks[2]) {
        linksArray.push({ url: existingLinks[2].url, text: programmeFormData.link3Text });
      }
    }

    // Link 4
    if (programmeFormData.link4Text) {
      if (programmeFormData.link4File) {
        const fd4 = new FormData();
        fd4.append('file', programmeFormData.link4File);
        try {
          const res4 = await fetch(`${apiUrl}/admin/upload?folder=syllabus`, { method: 'POST', body: fd4 });
          const data4 = await res4.json();
          linksArray.push({ url: `${base}${data4.url}`, text: programmeFormData.link4Text });
        } catch (err) { alert('Failed to upload Link 4'); }
      } else if (existingLinks[3]) {
        linksArray.push({ url: existingLinks[3].url, text: programmeFormData.link4Text });
      }
    }

    let linksHtml = '';
    if (linksArray.length > 0) {
      linksHtml = linksArray.map((link, lIdx) => {
        const isLast = lIdx === linksArray.length - 1;
        const margin = isLast ? '' : ' margin-right: 15px;';
        return `<a href="${link.url}" target="_blank" style="color: #990033; font-weight: bold; text-decoration: none;${margin}">${link.text}</a>`;
      }).join('');
    }

    if (linksHtml) {
      eligibilityHtml += (eligibilityHtml ? '<br/><br/>' : '') + linksHtml;
    }

    const resetForm = {
      name: '',
      eligibility: '',
      link1Text: '',
      link1File: null,
      link2Text: '',
      link2File: null,
      link3Text: '',
      link3File: null,
      link4Text: '',
      link4File: null
    };

    const currentProgs = getExistingProgrammes();
    const newProg = {
      name: programmeFormData.name,
      eligibilityHtml: eligibilityHtml
    };

    if (editingIndex !== null) {
      currentProgs[editingIndex] = newProg;
      rebuildProgrammesTable(currentProgs);
      setEditingIndex(null);
      setExistingLinks([]);
      setProgrammeFormData(resetForm);
      alert('✓ Programme Updated Successfully!');
    } else {
      const hasTable = activeSection.content?.toLowerCase().includes('</tbody>') || activeSection.content?.toLowerCase().includes('</table>');
      if (hasTable) {
        currentProgs.push(newProg);
        rebuildProgrammesTable(currentProgs);
      } else {
        rebuildProgrammesTable([newProg]);
      }
      setProgrammeFormData(resetForm);
      alert('✓ New Programme Added successfully!');
    }

    setUploading(false);
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-purple-50 border-dashed">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 m-0">Programmes Builder</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current Section: {activeSection.section_title || 'Programmes'}</p>
        </div>
        <button
          type="button"
          onClick={handleInsertProgrammesTable}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold hover:bg-black transition border-none cursor-pointer shadow-sm animate-in fade-in"
        >
          + Insert Programmes Table
        </button>
      </div>

      <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in slide-in-from-bottom-2">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-1/3">
            <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Programme Name</label>
            <input
              type="text"
              value={programmeFormData.name ?? ''}
              onChange={(e) => {
                setProgrammeFormData({ ...programmeFormData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              className={`w-full p-3 text-sm border-2 rounded-lg focus:outline-none bg-white transition-all ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50/5' : 'border-gray-200 focus:border-purple-400'}`}
              placeholder="e.g. M.Sc. (Biotechnology)"
            />
            {errors.name && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-[9px] font-bold uppercase tracking-wider">{errors.name}</span>
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Eligibility</label>
            <textarea
              id="programme-eligibility-textarea"
              value={programmeFormData.eligibility ?? ''}
              onChange={(e) => setProgrammeFormData({ ...programmeFormData, eligibility: e.target.value })}
              className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none bg-white transition-all min-h-[160px] resize-y"
              placeholder="Enter eligibility criteria here. Use Enter key or helper buttons below to start new lines or paragraphs."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all"
                title="Inserts a single line break"
              >
                ↵ New Line
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n\n')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all"
                title="Inserts a blank space between paragraphs"
              >
                ↵↵ Paragraph Space
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n• ')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 transition-all"
                title="Inserts a new bullet list point"
              >
                • Bullet Point
              </button>
              <span className="text-[10px] text-gray-400 self-center font-medium ml-auto hidden sm:inline">
                Tip: Pressing <strong>Enter</strong> in the box works too!
              </span>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block border-b border-gray-100 pb-2">Attachment Links (Optional - Up to 4 Files)</span>
          
          {/* Row 1: Link 1 & Link 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Link 1 */}
            <div className="flex flex-col sm:flex-row gap-2 items-end bg-slate-50/40 p-2.5 rounded-lg border border-slate-100/65">
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 1 Label</label>
                <input
                  type="text"
                  value={programmeFormData.link1Text ?? ''}
                  onChange={(e) => setProgrammeFormData({ ...programmeFormData, link1Text: e.target.value })}
                  className="w-full p-2 text-xs border-2 border-gray-200 rounded-lg focus:border-purple-400 bg-white"
                  placeholder="e.g. Regulations"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 1 PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    setProgrammeFormData({ ...programmeFormData, link1File: e.target.files[0] });
                    if (errors.link1File) setErrors({ ...errors, link1File: null });
                  }}
                  className={`w-full p-1.5 text-[10px] border-2 rounded-lg bg-white ${errors.link1File ? 'border-red-400 focus:border-purple-400' : 'border-gray-200 focus:border-purple-400'}`}
                />
                {errors.link1File && (
                  <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{errors.link1File}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Link 2 */}
            <div className="flex flex-col sm:flex-row gap-2 items-end bg-slate-50/40 p-2.5 rounded-lg border border-slate-100/65">
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 2 Label</label>
                <input
                  type="text"
                  value={programmeFormData.link2Text ?? ''}
                  onChange={(e) => setProgrammeFormData({ ...programmeFormData, link2Text: e.target.value })}
                  className="w-full p-2 text-xs border-2 border-gray-200 rounded-lg focus:border-purple-400 bg-white"
                  placeholder="e.g. Brochure"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 2 PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    setProgrammeFormData({ ...programmeFormData, link2File: e.target.files[0] });
                    if (errors.link2File) setErrors({ ...errors, link2File: null });
                  }}
                  className={`w-full p-1.5 text-[10px] border-2 rounded-lg bg-white ${errors.link2File ? 'border-red-400 focus:border-purple-400' : 'border-gray-200 focus:border-purple-400'}`}
                />
                {errors.link2File && (
                  <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{errors.link2File}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Link 3 & Link 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Link 3 */}
            <div className="flex flex-col sm:flex-row gap-2 items-end bg-slate-50/40 p-2.5 rounded-lg border border-slate-100/65">
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 3 Label</label>
                <input
                  type="text"
                  value={programmeFormData.link3Text ?? ''}
                  onChange={(e) => setProgrammeFormData({ ...programmeFormData, link3Text: e.target.value })}
                  className="w-full p-2 text-xs border-2 border-gray-200 rounded-lg focus:border-purple-400 bg-white"
                  placeholder="e.g. Syllabus"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 3 PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    setProgrammeFormData({ ...programmeFormData, link3File: e.target.files[0] });
                    if (errors.link3File) setErrors({ ...errors, link3File: null });
                  }}
                  className={`w-full p-1.5 text-[10px] border-2 rounded-lg bg-white ${errors.link3File ? 'border-red-400 focus:border-purple-400' : 'border-gray-200 focus:border-purple-400'}`}
                />
                {errors.link3File && (
                  <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{errors.link3File}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Link 4 */}
            <div className="flex flex-col sm:flex-row gap-2 items-end bg-slate-50/40 p-2.5 rounded-lg border border-slate-100/65">
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 4 Label</label>
                <input
                  type="text"
                  value={programmeFormData.link4Text ?? ''}
                  onChange={(e) => setProgrammeFormData({ ...programmeFormData, link4Text: e.target.value })}
                  className="w-full p-2 text-xs border-2 border-gray-200 rounded-lg focus:border-purple-400 bg-white"
                  placeholder="e.g. Entrance Details"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-widest">Link 4 PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    setProgrammeFormData({ ...programmeFormData, link4File: e.target.files[0] });
                    if (errors.link4File) setErrors({ ...errors, link4File: null });
                  }}
                  className={`w-full p-1.5 text-[10px] border-2 rounded-lg bg-white ${errors.link4File ? 'border-red-400 focus:border-purple-400' : 'border-gray-200 focus:border-purple-400'}`}
                />
                {errors.link4File && (
                  <div className="flex items-center gap-1 mt-1 text-red-655 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{errors.link4File}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2 gap-2">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-white hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border border-gray-200"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleAddProgrammeLocal}
            disabled={uploading}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap disabled:bg-gray-400"
          >
            {uploading ? 'UPLOADING...' : (editingIndex !== null ? 'UPDATE PROGRAMME' : 'ADD PROGRAMME')}
          </button>
        </div>
      </div>

      {/* Existing Programmes Row List Manager */}
      {existingProgrammes.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">
            Manage Existing Programmes ({existingProgrammes.length})
          </h4>
          <div className="space-y-3">
            {existingProgrammes.map((prog, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${editingIndex === idx ? 'border-purple-300 bg-purple-50/20' : 'border-gray-150 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-slate-800 truncate block">
                      {prog.name}
                    </span>
                    <span className="text-xs text-gray-400 truncate block mt-0.5" dangerouslySetInnerHTML={{ __html: sanitizeHtml(prog.eligibilityHtml.substring(0, 100) + (prog.eligibilityHtml.length > 100 ? '...' : '')) }} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    onClick={() => handleMoveRow(idx, 'up')}
                    disabled={idx === 0}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-500 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRow(idx, 'down')}
                    disabled={idx === existingProgrammes.length - 1}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-500 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:pointer-events-none"
                    title="Move Down"
                  >
                    ▼
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleEditRow(idx, prog)}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                    title="Edit Programme"
                  >
                    ✏️ Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(idx)}
                    className="w-8 h-8 rounded-lg bg-white border border-rose-100 text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition"
                    title="Delete Programme"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Alert Modal */}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-red-100 flex flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            {/* Warning Icon with animated pulse glow */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-4xl mb-5 shadow-inner border border-red-100/55 animate-pulse">
              ⚠️
            </div>
            
            {/* Main Validation Message */}
            <h4 className="text-xl font-black text-red-650 m-0 leading-tight">
              {alertState.message}
            </h4>
            
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">
              Validation Failed
            </p>
            
            {/* Missing Fields list */}
            {alertState.fields.length > 0 && (
              <div className="w-full bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-left mt-5 space-y-2">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block mb-1">
                  Required Fields Remaining:
                </span>
                {alertState.fields.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {f}
                  </div>
                ))}
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setAlertState({ isOpen: false, message: '', fields: [] })}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-black text-sm transition shadow-lg hover:shadow-red-600/20 active:scale-95 border-none cursor-pointer"
            >
              Okay, Let me fix it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
