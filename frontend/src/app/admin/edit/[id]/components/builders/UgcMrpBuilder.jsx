'use client';

import React from 'react';
import { useEditDepartment } from '../EditDepartmentContext';

export default function UgcMrpBuilder() {
  const {
    ugcBuilderMode,
    setUgcBuilderMode,
    activeSection,
    setActiveSection,
    ugcFormData,
    setUgcFormData,
    uploading,
    setUploading,
    apiUrl,
    ugcTableTitle,
    setUgcTableTitle,
    ugcTableRows,
    setUgcTableRows
  } = useEditDepartment();

  const handleAppendRow = async () => {
    if (!ugcFormData.contentText?.trim() || !ugcFormData.file) {
      alert("Please fill in all the required fields before adding a row.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', ugcFormData.file);
    try {
      const base = apiUrl.replace('/api', '');
      const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      const formattedContent = ugcFormData.contentText.replace(/\n/g, '<br/>');
      const isEven = activeSection.content ? activeSection.content.split('Download').length % 2 === 0 : false;
      const rowBg = isEven ? '#f9f9f9' : '#fff';

      const newRow = `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #dee2e6;"><td style="padding: 15px 12px; color: #444; font-size: 14px; text-align: left; border: 1px solid #dee2e6; line-height: 1.6; vertical-align: top;">${formattedContent}</td><td style="padding: 15px 12px; text-align: center; border: 1px solid #dee2e6; vertical-align: middle;"><a href="${base}${data.url}" target="_blank" style="color: #cc0000; font-weight: bold; text-decoration: none; font-size: 14px; text-transform: uppercase;">Download</a></td></tr>`;

      if (activeSection.content && activeSection.content.toLowerCase().includes('</tbody>')) {
        let newContent = activeSection.content.replace(/<\/tbody>/i, newRow + '</tbody>');
        setActiveSection({ ...activeSection, content: newContent });
        setUgcFormData({ contentText: '', file: null });
        alert('✓ New UGC-MRP Row Added to Table!');
      } else {
        const template = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; border: 1px solid #dee2e6;"><tbody>${newRow}</tbody></table>`;
        setActiveSection({ ...activeSection, content: (activeSection.content || '') + template });
        setUgcFormData({ contentText: '', file: null });
        alert('✓ UGC-MRP Table Created and Row Added!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload file and add row');
    }
    setUploading(false);
  };

  const handleGenerateTable = async () => {
    if (!ugcTableTitle?.trim()) {
      alert("Please enter a title for the UGC-MRP table.");
      return;
    }
    const invalidRow = ugcTableRows.find(r => !r.contentText?.trim() || (!r.file && !r.uploadedUrl?.trim()));
    if (invalidRow) {
      alert("Please enter the content and select a PDF file for all table rows.");
      return;
    }

    setUploading(true);
    try {
      const base = apiUrl.replace('/api', '');
      const updatedRows = [...ugcTableRows];

      for (let i = 0; i < updatedRows.length; i++) {
        const row = updatedRows[i];
        if (row.file) {
          const formData = new FormData();
          formData.append('file', row.file);
          const res = await fetch(`${apiUrl}/admin/upload?folder=activities`, {
            method: 'POST',
            body: formData
          });
          if (!res.ok) throw new Error(`Upload failed for row ${i + 1}`);
          const data = await res.json();
          updatedRows[i].uploadedUrl = data.url;
          updatedRows[i].file = null;
        }
      }

      setUgcTableRows(updatedRows);

      let rowsHtml = '';
      updatedRows.forEach((row, i) => {
        const formattedContent = row.contentText.replace(/\n/g, '<br/>');
        const rowBg = i % 2 === 1 ? '#f9f9f9' : '#ffffff';
        rowsHtml += `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #dee2e6;">
          <td style="padding: 15px 12px; color: #444; font-size: 14px; text-align: left; border: 1px solid #dee2e6; line-height: 1.6; vertical-align: top;">${formattedContent}</td>
          <td style="padding: 15px 12px; text-align: center; border: 1px solid #dee2e6; vertical-align: middle;">
            <a href="${base}${row.uploadedUrl}" target="_blank" style="color: #cc0000; font-weight: bold; text-decoration: none; font-size: 14px; text-transform: uppercase;">View Document</a>
          </td>
        </tr>`;
      });

      const tableHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; border: 1px solid #dee2e6; table-layout: fixed;">
        <colgroup>
          <col style="width: 80%;" />
          <col style="width: 20%;" />
        </colgroup>
        <thead>
          <tr style="background-color: #1fa2b8;">
            <th colspan="2" style="padding: 15px 12px; background-color: #1fa2b8; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; border: none; text-transform: uppercase; letter-spacing: 0.5px;">${ugcTableTitle}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>`;

      setActiveSection({ ...activeSection, content: tableHtml });
      alert('✓ UGC-MRP Document Table generated and set in section content! Please click "Update Section" / "Create Section" to save.');
    } catch (err) {
      console.error(err);
      alert('Failed to upload files and generate table: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-indigo-50 border-dashed mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 m-0">UGC-MRP Section Builder</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Current Section: {activeSection.section_title || 'UGC-MRP'}</p>
        </div>
      </div>

      {/* Sub-tab selection for UGC-MRP Builder */}
      <div className="flex border-b border-gray-150 mb-6">
        <button
          type="button"
          onClick={() => setUgcBuilderMode('row-builder')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            ugcBuilderMode === 'row-builder'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          📁 Append Row to Content
        </button>
        <button
          type="button"
          onClick={() => setUgcBuilderMode('table-builder')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            ugcBuilderMode === 'table-builder'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          📊 Create Document Table with Header
        </button>
      </div>

      {ugcBuilderMode === 'row-builder' ? (
        <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Project Details / Content</label>
              <textarea
                value={ugcFormData.contentText ?? ''}
                onChange={(e) => setUgcFormData({ ...ugcFormData, contentText: e.target.value })}
                className="w-full p-3 text-sm border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition-all min-h-[80px]"
                placeholder="Enter project details, investigator names, funding details..."
              />
            </div>
            <div className="w-full md:w-80">
              <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Project Report PDF File</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUgcFormData({ ...ugcFormData, file: e.target.files[0] })}
                  className="flex-1 p-2 text-xs border-2 border-gray-200 rounded-lg bg-white file:bg-indigo-50 file:border-0 file:rounded file:text-xs file:font-semibold cursor-pointer"
                />
                {ugcFormData.file && (
                  <button
                    type="button"
                    onClick={() => window.open(URL.createObjectURL(ugcFormData.file))}
                    className="px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200 text-[10px] font-bold hover:bg-red-100 transition cursor-pointer"
                  >
                    PREVIEW
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAppendRow}
              disabled={uploading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:bg-gray-400 transition-all cursor-pointer shadow-lg active:scale-95 whitespace-nowrap h-[46px]"
            >
              {uploading ? 'UPLOADING...' : 'ADD ROW TO TABLE'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
            <label className="block text-xs font-bold text-indigo-900 uppercase mb-2 tracking-widest">Table Header Title (Spans both columns)</label>
            <input
              type="text"
              value={ugcTableTitle ?? ''}
              onChange={(e) => setUgcTableTitle(e.target.value)}
              className="w-full p-3 border border-indigo-200 rounded-xl focus:border-indigo-400 focus:outline-none font-bold text-gray-800 bg-white"
              placeholder="Enter Header Title (e.g. RESEARCH PROJECTS / UGC-MRP)..."
            />
          </div>

          <div className="space-y-4 animate-in fade-in">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Table Rows</label>
            {ugcTableRows.map((row, idx) => (
              <div
                key={idx}
                className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative flex flex-col md:flex-row gap-4 items-end animate-in fade-in duration-200"
              >
                {/* Row Badge */}
                <div className="absolute top-4 left-4 bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded text-[10px]">
                  ROW #{idx + 1}
                </div>

                <div className="flex-1 w-full pt-4">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1 uppercase">Project Details / Content</label>
                  <textarea
                    value={row.contentText ?? ''}
                    onChange={(e) => {
                      const newRows = [...ugcTableRows];
                      newRows[idx].contentText = e.target.value;
                      setUgcTableRows(newRows);
                    }}
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:border-indigo-450 focus:outline-none bg-white min-h-[60px]"
                    placeholder="Enter project details, investigator names..."
                  />
                </div>

                <div className="w-full md:w-80">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1 uppercase">Document PDF File</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const newRows = [...ugcTableRows];
                        newRows[idx].file = file;
                        newRows[idx].uploadedUrl = '';
                        setUgcTableRows(newRows);
                      }}
                      className="flex-1 p-2 text-xs border-2 border-gray-200 rounded-lg bg-white file:bg-indigo-50 file:border-0 file:rounded file:text-[10px] file:font-semibold cursor-pointer"
                    />
                    {row.file && (
                      <button
                        type="button"
                        onClick={() => window.open(URL.createObjectURL(row.file))}
                        className="px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200 text-[10px] font-bold hover:bg-red-100 transition cursor-pointer"
                      >
                        PREVIEW
                      </button>
                    )}
                    {row.uploadedUrl && !row.file && (
                      <button
                        type="button"
                        onClick={() => {
                          const cleanUrl = row.uploadedUrl.startsWith('/api/')
                            ? `${apiUrl.replace('/api', '')}${row.uploadedUrl}`
                            : row.uploadedUrl;
                          window.open(cleanUrl);
                        }}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-200 text-[10px] font-bold hover:bg-indigo-100 transition cursor-pointer"
                      >
                        EXISTING PDF
                      </button>
                    )}
                  </div>
                </div>

                {ugcTableRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUgcTableRows(ugcTableRows.filter((_, rIdx) => rIdx !== idx));
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-2.5 rounded-xl border border-red-150 transition cursor-pointer h-[42px] flex items-center justify-center text-xs"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setUgcTableRows([...ugcTableRows, { contentText: '', file: null, uploadedUrl: '' }]);
              }}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              + Add Row to Table
            </button>

            <button
              type="button"
              onClick={handleGenerateTable}
              disabled={uploading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:bg-gray-400 transition-all cursor-pointer shadow-md"
            >
              {uploading ? 'UPLOADING...' : 'GENERATE AND INSERT TABLE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
