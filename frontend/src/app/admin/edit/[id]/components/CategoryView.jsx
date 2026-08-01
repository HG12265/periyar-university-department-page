'use client';

import React, { useState } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function CategoryView() {
  const {
    dept,
    activeCategory,
    setActiveSection,
    setOriginalRawContent,
    setShowTemplateBuilder,
    setIsActivitiesTableInserted,
    setActiveBuilderTab,
    setView,
    deleteSection,
    setActivityCustomTableData,
    setActivityTableTitle,
    parseHtmlTableToData,
    hasCustomManager,
    handleOpenSpecializedManager,
    handleMoveSection,
    setTableMode,
    setSectionGalleryEvents
  } = useEditDepartment();

  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerDeleteConfirm = (sec) => {
    setSectionToDelete(sec);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 10);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSectionToDelete(null);
      setIsDeleting(false);
    }, 300);
  };

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;
    setIsDeleting(true);
    await deleteSection(sectionToDelete.id);
    handleCloseModal();
  };

  const handleAddNewSection = () => {
    if (activeCategory.slug === 'facilities') {
      setActiveSection({ section_title: '', content: '', category: 'facilities' });
      setOriginalRawContent('');
      setShowTemplateBuilder(false);
      setIsActivitiesTableInserted(false);
      setActiveBuilderTab('table');
      setActivityTableTitle('');
      setActivityCustomTableData({
        headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
        rows: []
      });
      setTableMode('custom');
      setSectionGalleryEvents([]);
      handleOpenSpecializedManager('facilities');
      return;
    }
    setActiveSection({ section_title: activeCategory.name, content: '' });
    setOriginalRawContent('');
    setShowTemplateBuilder(false);
    setIsActivitiesTableInserted(false);
    setActiveBuilderTab('table');
    setActivityTableTitle('');
    setActivityCustomTableData({
      headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
      rows: []
    });
    setTableMode('custom');
    setSectionGalleryEvents([]);
    setView('editor');
  };

  const handleEditSection = (sec) => {
    setActiveSection(sec);
    setOriginalRawContent(sec.content);

    // Auto-import table structure if detected (bypasses Quill to avoid tag corruption!)
    const isAffidavitLikeSlug =
      activeCategory.slug === '#affidavit' || activeCategory.slug === 'affidavit' ||
      activeCategory.slug === '#aicte' || activeCategory.slug === 'aicte' ||
      activeCategory.slug === '#visting-professor' || activeCategory.slug === 'visting-professor' ||
      activeCategory.slug === 'visiting-faculty' ||
      activeCategory.slug === 'alumni';
    const isPdfSlug = activeCategory.slug === 'pdf' || isAffidavitLikeSlug;

    if (activeCategory.slug === 'activities' && sec.content?.startsWith('[SECTION_GALLERY]')) {
      let evts = [];
      try {
        const jsonStr = sec.content.replace('[SECTION_GALLERY]', '');
        evts = JSON.parse(jsonStr) || [];
      } catch (e) {
        console.error("Error parsing section gallery:", e);
      }
      setSectionGalleryEvents(evts);
      setActiveBuilderTab('image');
      setIsActivitiesTableInserted(false);
      setShowTemplateBuilder(true);
    } else if (
      (activeCategory.slug === 'activities' || activeCategory.slug === 'projects' || isPdfSlug) &&
      sec.content &&
      sec.content.includes('<table')
    ) {
      const parsed = parseHtmlTableToData(sec.content);
      if (parsed) {
        setActivityCustomTableData(parsed);
        setActivityTableTitle(parsed.title || '');
        setIsActivitiesTableInserted(true);
        setShowTemplateBuilder(true);
        setActiveBuilderTab('table');
        if (parsed.headers && parsed.headers[0]?.startsWith('Column 1')) {
          setTableMode('standard');
        } else {
          setTableMode('custom');
        }
      } else {
        setShowTemplateBuilder(false);
        setIsActivitiesTableInserted(false);
        setActiveBuilderTab('table');
      }
      setSectionGalleryEvents([]);
    } else {
      setShowTemplateBuilder(false);
      setIsActivitiesTableInserted(false);
      setActiveBuilderTab('table');
      setActivityTableTitle('');
      setActivityCustomTableData({
        headers: ['S.No', 'Date', 'Activity Title', 'Description', 'Details'],
        rows: []
      });
      setTableMode('custom');
      setSectionGalleryEvents([]);
    }

    setView('editor');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
        <h2 className="text-lg font-bold text-gray-700 m-0">Content Sections in {activeCategory.name}</h2>
        {(!hasCustomManager(activeCategory.slug) ||
          activeCategory.slug === 'facilities' ||
          activeCategory.slug === 'activities' ||
          !dept?.sections?.some(s => s.category === activeCategory.slug)) && (
            <button
              onClick={handleAddNewSection}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition cursor-pointer border-none"
            >
              + Add New Section
            </button>
          )}
      </div>

      {(hasCustomManager(activeCategory.slug) || activeCategory.slug === 'activities') && activeCategory.slug !== 'facilities' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-200/50 flex justify-between items-center flex-wrap gap-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl filter drop-shadow">💼</span>
            <div>
              <span className="text-sm font-bold text-blue-900 block">Specialized Manager Available!</span>
              <span className="text-xs text-blue-700/90 block mt-0.5">
                {activeCategory.slug === 'activities'
                  ? 'Manage the legacy global gallery events (Programmes, Achievements, Activities) or delete old items.'
                  : `You can manage ${activeCategory.name} using profiles, cards, spreadsheet documents, or attachments.`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenSpecializedManager(activeCategory.slug === 'activities' ? 'gallery' : activeCategory.slug)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border-none cursor-pointer shadow-md transition"
          >
            {activeCategory.slug === 'activities' ? 'Open Global Gallery Manager' : 'Open Specialized Manager'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {dept.sections
          .filter(s => s.category === activeCategory.slug)
          .map((sec, idx, arr) => {
          const isSpecializedFacilities = sec.content === '[SPECIALIZED_FACILITIES]';
          const isSpecializedFacilitiesGallery = sec.content === '[SPECIALIZED_FACILITIES_GALLERY]';
          const isSpecializedActivities = sec.content === '[SPECIALIZED_ACTIVITIES_GALLERY]';
          const isSpecialized = isSpecializedFacilities || isSpecializedActivities || isSpecializedFacilitiesGallery;
          return (
            <div key={sec.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
              <div>
                <h4 className="m-0 font-bold text-gray-800">{sec.section_title}</h4>
                <div className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">{activeCategory.name}</div>
              </div>
              <div className="flex gap-2 items-center">
                {/* Move buttons */}
                <button
                  onClick={() => handleMoveSection(sec.id, 'up')}
                  disabled={idx === 0}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 rounded-lg cursor-pointer border border-gray-200 text-xs font-bold transition-all"
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMoveSection(sec.id, 'down')}
                  disabled={idx === arr.length - 1}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 rounded-lg cursor-pointer border border-gray-200 text-xs font-bold transition-all"
                  title="Move Down"
                >
                  ▼
                </button>

                {isSpecialized ? (
                  <>
                    <button
                      onClick={() => {
                        if (isSpecializedFacilities || isSpecializedFacilitiesGallery) {
                          setActiveSection(sec);
                          setOriginalRawContent(sec.content);
                        }
                        handleOpenSpecializedManager((isSpecializedFacilities || isSpecializedFacilitiesGallery) ? 'facilities' : 'gallery');
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 transition cursor-pointer border-none shadow-sm text-xs"
                    >
                      Open Specialized Manager
                    </button>
                    <button
                      onClick={() => triggerDeleteConfirm(sec)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition cursor-pointer border-none text-xs"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (hasCustomManager(activeCategory.slug) && activeCategory.slug !== 'gallery' && activeCategory.slug !== 'activities' && activeCategory.slug !== 'alumni' && activeCategory.slug !== 'facilities') {
                          handleOpenSpecializedManager(activeCategory.slug);
                        } else if (activeCategory.slug === 'facilities') {
                          setActiveSection(sec);
                          setOriginalRawContent(sec.content);
                          
                          // Reset the spreadsheet data loader states
                          setActivityCustomTableData({ headers: [], rows: [] });
                          setActivityTableTitle('');
                          setIsActivitiesTableInserted(false);
                          
                          handleOpenSpecializedManager('facilities');
                        } else {
                          handleEditSection(sec);
                        }
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer border-none text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => triggerDeleteConfirm(sec)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition cursor-pointer border-none text-xs"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {dept.sections.filter(s => s.category === activeCategory.slug).length === 0 && (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No sections found in this category.</p>
            <button
              onClick={handleAddNewSection}
              className="text-blue-500 font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              Click here to add your first section
            </button>
          </div>
        )}
      </div>

      <button onClick={() => setView('dashboard')} className="text-gray-500 font-bold hover:text-blue-600 bg-transparent border-none cursor-pointer">
        ← Back to Dashboard
      </button>

      {/* Delete Section Confirmation Modal */}
      {sectionToDelete && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center transition-all duration-300 ease-out transform ${isModalOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Trash Warning Icon Container */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-5 shadow-inner border border-red-150 animate-pulse">
              <svg className="w-8 h-8 text-red-600 animate-in zoom-in-75 duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-800 m-0 leading-tight">
              Delete Section
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">
              Are you sure you want to delete this section?
            </p>

            {/* Section details */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center my-4 font-bold text-slate-700 truncate max-w-xs text-xs">
              {sectionToDelete.section_title}
            </div>

            {/* Buttons Row */}
            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={handleCloseModal}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition rounded-xl cursor-pointer bg-white disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-750 text-white font-bold transition rounded-xl border-none cursor-pointer shadow-sm shadow-red-500/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:bg-red-400"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
