'use client';

import React from 'react';
import { useEditDepartment } from '../EditDepartmentContext';
import { sanitizeHtml } from '@/utils/sanitize';

const getLinkDetails = (htmlStr) => {
  if (!htmlStr) return { url: '', text: '' };

  const hrefMatch = htmlStr.match(/href="([^"]+)"/i);
  const url = hrefMatch ? hrefMatch[1] : '';

  const textMatch = htmlStr.match(/>([^<]+)<\/a>/i);
  const text = textMatch ? textMatch[1].trim() : 'View Attachment';

  return { url, text };
};

export default function ActivitiesTableBuilder({ spreadsheetViewOnly = false } = {}) {
  const {
    id,
    dept,
    activeSection,
    setActiveSection,
    activityTableTitle,
    setActivityTableTitle,
    activitiesTableColumnInput,
    setActivitiesTableColumnInput,
    activityCustomTableData,
    setActivityCustomTableData,
    isActivitiesTableInserted,
    setIsActivitiesTableInserted,
    showTemplateBuilder,
    setShowTemplateBuilder,
    activeBuilderTab,
    setActiveBuilderTab,
    apiUrl,
    handleFinishActivitiesTable,
    uploading,
    setUploading,
    activeCategory,
    projectsPdfFile,
    setProjectsPdfFile,
    handleUploadProjectsPdf,
    existingProjectsPdfUrl,
    handleRemoveProjectsPdf,
    sectionGalleryEvents,
    setSectionGalleryEvents,
    setActiveActivityEvent,
    setActivityEventFormData,
    setView,
    showConfirm,
    tableMode,
    setTableMode,
    showPrompt,
    fetchDeptDetails
  } = useEditDepartment();

  const isBotany = dept?.slug === 'botany';
  const [yearlyGallery, setYearlyGallery] = React.useState([]);

  React.useEffect(() => {
    if (isBotany) {
      const sect = dept?.sections?.find(s => s.category === 'activities' && s.content?.startsWith('[BOTANY_YEARLY_GALLERY]'));
      if (sect) {
        try {
          const jsonStr = sect.content.replace('[BOTANY_YEARLY_GALLERY]', '');
          setYearlyGallery(JSON.parse(jsonStr) || []);
        } catch (e) {
          console.error("Error parsing Botany Yearly Gallery:", e);
          setYearlyGallery([]);
        }
      } else {
        setYearlyGallery([]);
      }
    }
  }, [dept, isBotany]);

  const [activeLinkPopup, setActiveLinkPopup] = React.useState(null);
  const [linkText, setLinkText] = React.useState('');
  const [linkUrl, setLinkUrl] = React.useState('');

  const [pdfLinkText, setPdfLinkText] = React.useState('');
  const [localPdfFile, setLocalPdfFile] = React.useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = React.useState('');

  const isAffidavitSlug =
    activeCategory?.slug === '#affidavit' || activeCategory?.slug === 'affidavit' ||
    activeCategory?.slug === '#aicte' || activeCategory?.slug === 'aicte' ||
    activeCategory?.slug === '#visting-professor' || activeCategory?.slug === 'visting-professor' ||
    activeCategory?.slug === 'visiting-faculty' ||
    activeCategory?.slug === 'alumni';

  let targetFolder = 'activities';
  if (activeCategory?.slug === 'alumni') {
    targetFolder = 'alumni';
  } else if (activeCategory?.slug === 'visiting-faculty' || activeCategory?.slug === '#visting-professor' || activeCategory?.slug === 'visting-professor') {
    targetFolder = 'faculties';
  } else if (activeCategory?.slug === 'aicte' || activeCategory?.slug === '#aicte' || activeCategory?.slug === 'affidavit' || activeCategory?.slug === '#affidavit') {
    targetFolder = 'syllabus';
  }

  React.useEffect(() => {
    if (isAffidavitSlug && activeSection?.content) {
      const match = activeSection.content.match(/href="([^"]+\.pdf)"/i);
      if (match) {
        setExistingPdfUrl(match[1]);
      } else {
        setExistingPdfUrl('');
      }
      const textMatch = activeSection.content.match(/<\/svg>\s*([^<]+)\s*<\/a>/i);
      if (textMatch) {
        setPdfLinkText(textMatch[1].trim());
      } else {
        setPdfLinkText('');
      }
    } else {
      setExistingPdfUrl('');
      setPdfLinkText('');
      setLocalPdfFile(null);
    }
  }, [activeSection, activeCategory]);

  if (spreadsheetViewOnly) {
    if (!activityCustomTableData.headers || activityCustomTableData.headers.length === 0) {
      return (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">Please add columns first before editing rows.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Render Title & Dynamic Column controls at the top of the spreadsheet in Predefined Columns mode */}
        {tableMode === 'standard' && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold block mb-1 uppercase tracking-widest">Table Title / Heading</label>
              <input
                type="text"
                value={activityTableTitle ?? ''}
                onChange={(e) => setActivityTableTitle(e.target.value)}
                placeholder="e.g. TRAINING PROGRAMMES ORGANIZED, SEMINARS CONDUCTED..."
                className="w-full p-2.5 text-xs border-2 border-gray-250 rounded-lg focus:border-amber-400 bg-white font-semibold text-gray-800"
              />
              <p className="text-[10px] text-gray-400 m-0 font-medium">No need to configure header labels. The table will remain completely headerless on the public site!</p>
            </div>

            <div className="flex gap-2 flex-wrap items-center pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wide">Columns Control ({activityCustomTableData.headers.length} Columns):</span>
              <button
                type="button"
                onClick={() => {
                  const nextNum = activityCustomTableData.headers.length + 1;
                  const colName = `Column ${nextNum}`;
                  setActivityCustomTableData(prev => ({
                    headers: [...prev.headers, colName],
                    rows: prev.rows.map(row => [...row, ''])
                  }));
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition shadow-sm flex items-center gap-1"
              >
                ➕ Add Text Column
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextNum = activityCustomTableData.headers.length + 1;
                  const colName = `Column ${nextNum} (File)`;
                  setActivityCustomTableData(prev => ({
                    headers: [...prev.headers, colName],
                    rows: prev.rows.map(row => [...row, ''])
                  }));
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer transition shadow-sm flex items-center gap-1"
              >
                📂 Add PDF/File Column
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activityCustomTableData.headers.length <= 1) {
                    alert('You must keep at least one column!');
                    return;
                  }
                  setActivityCustomTableData(prev => ({
                    headers: prev.headers.slice(0, -1),
                    rows: prev.rows.map(row => row.slice(0, -1))
                  }));
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold border border-red-200 cursor-pointer transition flex items-center gap-1"
              >
                ❌ Remove Last Column
              </button>
            </div>
          </div>
        )}

        <table className="w-full border-collapse border border-gray-250 bg-white text-sm rounded-xl overflow-hidden shadow-sm">
          {tableMode !== 'standard' && (
            <thead>
              <tr className="bg-amber-50 text-amber-900 border-b border-gray-200">
                {activityCustomTableData.headers.map((header, colIdx) => (
                  <th key={colIdx} className="p-3 border border-gray-200 font-bold text-left text-xs uppercase tracking-wider">
                    {header}
                  </th>
                ))}
                <th className="p-3 border border-gray-200 font-bold text-center text-xs uppercase tracking-wider w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-100">
            {activityCustomTableData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50/50 transition">
                {row.map((cell, colIdx) => {
                  const isFileColumn = activityCustomTableData.headers[colIdx]?.toLowerCase().includes('(file)');

                  return (
                    <td key={colIdx} className="p-2 border border-gray-200 min-w-[150px]">
                      {isFileColumn ? (
                        <div className="space-y-2 bg-gray-50/50 p-2.5 rounded-lg border border-gray-150 shadow-inner">
                          {/* Visual helper label inside standard mode */}
                          {tableMode === 'standard' && (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Column {colIdx + 1} (File)</span>
                          )}
                          {cell ? (
                            (() => {
                              const { url, text } = getLinkDetails(cell);
                              return (
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Link Display Text</label>
                                    <input
                                      type="text"
                                      value={text}
                                      onChange={(e) => {
                                        const newText = e.target.value;
                                        // Ensure standard university anchor style is preserved
                                        const updatedLink = `<a href="${url}" target="_blank" style="color: #990033; font-weight: bold; text-decoration: none;">${newText}</a>`;
                                        setActivityCustomTableData(prev => {
                                          const updatedRows = [...prev.rows];
                                          updatedRows[rowIdx] = [...updatedRows[rowIdx]];
                                          updatedRows[rowIdx][colIdx] = updatedLink;
                                          return { ...prev, rows: updatedRows };
                                        });
                                      }}
                                      placeholder="e.g. View, Winners list..."
                                      className="w-full p-1.5 text-xs border border-gray-250 rounded focus:border-amber-400 focus:outline-none bg-white font-sans font-semibold"
                                    />
                                  </div>

                                  <div className="pt-1 border-t border-gray-100/50 space-y-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Preview:</span>
                                    <div
                                      className="text-xs"
                                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(cell) }}
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Clear cell content
                                      setActivityCustomTableData(prev => {
                                        const updatedRows = [...prev.rows];
                                        updatedRows[rowIdx] = [...updatedRows[rowIdx]];
                                        updatedRows[rowIdx][colIdx] = '';
                                        return { ...prev, rows: updatedRows };
                                      });
                                    }}
                                    className="text-[10px] text-red-500 hover:text-red-750 hover:underline border-none bg-transparent cursor-pointer text-left font-bold"
                                  >
                                    ✕ Clear File
                                  </button>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="space-y-2">
                              <span className="text-[9px] text-gray-450 font-bold block mb-1 uppercase tracking-wider">Select Attachment File</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;

                                  // Prompt the user for custom link text immediately upon selecting file!
                                  const customText = await showPrompt({
                                    title: "File Attachment Display Text",
                                    message: "Enter display text for this file link (e.g. View, Winners List, Brochure):",
                                    defaultValue: "View Attachment"
                                  });
                                  if (customText === null) return; // Cancelled

                                  const formData = new FormData();
                                  formData.append('file', file);

                                  try {
                                    alert('Uploading file...');
                                    const res = await fetch(`${apiUrl}/admin/upload?folder=${targetFolder}`, {
                                      method: 'POST',
                                      body: formData
                                    });
                                    if (res.ok) {
                                      const data = await res.json();
                                      const base = apiUrl.replace('/api', '');
                                      const fileUrl = `${base}${data.url}`;
                                      const displayName = customText.trim() || 'View Attachment';
                                      const linkHtml = `<a href="${fileUrl}" target="_blank" style="color: #990033; font-weight: bold; text-decoration: none;">${displayName}</a>`;

                                      setActivityCustomTableData(prev => {
                                        const updatedRows = [...prev.rows];
                                        updatedRows[rowIdx] = [...updatedRows[rowIdx]];
                                        updatedRows[rowIdx][colIdx] = linkHtml;
                                        return { ...prev, rows: updatedRows };
                                      });
                                      alert('✓ File uploaded successfully!');
                                    } else {
                                      const errData = await res.json();
                                      alert('File upload failed: ' + (errData.detail || 'Upload failed.'));
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    alert('Error uploading file.');
                                  }
                                }}
                                className="text-[10px] text-gray-500 border border-gray-200 rounded p-1 w-full bg-gray-50 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {/* Visual helper label inside standard mode */}
                          {tableMode === 'standard' && (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Column {colIdx + 1} (Text)</span>
                          )}
                          <textarea
                            value={cell || ''}
                            rows={2}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setActivityCustomTableData(prev => {
                                const updatedRows = [...prev.rows];
                                updatedRows[rowIdx] = [...updatedRows[rowIdx]];
                                updatedRows[rowIdx][colIdx] = newVal;
                                return { ...prev, rows: updatedRows };
                              });
                            }}
                            placeholder={tableMode === 'standard' ? `Type Column ${colIdx + 1} content...` : "Type cell content..."}
                            className="w-full p-1.5 text-xs border-2 border-gray-250 rounded focus:border-amber-400 focus:outline-none bg-white resize-y min-h-[40px] font-sans"
                          />
                          {activeLinkPopup && activeLinkPopup.rowIdx === rowIdx && activeLinkPopup.colIdx === colIdx ? (
                            <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 space-y-2 mt-1 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                              <span className="text-[9px] font-bold text-amber-800 uppercase block tracking-wider">🔗 Insert Link</span>
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  placeholder="Display Word (e.g. Brochure)"
                                  value={linkText}
                                  onChange={(e) => setLinkText(e.target.value)}
                                  className="w-full p-1 text-[11px] border border-gray-200 rounded bg-white focus:outline-none focus:border-amber-400 font-sans"
                                />
                                <input
                                  type="text"
                                  placeholder="Link Address (e.g. https://...)"
                                  value={linkUrl}
                                  onChange={(e) => setLinkUrl(e.target.value)}
                                  className="w-full p-1 text-[11px] border border-gray-200 rounded bg-white focus:outline-none focus:border-amber-400 font-sans"
                                />
                              </div>
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveLinkPopup(null)}
                                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-bold rounded border-none cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!linkText?.trim() || !linkUrl?.trim()) {
                                      alert("Please enter both the link text and URL.");
                                      return;
                                    }
                                    const formattedLink = ` <a href="${linkUrl}" target="_blank" style="color: #990033; font-weight: bold; text-decoration: underline;">${linkText}</a> `;
                                    setActivityCustomTableData(prev => {
                                      const updatedRows = [...prev.rows];
                                      updatedRows[rowIdx] = [...updatedRows[rowIdx]];
                                      updatedRows[rowIdx][colIdx] = (updatedRows[rowIdx][colIdx] || '') + formattedLink;
                                      return { ...prev, rows: updatedRows };
                                    });
                                    setActiveLinkPopup(null);
                                  }}
                                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded border-none cursor-pointer"
                                >
                                  Insert
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveLinkPopup({ rowIdx, colIdx });
                                setLinkText('');
                                setLinkUrl('');
                              }}
                              className="w-full py-1 text-[10px] text-amber-700 hover:text-amber-900 font-bold bg-amber-50 hover:bg-amber-100 rounded border-none cursor-pointer transition flex items-center justify-center gap-1"
                            >
                              🔗 Insert Link
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="p-2 border border-gray-200 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Delete Row',
                        message: 'Are you sure you want to delete this table row?',
                        itemName: `Row #${rowIdx + 1}`
                      });

                      if (confirmed) {
                        setActivityCustomTableData(prev => ({
                          ...prev,
                          rows: prev.rows.filter((_, idx) => idx !== rowIdx)
                        }));
                      }
                    }}
                    className="p-1 text-red-500 hover:text-red-700 font-bold border-none bg-transparent cursor-pointer"
                    title="Delete Row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activityCustomTableData.rows.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-255">
            <p className="text-gray-400 font-bold">No rows added yet.</p>
            <button
              type="button"
              onClick={() => {
                setActivityCustomTableData(prev => ({
                  ...prev,
                  rows: [...prev.rows, Array(prev.headers.length).fill('')]
                }));
              }}
              className="text-amber-600 font-bold hover:underline bg-transparent border-none cursor-pointer mt-2 text-xs"
            >
              + Click here to add your first row
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-amber-50 border-dashed mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-amber-800 m-0">{activeCategory.name} Section Builder</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current Section: {activeCategory.name}</p>
        </div>
      </div>

      {activeCategory?.slug === 'projects' && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-5 rounded-2xl border-2 border-purple-100 mb-6 shadow-sm">
          <span className="text-sm font-bold text-purple-900 block mb-2">📁 Upload Funded Projects List (PDF)</span>
          <p className="text-xs text-purple-700/80 mb-4">Select a PDF file. Uploading it will automatically insert a beautiful "Funded Projects List" download button into this section!</p>
          <div className="flex gap-4 items-center flex-wrap">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setProjectsPdfFile(e.target.files[0])}
              className="p-2 text-xs border-2 border-purple-200 rounded-lg bg-white file:bg-purple-100 file:border-0 file:rounded file:text-xs file:font-semibold cursor-pointer"
            />
            <button
              type="button"
              onClick={handleUploadProjectsPdf}
              disabled={uploading || !projectsPdfFile}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition disabled:bg-gray-400"
            >
              {uploading ? 'UPLOADING...' : 'Upload & Link PDF'}
            </button>
          </div>
          {existingProjectsPdfUrl && (
            <div className="flex items-center gap-2 bg-green-50 text-green-800 p-3 rounded-lg border border-green-150 text-xs font-semibold mt-4">
              <span>✓ Current PDF Linked:</span>
              <a href={existingProjectsPdfUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-955 break-all font-bold">
                {existingProjectsPdfUrl.split('/').pop()}
              </a>
              <button
                type="button"
                onClick={handleRemoveProjectsPdf}
                className="ml-auto text-red-600 hover:text-red-800 font-bold border-none bg-transparent cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {isAffidavitSlug && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50/50 p-6 rounded-2xl border-2 border-teal-100 mb-6 shadow-sm space-y-4">
          <div>
            <span className="text-sm font-bold text-teal-900 block">📁Text Input / Upload PDF File</span>
            <p className="text-xs text-teal-700/80 mt-1">Provide custom button text (e.g., &quot;ANTI-RAGGING AFFIDAVIT&quot;) and upload a PDF. This will insert a beautiful interactive download button into the section.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5 tracking-wider">Button Label Text</label>
              <input
                type="text"
                placeholder="e.g. ANTI-RAGGING AFFIDAVIT"
                value={pdfLinkText}
                onChange={(e) => setPdfLinkText(e.target.value)}
                className="w-full p-2.5 text-xs border border-gray-255 rounded-lg focus:border-teal-400 focus:outline-none bg-white font-sans font-bold"
              />
            </div>

            <div className="flex gap-4 items-center flex-wrap pt-2">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-teal-800 uppercase mb-1.5 tracking-wider">Select PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setLocalPdfFile(e.target.files[0])}
                  className="p-1.5 text-xs border border-gray-200 rounded-lg bg-white w-full cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (!pdfLinkText.trim() || !localPdfFile) {
                    alert("Please enter the PDF link text and select a PDF file.");
                    return;
                  }

                  setUploading(true);
                  const formData = new FormData();
                  formData.append('file', localPdfFile);
                  formData.append('folder', targetFolder);

                  try {
                    const res = await fetch(`${apiUrl}/admin/upload?folder=${targetFolder}`, {
                      method: 'POST',
                      body: formData
                    });

                    if (res.ok) {
                      const data = await res.json();
                      const base = apiUrl.replace('/api', '');
                      const fullUrl = `${base}${data.url}`;

                      // Construct beautiful university button
                      const linkBtnHtml = `
<div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: flex-start;">
  <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background-color: #990033; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold; text-decoration: none; font-family: 'CMU Sans Serif Demi borderless', sans-serif; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    ${pdfLinkText.trim().toUpperCase()}
  </a>
</div>
                      `.trim();

                      // Clear previous link buttons of this nature if any
                      let cleanContent = activeSection.content || '';
                      cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i, '');
                      const finalContent = linkBtnHtml + "\n" + cleanContent;

                      setActiveSection({
                        ...activeSection,
                        content: finalContent
                      });
                      setExistingPdfUrl(fullUrl);
                      setLocalPdfFile(null);
                      alert('✓ Affidavit PDF successfully uploaded and button linked!');
                    } else {
                      const errData = await res.json();
                      alert('Failed to upload PDF file: ' + (errData.detail || 'Upload failed.'));
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error uploading file.');
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading || !localPdfFile}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition active:scale-95 uppercase tracking-wide mt-5"
              >
                {uploading ? 'Uploading...' : 'Upload & Create Button'}
              </button>
            </div>
          </div>

          {existingPdfUrl && (
            <div className="flex items-center gap-2 bg-green-50 text-green-800 p-3 rounded-lg border border-green-150 text-xs font-semibold">
              <span>✓ Active Affidavit PDF Linked:</span>
              <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-955 break-all font-bold">
                {existingPdfUrl.split('/').pop()}
              </a>
              <button
                type="button"
                onClick={async () => {
                  const confirmed = await showConfirm({
                    title: 'Remove Affidavit PDF',
                    message: 'Are you sure you want to remove this Affidavit PDF button link?',
                    itemName: pdfLinkText || 'Affidavit PDF'
                  });
                  if (confirmed) {
                    let cleanContent = activeSection.content || '';
                    cleanContent = cleanContent.replace(/<div[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/i, '');
                    setActiveSection({
                      ...activeSection,
                      content: cleanContent
                    });
                    setExistingPdfUrl('');
                    setLocalPdfFile(null);
                    alert('✓ PDF link removed!');
                  }
                }}
                className="ml-auto text-red-650 hover:text-red-800 font-bold border-none bg-transparent cursor-pointer"
              >
                Remove Link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab Switcher and Builder Tabs - only show if Activities category and showTemplateBuilder is true */}
      {activeCategory?.slug === 'activities' && (
        <div className="flex border-b border-gray-100 mb-6 gap-2 flex-wrap">
          {(() => {
            const tabs = [
              { id: 'table', label: '📊 Table Session', desc: 'Schedules, Seminars, Visits' },
              { id: 'image', label: '🖼️ Event Gallery', desc: 'Gallery, Media, Event Photos' }
            ];
            if (isBotany) {
              tabs.push({ id: 'yearly-gallery', label: '📅 Year-wise Gallery', desc: 'Botany Yearly Image Accordions' });
            }
            return tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveBuilderTab(tab.id)}
                className={`flex-1 min-w-[140px] text-left p-3 rounded-t-xl border-b-4 transition cursor-pointer border-0 ${activeBuilderTab === tab.id
                  ? 'bg-amber-50 border-amber-600 text-amber-800 font-bold'
                  : 'bg-white hover:bg-gray-50 border-transparent text-gray-500 font-medium'
                  }`}
              >
                <span className="text-xs block tracking-tight">{tab.label}</span>
                <span className="text-[10px] text-gray-400 block font-normal tracking-tighter uppercase">{tab.desc}</span>
              </button>
            ));
          })()}
        </div>
      )}

      {/* Tab 1: Table-based Session */}
      {((activeBuilderTab === 'table' || activeCategory?.slug === 'projects' || activeCategory?.slug === 'pdf') && !isAffidavitSlug) && (
        <div className="flex flex-col gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/50 pb-4">
            <div>
              <h4 className="text-sm font-bold text-amber-800 m-0">Dynamic Table Session Builder</h4>
              <p className="text-xs text-gray-400 mt-1 m-0">Design custom table header columns, or use a quick predefined activity table template.</p>
            </div>

            {/* Table Builder Mode Toggle Selector */}
            <div className="flex border border-amber-250 rounded-xl overflow-hidden bg-white p-1 gap-1 self-start md:self-auto shrink-0 shadow-sm">
              <button
                type="button"
                onClick={async () => {
                  if (tableMode === 'custom') return;
                  const hasData = activityCustomTableData.rows.some(row => row.some(cell => cell?.trim()));
                  if (hasData) {
                    const confirmed = await showConfirm({
                      title: 'Switch to Custom Columns',
                      message: 'Switching to Custom Columns will clear your current Predefined table data. Do you want to proceed?',
                      itemName: 'Clear Data'
                    });
                    if (!confirmed) return;
                  }
                  setTableMode('custom');
                  setIsActivitiesTableInserted(false);
                  setActivityCustomTableData({
                    headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
                    rows: []
                  });
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1 ${tableMode === 'custom' ? 'bg-amber-600 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
              >
                🛠️ Custom Columns
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (tableMode === 'standard') return;
                  const hasData = activityCustomTableData.rows.some(row => row.some(cell => cell?.trim()));
                  if (hasData) {
                    const confirmed = await showConfirm({
                      title: 'Switch to Predefined Columns',
                      message: 'Switching to Predefined Columns will clear your current Custom table data. Do you want to proceed?',
                      itemName: 'Clear Data'
                    });
                    if (!confirmed) return;
                  }
                  setTableMode('standard');
                  setIsActivitiesTableInserted(true);
                  setShowTemplateBuilder(true);
                  setActivityCustomTableData({
                    headers: ["Column 1", "Column 2", "Column 3 (File)"],
                    rows: [['', '', '']]
                  });
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1 ${tableMode === 'standard' ? 'bg-amber-600 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
              >
                ⚡ Predefined Columns (Direct)
              </button>
            </div>
          </div>

          {/* Conditional Rendering of Columns Step Based on Selected Mode */}
          {tableMode === 'standard' ? (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/30 p-5 rounded-2xl border border-amber-200/50 shadow-sm animate-in fade-in duration-300">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">⚡ Predefined Columns Mode (Direct) Active</span>
              <p className="text-xs text-amber-700 mt-1.5 mb-3 m-0 font-medium">
                The visual spreadsheet editor is now active below! You can edit the Table Title, add/remove columns, and input row data directly. No column headers will be rendered in the final published table.
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('main-table-editor-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 flex items-center gap-1 w-fit"
              >
                ⬇️ Scroll to Spreadsheet Editor
              </button>
            </div>
          ) : (
            /* Step 1: Setup Table Columns (Custom Mode) */
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Step 1: Setup Table Columns</span>

              <div className="space-y-1.5 border-b border-gray-100 pb-3">
                <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase tracking-widest">Table Title / Heading</label>
                <input
                  type="text"
                  value={activityTableTitle ?? ''}
                  onChange={(e) => setActivityTableTitle(e.target.value)}
                  placeholder="e.g. TRAINING PROGRAMMES ORGANIZED, SEMINARS CONDUCTED..."
                  className="w-full p-2.5 text-xs border-2 border-gray-250 rounded-lg focus:border-amber-400 bg-white font-semibold text-gray-800"
                />
              </div>

              <div className="flex gap-3 items-end flex-wrap md:flex-nowrap">
                <div className="flex-1 w-full min-w-[200px]">
                  <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase tracking-widest">Enter Column Name</label>
                  <input
                    type="text"
                    value={activitiesTableColumnInput ?? ''}
                    onChange={(e) => setActivitiesTableColumnInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!activitiesTableColumnInput.trim()) return;
                        setActivityCustomTableData(prev => ({
                          headers: [...prev.headers, activitiesTableColumnInput.trim()],
                          rows: prev.rows.map(row => [...row, ''])
                        }));
                        setActivitiesTableColumnInput('');
                      }
                    }}
                    placeholder="e.g. S.No, Date, Topic, Resource Person..."
                    className="w-full p-2.5 text-xs border-2 border-gray-250 rounded-lg focus:border-amber-400 bg-white"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (!activitiesTableColumnInput.trim()) {
                        alert("Please enter a column name.");
                        return;
                      }
                      setActivityCustomTableData(prev => ({
                        headers: [...prev.headers, activitiesTableColumnInput.trim()],
                        rows: prev.rows.map(row => [...row, ''])
                      }));
                      setActivitiesTableColumnInput('');
                    }}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 whitespace-nowrap"
                  >
                    + Add Text Column
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!activitiesTableColumnInput.trim()) {
                        alert("Please enter a column name.");
                        return;
                      }
                      const colName = `${activitiesTableColumnInput.trim()} (File)`;
                      setActivityCustomTableData(prev => ({
                        headers: [...prev.headers, colName],
                        rows: prev.rows.map(row => [...row, ''])
                      }));
                      setActivitiesTableColumnInput('');
                    }}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 whitespace-nowrap"
                  >
                    + Add PDF/File Column
                  </button>
                </div>
              </div>

              {/* Columns List with delete badges */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold block uppercase tracking-widest">Current Columns</label>
                <div className="flex flex-wrap gap-2 animate-in fade-in">
                  {activityCustomTableData.headers.map((header, colIdx) => (
                    <div
                      key={colIdx}
                      className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                    >
                      <span>{header}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (activityCustomTableData.headers.length <= 1) {
                            alert('You must keep at least one column!');
                            return;
                          }
                          setActivityCustomTableData(prev => ({
                            headers: prev.headers.filter((_, i) => i !== colIdx),
                            rows: prev.rows.map(row => row.filter((_, i) => i !== colIdx))
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-bold border-none bg-transparent cursor-pointer text-xs ml-1 p-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Insert into Main Editor */}
          {tableMode !== 'standard' && (
            <div className="flex justify-between items-center bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-sm">
              <div>
                <span className="text-xs font-bold text-amber-800 block">Step 2: Load Table Editor</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">
                  Click to lock columns and start editing row contents in the main editor.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activityCustomTableData.headers.length === 0) {
                    alert("Please add at least one column.");
                    return;
                  }
                  setIsActivitiesTableInserted(true);
                  setShowTemplateBuilder(true);
                  alert('✓ Table structure successfully loaded in the Main Editor below! Please scroll down to fill columns/rows.');
                }}
                className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition active:scale-95 uppercase tracking-wide"
              >
                {isActivitiesTableInserted ? 'Update Columns in Editor' : 'Insert Table into Main Editor'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Event Gallery */}
      {activeBuilderTab === 'image' && activeCategory?.slug === 'activities' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-250 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-amber-800 m-0">🖼️ Activity Gallery Events</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">
                  Add named events with multiple photos — inserts a gallery block into the section editor
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveActivityEvent(null);
                  setActivityEventFormData({ title: '', category: 'Activities', images: [] });
                  setView('activity-gallery-editor');
                }}
                className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-600 transition cursor-pointer border-none shadow-sm text-xs"
              >
                + Add New Event
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {sectionGalleryEvents.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-bold text-sm">
                  No events added yet. Click &quot;+ Add New Event&quot; to begin.
                </div>
              ) : (
                sectionGalleryEvents
                  .map((evt, idx) => ({ evt, originalIndex: idx }))
                  .map(({ evt, originalIndex }, idx) => (
                    <div key={originalIndex} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 overflow-hidden flex items-center justify-center flex-shrink-0 text-xl">
                          📸
                        </div>
                        <div>
                          <h4 className="m-0 text-sm font-bold text-gray-800">{evt.title || 'Untitled Event'}</h4>
                          <p className="m-0 text-xs text-gray-500 mt-1">{evt.images ? evt.images.length : 0} photos in gallery</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveActivityEvent({ originalIndex: originalIndex });
                            setActivityEventFormData({ ...evt });
                            setView('activity-gallery-editor');
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded transition border-none cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: 'Delete Gallery Event',
                              message: 'Are you sure you want to delete this event and all its photos?',
                              itemName: evt.title || `Event #${idx + 1}`
                            });
                            if (confirmed) {
                              const updatedEvents = sectionGalleryEvents.filter((_, i) => i !== originalIndex);
                              setSectionGalleryEvents(updatedEvents);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 font-bold text-xs rounded transition border-none cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Year-wise Gallery (Botany Only) */}
      {activeBuilderTab === 'yearly-gallery' && isBotany && activeCategory?.slug === 'activities' && (() => {
        const handleUploadMultipleImages = async (e, yearIndex) => {
          const files = Array.from(e.target.files);
          if (!files || files.length === 0) return;

          setUploading(true);
          const uploadedUrls = [];

          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'activities');

            try {
              const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, {
                method: 'POST',
                body: formData
              });
              if (res.ok) {
                const data = await res.json();
                const base = apiUrl.replace('/api', '');
                const fileUrl = `${base}${data.url}`;
                uploadedUrls.push(fileUrl);
              } else {
                console.error("Failed to upload file:", file.name);
              }
            } catch (err) {
              console.error("Error uploading file:", file.name, err);
            }
          }

          if (uploadedUrls.length > 0) {
            setYearlyGallery(prev => {
              const updated = [...prev];
              updated[yearIndex] = {
                ...updated[yearIndex],
                images: [...(updated[yearIndex].images || []), ...uploadedUrls]
              };
              return updated;
            });
            alert(`✓ Successfully uploaded ${uploadedUrls.length} image(s)!`);
          } else {
            alert("No images were uploaded successfully.");
          }
          setUploading(false);
        };

        const handleSaveYearlyGallery = async () => {
          setUploading(true);
          try {
            const existingSect = dept?.sections?.find(s => s.category === 'activities' && s.content?.startsWith('[BOTANY_YEARLY_GALLERY]'));

            const payload = {
              dept_id: parseInt(id),
              title: 'Botany Year-wise Activities Gallery',
              category: 'activities',
              content: `[BOTANY_YEARLY_GALLERY]${JSON.stringify(yearlyGallery)}`,
              order: existingSect?.order_index || 0
            };

            const method = existingSect?.id ? 'PUT' : 'POST';
            const endpoint = existingSect?.id ? `${apiUrl}/admin/sections/${existingSect.id}` : `${apiUrl}/admin/sections`;

            const res = await fetch(endpoint, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              alert('✓ Year-wise Photo Gallery saved and published successfully!');
              await fetchDeptDetails();
            } else {
              alert('Failed to save Year-wise Photo Gallery.');
            }
          } catch (err) {
            console.error("Error saving Year-wise Photo Gallery:", err);
            alert('An error occurred while saving.');
          } finally {
            setUploading(false);
          }
        };

        return (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-[#85c5e3]/10 p-5 rounded-2xl border-2 border-[#85c5e3]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-blue-900 m-0">📅 Botany Year-wise Activities Gallery</h4>
                <p className="text-xs text-blue-750/80 mt-1 m-0">Manage and publish yearly photo accordions exclusively for the Botany department portal activities tab.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    const yearName = await showPrompt({
                      title: "Add New Year Album",
                      message: "Enter the year (e.g., 2020, 2019):",
                      defaultValue: ""
                    });
                    if (!yearName || !yearName.trim()) return;
                    if (yearlyGallery.some(y => y.year === yearName.trim())) {
                      alert("This year already exists.");
                      return;
                    }
                    setYearlyGallery(prev => [...prev, { year: yearName.trim(), images: [] }]);
                  }}
                  className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 flex items-center gap-1.5"
                >
                  ➕ Add New Year
                </button>
                <button
                  type="button"
                  onClick={handleSaveYearlyGallery}
                  disabled={uploading}
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 flex items-center gap-1.5 disabled:bg-gray-400"
                >
                  💾 Save & Publish Gallery
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {yearlyGallery.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-450 font-bold text-sm">No yearly albums created yet. Click "Add New Year" to start!</p>
                </div>
              ) : (
                yearlyGallery.map((album, albumIdx) => (
                  <div key={albumIdx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-[#85c5e3]/60 transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-450 uppercase tracking-widest">Year:</span>
                        <input
                          type="text"
                          value={album.year}
                          onChange={(e) => {
                            const val = e.target.value;
                            setYearlyGallery(prev => {
                              const updated = [...prev];
                              updated[albumIdx] = { ...updated[albumIdx], year: val };
                              return updated;
                            });
                          }}
                          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 text-sm focus:outline-none focus:border-[#85c5e3] w-[120px] shadow-inner font-sans"
                          placeholder="Year (e.g. 2020)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-650 rounded-xl text-xs font-bold border border-blue-200 cursor-pointer transition flex items-center gap-1">
                          📷 Upload Photos
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadMultipleImages(e, albumIdx)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: "Delete Year Album",
                              message: `Are you sure you want to delete the entire album for ${album.year}? All uploaded photos for this year will be detached.`,
                              itemName: album.year
                            });
                            if (confirmed) {
                              setYearlyGallery(prev => prev.filter((_, idx) => idx !== albumIdx));
                            }
                          }}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold border border-red-200 cursor-pointer transition flex items-center gap-1"
                        >
                          🗑️ Delete Year
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Image Grid */}
                    {!album.images || album.images.length === 0 ? (
                      <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs font-semibold text-gray-400">
                        No photos uploaded for this year yet. Click "Upload Photos" above to add some.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {album.images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="group relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Botany Year ${album.year} Image ${imgIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={async () => {
                                  const confirmed = await showConfirm({
                                    title: "Delete Photo",
                                    message: "Are you sure you want to remove this photo from the year album?",
                                    itemName: `Photo #${imgIdx + 1}`
                                  });
                                  if (confirmed) {
                                    setYearlyGallery(prev => {
                                      const updated = [...prev];
                                      updated[albumIdx] = {
                                        ...updated[albumIdx],
                                        images: updated[albumIdx].images.filter((_, idx) => idx !== imgIdx)
                                      };
                                      return updated;
                                    });
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-red-650 hover:bg-red-750 text-white font-bold flex items-center justify-center shadow cursor-pointer border-none text-sm transition transform scale-90 group-hover:scale-100"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
