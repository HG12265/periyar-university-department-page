'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useEditDepartment } from './EditDepartmentContext';

// Import builders
import SyllabusBuilder from './builders/SyllabusBuilder';
import ProgrammesBuilder from './builders/ProgrammesBuilder';
import UgcMrpBuilder from './builders/UgcMrpBuilder';
import JournalBuilder from './builders/JournalBuilder';
import ConferenceBuilder from './builders/ConferenceBuilder';
import ActivitiesTableBuilder from './builders/ActivitiesTableBuilder';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>
});
import 'react-quill-new/dist/quill.snow.css';
import { sanitizeHtml } from '@/utils/sanitize';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

export default function SectionEditor() {
  const {
    activeCategory,
    activeSection,
    setActiveSection,
    setView,
    originalRawContent,
    setActivityCustomTableData,
    setActivityTableTitle,
    setIsActivitiesTableInserted,
    setActiveBuilderTab,
    parseHtmlTableToData,
    handleSaveSection,
    handleFinishActivitiesTable,
    isActivitiesTableInserted,
    showTemplateBuilder,
    setShowTemplateBuilder,
    activeBuilderTab,
    setTableMode
  } = useEditDepartment();

  if (!activeCategory || !activeSection) {
    return <div className="p-8 text-center text-red-500 font-bold">No active section loaded</div>;
  }

  const isAffidavitLikeSlug = 
    activeCategory.slug === '#affidavit' || activeCategory.slug === 'affidavit' ||
    activeCategory.slug === '#aicte' || activeCategory.slug === 'aicte' ||
    activeCategory.slug === '#visting-professor' || activeCategory.slug === 'visting-professor' ||
    activeCategory.slug === 'visiting-faculty' ||
    activeCategory.slug === 'alumni';
  const isPdfSlug = activeCategory.slug === 'pdf' || isAffidavitLikeSlug;
  const isBuilderCategory = 
    activeCategory.slug === 'syllabus' || 
    activeCategory.slug === 'programmes' || 
    activeCategory.slug === 'ugc-mrp' || 
    activeCategory.slug === 'journal' || 
    activeCategory.slug === 'conference' || 
    activeCategory.slug === 'activities' || 
    activeCategory.slug === 'projects' || 
    isPdfSlug;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-150 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setView('category')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold border-none bg-transparent cursor-pointer"
        >
          ← Back to {activeCategory.name}
        </button>
        <div className="flex gap-2">
          <button onClick={handleSaveSection} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md">
            {activeSection.id ? 'Update Section' : 'Create Section'}
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className={`${isBuilderCategory ? 'block' : 'flex gap-4'}`}>
          {activeCategory.slug !== 'syllabus' && activeCategory.slug !== 'programmes' && (
            <div className="flex-1 mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Section Title (e.g., VISION)</label>
              <input
                type="text"
                value={activeSection?.section_title ?? ''}
                onChange={(e) => setActiveSection(prev => ({ ...(prev || {}), section_title: e.target.value }))}
                className="text-2xl font-bold w-full p-2 border-0 border-b-2 border-gray-100 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Enter Title..."
              />
            </div>
          )}

          <div className={`${isBuilderCategory ? 'w-full' : 'w-1/3'}`}>
            {activeCategory.slug === 'syllabus' && <SyllabusBuilder />}
            {activeCategory.slug === 'programmes' && <ProgrammesBuilder />}
            {activeCategory.slug === 'ugc-mrp' && <UgcMrpBuilder />}
            {activeCategory.slug === 'journal' && <JournalBuilder />}
            {activeCategory.slug === 'conference' && <ConferenceBuilder />}
            {(activeCategory.slug === 'activities' || activeCategory.slug === 'projects' || isPdfSlug) && <ActivitiesTableBuilder />}
            
            {!isBuilderCategory && (
              <>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Quick Templates</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => {
                    const template = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-family: Arial, sans-serif;"><thead><tr style="background-color: #f8f8f8; border-bottom: 2px solid #990033;"><th style="padding: 12px; text-align: left; width: 40%; border: 1px solid #ddd; font-weight: bold; color: #333;">PROGRAMMES</th><th style="padding: 12px; text-align: left; width: 60%; border: 1px solid #ddd; font-weight: bold; color: #333;">OFFERED</th></tr></thead><tbody><tr><td style="padding: 12px; border: 1px solid #ddd; color: #444; font-weight: 500;"><b>Programme</b></td><td style="padding: 12px; border: 1px solid #ddd; color: #444;"><b>Eligibility</b></td></tr></tbody></table>`;
                    setActiveSection({ ...activeSection, content: (activeSection.content || '') + template });
                  }} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold cursor-pointer border-none transition">+ Table Template</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="min-h-[500px]">
          {activeCategory.slug === 'programmes' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-inner overflow-x-auto min-h-[200px]">
                <style dangerouslySetInnerHTML={{ __html: `
                  .preview-programmes-table table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-top: 10px !important;
                    font-family: system-ui, -apple-system, sans-serif !important;
                  }
                  .preview-programmes-table tr {
                    border-bottom: 1px solid #eee !important;
                  }
                  .preview-programmes-table td {
                    padding: 15px 12px !important;
                    font-size: 14px !important;
                    vertical-align: top !important;
                    line-height: 1.6 !important;
                    color: #444 !important;
                  }
                  .preview-programmes-table tr:first-child td {
                    font-weight: bold !important;
                    border-bottom: 2px solid #ccc !important;
                    color: #333 !important;
                    text-transform: uppercase !important;
                  }
                ` }} />
                {activeSection.content ? (
                  <div 
                    className="w-full preview-programmes-table font-sans"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeSection.content) }} 
                  />
                ) : (
                  <div className="text-gray-400 italic text-center py-10">No programmes table created yet. Use the Programmes Builder above to start.</div>
                )}
              </div>
            </div>
          ) : ((activeCategory.slug === 'activities' && showTemplateBuilder) || activeCategory.slug === 'projects' || isPdfSlug) && activeBuilderTab === 'table' && isActivitiesTableInserted ? (
            <div id="main-table-editor-container" className="bg-white rounded-2xl border-2 border-amber-100 p-6 space-y-6 shadow-md animate-in zoom-in-95 duration-300">
              {/* Spreadsheet spreadsheet rows/actions managed by ActivitiesTableBuilder itself */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-150 flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-amber-800 m-0">📝 Main Table Editor</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Directly fill out dynamic cell contents, add/delete individual rows, and save to database.</p>
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
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    ➕ Add New Row
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishActivitiesTable}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    💾 Save & Publish Table
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-255 rounded-xl bg-gray-50 p-2">
                <ActivitiesTableBuilder spreadsheetViewOnly={true} />
              </div>
            </div>
          ) : activeCategory.slug === 'activities' && activeBuilderTab === 'image' ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 animate-in zoom-in-95 duration-300">
              <span className="text-4xl filter drop-shadow">🖼️</span>
              <p className="text-gray-700 font-extrabold text-base mt-2">Event Gallery Section Mode</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-medium leading-relaxed">
                You are editing this section as an Event Gallery. Use the &quot;Activity Gallery Events&quot; builder controls above to add, edit, or delete events and photos.
              </p>
              <p className="text-[11px] text-amber-600 mt-3 font-semibold uppercase tracking-wider bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                ⚠️ Click &quot;{activeSection?.id ? 'Save Changes & Finish' : 'Create Section & Finish'}&quot; below when done to save your gallery!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <style dangerouslySetInnerHTML={{
                __html: `
                .ql-editor table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  margin: 20px 0 !important;
                }
                .ql-editor table th {
                  background-color: #f8f9fa !important;
                  color: #333 !important;
                  font-weight: bold !important;
                  border: 1px solid #dee2e6 !important;
                  padding: 12px 10px !important;
                  font-size: 13px !important;
                  text-transform: uppercase !important;
                }
                .ql-editor table td {
                  border: 1px solid #dee2e6 !important;
                  padding: 10px !important;
                  font-size: 13px !important;
                  color: #444 !important;
                  vertical-align: top !important;
                }
              ` }} />

              {(activeCategory.slug === 'activities' || activeCategory.slug === 'projects') && originalRawContent && originalRawContent.includes('<table') && (
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
                        if (parsed.headers[0]?.startsWith('Column 1')) {
                          setTableMode('standard');
                        } else {
                          setTableMode('custom');
                        }
                        setIsActivitiesTableInserted(true);
                        setShowTemplateBuilder(true);
                        setActiveBuilderTab('table');
                        alert("✓ Successfully loaded the pushed table back into the Visual Spreadsheet Editor! Please adjust columns or rows below.");
                      } else {
                        alert("Could not parse table structure. You can edit the text directly in the editor.");
                      }
                    }}
                    className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition active:scale-95 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    ✏️ Edit Table in Spreadsheet
                  </button>
                </div>
              )}

              <ReactQuill theme="snow" modules={modules} value={activeSection?.content ?? ''} onChange={(val) => setActiveSection({ ...activeSection, content: val })} className="h-full" />
            </div>
          )}
        </div>
        
        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl">
          <button
            onClick={handleSaveSection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md font-sans text-sm"
          >
            {activeSection.id ? 'Save Changes & Finish' : 'Create Section & Finish'}
          </button>
          <button
            onClick={() => setView('category')}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer font-sans text-sm shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
