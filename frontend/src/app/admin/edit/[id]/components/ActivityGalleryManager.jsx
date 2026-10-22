'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function ActivityGalleryManager() {
  const {
    view,
    setView,
    id,
    apiUrl,
    activeCategory,
    activityGalleryEvents,
    setActivityGalleryEvents,
    sectionGalleryEvents,
    setSectionGalleryEvents,
    activeActivityEvent,
    setActiveActivityEvent,
    activityEventFormData,
    setActivityEventFormData,
    activityGalleryUploading,
    setActivityGalleryUploading,
    setActiveBuilderTab,
    showConfirm
  } = useEditDepartment();

  const isFromActivities = activeCategory?.slug === 'activities';
  const [selectedFilter, setSelectedFilter] = useState(isFromActivities ? 'Activities' : 'Programmes');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeCategory?.slug === 'activities') {
      setSelectedFilter('Activities');
    } else if (activeCategory?.slug === 'gallery') {
      setSelectedFilter('Programmes');
    }
  }, [activeCategory]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [view, errors]);

  if (view === 'gallery-manager') {
    const programmesCount = activityGalleryEvents.filter(e => {
      const c = (e.category || '').trim().toLowerCase();
      return c !== 'activities' && !c.includes('achievement');
    }).length;

    const achievementsCount = activityGalleryEvents.filter(e => {
      const c = (e.category || '').trim().toLowerCase();
      return c.includes('achievement');
    }).length;

    const activitiesCount = activityGalleryEvents.filter(e => {
      const c = (e.category || '').trim().toLowerCase();
      return c === 'activities';
    }).length;

    const isMatchFilter = (evt) => {
      const cat = (evt.category || '').trim().toLowerCase();
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'Activities') return cat === 'activities';
      if (selectedFilter === "Student's Achievements") return cat.includes('achievement');
      if (selectedFilter === 'Programmes') return cat !== 'activities' && !cat.includes('achievement');
      return true;
    };

    const filteredList = activityGalleryEvents
      .map((evt, idx) => ({ evt, originalIndex: idx }))
      .filter(({ evt }) => isMatchFilter(evt));

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        {/* Header Banner */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedFilter === 'Activities' ? '⚡' : '🖼️'}</span>
              <h2 className="text-xl font-black text-slate-800 m-0">
                {selectedFilter === 'Activities' ? 'Activities Photo Gallery' : 'Department Gallery Manager'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
              {selectedFilter === 'Activities'
                ? 'Manage event photographs displayed on the department Activities page'
                : 'Manage department gallery photos and student achievements displayed on the Gallery page'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveActivityEvent(null);
                let targetCategory = 'Programmes';
                if (selectedFilter === 'Activities' || isFromActivities) {
                  targetCategory = 'Activities';
                } else if (selectedFilter === "Student's Achievements") {
                  targetCategory = "Student's Achievements";
                }
                setActivityEventFormData({ title: '', category: targetCategory, images: [] });
                setView('gallery-event-editor');
              }}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-md flex items-center gap-1.5 text-xs uppercase tracking-wider"
            >
              ➕ Add New {selectedFilter === 'Activities' ? 'Activity Photo' : 'Gallery Item'}
            </button>
            <button
              onClick={() => {
                if (activeCategory) {
                  setView('category');
                } else {
                  setView('dashboard');
                }
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm text-xs"
            >
              ← Back to {activeCategory ? activeCategory.name : 'Dashboard'}
            </button>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedFilter('Programmes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              selectedFilter === 'Programmes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>🖼️ Gallery (Programmes)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedFilter === 'Programmes' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {programmesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter("Student's Achievements")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              selectedFilter === "Student's Achievements"
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>🏆 Student&apos;s Achievements</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedFilter === "Student's Achievements" ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {achievementsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('Activities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              selectedFilter === 'Activities'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>⚡ Activities Photos</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedFilter === 'Activities' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {activitiesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${
              selectedFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>📋 All Photos</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {activityGalleryEvents.length}
            </span>
          </button>
        </div>

        {/* Informational Guidance Banner */}
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
          selectedFilter === 'Activities'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : selectedFilter === "Student's Achievements"
            ? 'bg-purple-50/80 border-purple-200 text-purple-900'
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {selectedFilter === 'Activities' ? '⚡' : selectedFilter === "Student's Achievements" ? '🏆' : '🖼️'}
            </span>
            <span>
              {selectedFilter === 'Activities'
                ? 'Photos listed here appear exclusively in the ACTIVITIES tab on the department website.'
                : selectedFilter === "Student's Achievements"
                ? 'Photos listed here appear in the GALLERY tab under the "Student\'s Achievements" accordion.'
                : 'Photos listed here appear in the GALLERY tab under the "Programmes / Gallery" accordion.'}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
            {filteredList.length} Item(s)
          </span>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
              <p className="text-slate-400 font-bold text-base">
                No {selectedFilter === 'Activities' ? 'activities photos' : selectedFilter === "Student's Achievements" ? 'student achievement photos' : 'gallery items'} found.
              </p>
              <p className="text-slate-450 text-xs mt-1 font-bold uppercase tracking-wider">
                Click &quot;➕ Add New {selectedFilter === 'Activities' ? 'Activity Photo' : 'Gallery Item'}&quot; to upload pictures.
              </p>
            </div>
          ) : (
            filteredList.map(({ evt, originalIndex }, idx) => {
              const cat = (evt.category || '').trim().toLowerCase();
              const isAct = cat === 'activities';
              const isAch = cat.includes('achievement');
              const isFac = cat === 'facilities';

              return (
                <div key={originalIndex} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-xl flex-shrink-0">
                      {evt.images && evt.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={evt.images[0].startsWith('http') ? evt.images[0] : `${apiUrl.replace('/api', '')}${evt.images[0]}`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        '🖼️'
                      )}
                    </div>
                    <div>
                      <h4 className="m-0 text-sm font-extrabold text-slate-800">{evt.title || 'Untitled Item'}</h4>
                      <div className="flex gap-2 items-center flex-wrap mt-1.5">
                        {isAct ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                            ⚡ Activities Section
                          </span>
                        ) : isAch ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                            🏆 Gallery: Achievements
                          </span>
                        ) : isFac ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700 border border-teal-200">
                            🏢 Facilities Section
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                            🖼️ Gallery: Programmes
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          • {evt.images ? evt.images.length : 0} photos
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isAct ? '(Shows on Activities page)' : '(Shows on Gallery page)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveActivityEvent({ originalIndex: originalIndex });
                        setActivityEventFormData({
                          title: evt.title || '',
                          category: evt.category || (isAct ? 'Activities' : 'Programmes'),
                          images: evt.images || []
                        });
                        setView('gallery-event-editor');
                      }}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await showConfirm({
                          title: 'Delete Photo Album',
                          message: `Are you sure you want to delete this photo album from ${isAct ? 'Activities' : 'Gallery'}?`,
                          itemName: evt.title || `Item #${idx + 1}`
                        });
                        if (confirmed) {
                          const updatedEvents = activityGalleryEvents.filter((_, i) => i !== originalIndex);
                          try {
                            const res = await fetch(`${apiUrl}/admin/activity-gallery/${id}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ events: updatedEvents })
                            });
                            if (res.ok) {
                              setActivityGalleryEvents(updatedEvents);
                              alert('✓ Item deleted successfully!');
                            } else {
                              alert('Failed to delete item.');
                            }
                          } catch (err) {
                            alert('Error deleting item.');
                          }
                        }
                      }}
                      className="bg-red-50 text-red-650 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  if (view === 'gallery-event-editor') {
    const isActSelected = activityEventFormData.category === 'Activities';
    const isAchSelected = activityEventFormData.category === "Student's Achievements";
    const isProgSelected = !isActSelected && !isAchSelected;

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setView('gallery-manager')}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 font-bold border-none bg-transparent cursor-pointer text-xs"
          >
            ← Back to Photos List
          </button>
          <button
            onClick={async () => {
              const newErrors = {};
              if (!activityEventFormData.title?.trim()) {
                newErrors.title = 'Title / Heading is required';
              }
              if (!activityEventFormData.category?.trim()) {
                newErrors.category = 'Category is required';
              }
              if (!activityEventFormData.images || activityEventFormData.images.length === 0) {
                newErrors.images = 'At least one photo is required';
              }
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
              }
              setErrors({});

              setActivityGalleryUploading(true);
              let updatedEvents = [...activityGalleryEvents];
              if (activeActivityEvent && activeActivityEvent.originalIndex !== undefined) {
                updatedEvents[activeActivityEvent.originalIndex] = activityEventFormData;
              } else {
                updatedEvents.push(activityEventFormData);
              }
              try {
                const res = await fetch(`${apiUrl}/admin/activity-gallery/${id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ events: updatedEvents })
                });
                if (res.ok) {
                  setActivityGalleryEvents(updatedEvents);
                  const savedCat = activityEventFormData.category;
                  setActiveActivityEvent(null);
                  if (savedCat === 'Activities') {
                    setSelectedFilter('Activities');
                  } else if (savedCat === "Student's Achievements") {
                    setSelectedFilter("Student's Achievements");
                  } else {
                    setSelectedFilter('Programmes');
                  }
                  setActivityEventFormData({ title: '', category: savedCat, images: [] });
                  setView('gallery-manager');
                  alert(`✓ Photo album saved successfully! It will display in the ${savedCat === 'Activities' ? 'ACTIVITIES' : 'GALLERY'} section on the public site.`);
                } else {
                  alert('Failed to save photo album.');
                }
              } catch (err) {
                alert('Error saving photo album.');
              } finally {
                setActivityGalleryUploading(false);
              }
            }}
            disabled={activityGalleryUploading}
            className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer border-none shadow-md disabled:bg-gray-400 text-xs"
          >
            {activityGalleryUploading ? 'Saving...' : (activeActivityEvent ? 'Update Album' : 'Save Album')}
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Target Destination Section Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
              Target Section on Website (Where should these photos appear?)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActivityEventFormData({ ...activityEventFormData, category: 'Programmes' })}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                  isProgSelected
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🖼️</span>
                  <span className="font-extrabold text-sm">Gallery: Programmes</span>
                </div>
                <p className="text-[11px] text-gray-500 m-0 mt-1 font-medium">
                  Displays in the <strong>Gallery</strong> tab under Programmes accordion.
                </p>
                {isProgSelected && (
                  <span className="inline-block mt-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                    ✓ Selected (Gallery Page)
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActivityEventFormData({ ...activityEventFormData, category: "Student's Achievements" })}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                  isAchSelected
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-sm ring-2 ring-purple-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="font-extrabold text-sm">Student Achievements</span>
                </div>
                <p className="text-[11px] text-gray-500 m-0 mt-1 font-medium">
                  Displays in the <strong>Gallery</strong> tab under Student Achievements.
                </p>
                {isAchSelected && (
                  <span className="inline-block mt-2 text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold">
                    ✓ Selected (Gallery Page)
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActivityEventFormData({ ...activityEventFormData, category: 'Activities' })}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                  isActSelected
                    ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-extrabold text-sm">Activities Photos</span>
                </div>
                <p className="text-[11px] text-amber-700 m-0 mt-1 font-medium">
                  Displays in the <strong>Activities</strong> tab on the department website.
                </p>
                {isActSelected && (
                  <span className="inline-block mt-2 text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold">
                    ✓ Selected (Activities Page)
                  </span>
                )}
              </button>
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.category}</p>}
          </div>

          {/* Item Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
              Event Title / Heading
            </label>
            <input
              type="text"
              value={activityEventFormData.title || ''}
              onChange={(e) => setActivityEventFormData({ ...activityEventFormData, title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none text-sm font-medium"
              placeholder={isActSelected ? "e.g. Energy Science National Seminar 2026" : "e.g. Department Laboratory & Research Facilities"}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Upload Event Photos</label>
            <div className="p-6 border border-gray-200 border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center">
              <span className="text-3xl text-gray-300 mb-2">📸</span>
              <p className="text-xs text-gray-500 font-bold mb-1">Select one or more photographs</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  if (files.length === 0) return;
                  setActivityGalleryUploading(true);
                  const uploadedUrls = [];
                  for (const file of files) {
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const uploadRes = await fetch(`${apiUrl}/admin/activity-gallery/upload`, { method: 'POST', body: fd });
                      if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        uploadedUrls.push(uploadData.url);
                      }
                    } catch (err) { }
                  }
                  setActivityEventFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                  }));
                  setActivityGalleryUploading(false);
                }}
                className="hidden"
                id="gallery-event-images-input"
              />
              <label
                htmlFor="gallery-event-images-input"
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer mt-4 inline-block"
              >
                {activityGalleryUploading ? 'Uploading...' : 'Choose Images to Upload'}
              </label>
            </div>
            {errors.images && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.images}</p>}
          </div>

          {/* Image Grid Preview */}
          {activityEventFormData.images && activityEventFormData.images.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest font-extrabold">
                Uploaded Photos ({activityEventFormData.images.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activityEventFormData.images.map((imgUrl, imgIdx) => {
                  const base = apiUrl.replace('/api', '');
                  const fullImgUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                  return (
                    <div key={imgIdx} className="relative aspect-video rounded-lg border border-gray-200 bg-white overflow-hidden group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fullImgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setActivityEventFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== imgIdx)
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl font-sans">
          <button
            onClick={async () => {
              if (!activityEventFormData.title.trim()) { alert('Please enter a title!'); return; }
              setActivityGalleryUploading(true);
              let updatedEvents = [...activityGalleryEvents];
              if (activeActivityEvent && activeActivityEvent.originalIndex !== undefined) {
                updatedEvents[activeActivityEvent.originalIndex] = activityEventFormData;
              } else {
                updatedEvents.push(activityEventFormData);
              }
              try {
                const res = await fetch(`${apiUrl}/admin/activity-gallery/${id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ events: updatedEvents })
                });
                if (res.ok) {
                  setActivityGalleryEvents(updatedEvents);
                  const savedCat = activityEventFormData.category;
                  setActiveActivityEvent(null);
                  if (savedCat === 'Activities') {
                    setSelectedFilter('Activities');
                  } else if (savedCat === "Student's Achievements") {
                    setSelectedFilter("Student's Achievements");
                  } else {
                    setSelectedFilter('Programmes');
                  }
                  setActivityEventFormData({ title: '', category: savedCat, images: [] });
                  setView('gallery-manager');
                  alert(`✓ Photo album saved successfully! It will display in the ${savedCat === 'Activities' ? 'ACTIVITIES' : 'GALLERY'} section on the public site.`);
                } else {
                  alert('Failed to save gallery item.');
                }
              } catch (err) {
                alert('Error saving gallery item.');
              } finally {
                setActivityGalleryUploading(false);
              }
            }}
            disabled={activityGalleryUploading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans disabled:bg-gray-400"
          >
            {activityGalleryUploading ? 'Saving...' : (activeActivityEvent ? 'Update Item & Finish' : 'Save Item & Finish')}
          </button>
          <button
            onClick={() => setView('gallery-manager')}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer text-sm shadow-sm font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (view === 'activity-gallery-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => {
              setView('editor');
              setActiveBuilderTab('image');
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 font-bold border-none bg-transparent cursor-pointer"
          >
            ← Back to Section Editor
          </button>
          <button
            onClick={async () => {
              const newErrors = {};
              if (!activityEventFormData.title?.trim()) {
                newErrors.title = 'Event Title is required';
              }
              if (!activityEventFormData.images || activityEventFormData.images.length === 0) {
                newErrors.images = 'Event Photos are required';
              }
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
              }
              setErrors({});

              let updatedEvents = [...sectionGalleryEvents];
              const savedData = { ...activityEventFormData, category: 'Activities' };
              if (activeActivityEvent && activeActivityEvent.originalIndex !== undefined) {
                updatedEvents[activeActivityEvent.originalIndex] = savedData;
              } else {
                updatedEvents.push(savedData);
              }
              setSectionGalleryEvents(updatedEvents);
              setActiveActivityEvent(null);
              setActivityEventFormData({ title: '', images: [] });
              setView('editor');
              setActiveBuilderTab('image');
              alert('✓ Event saved successfully!');
            }}
            className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer border-none shadow-md"
          >
            {activeActivityEvent ? 'Update Event' : 'Save Event'}
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Event Title</label>
            <input
              type="text"
              value={activityEventFormData.title || ''}
              onChange={(e) => setActivityEventFormData({ ...activityEventFormData, title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none"
              placeholder="e.g. National Seminar on AI – 15 March 2026"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Upload Event Photos</label>
            <div className="p-6 border border-gray-200 border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center">
              <span className="text-3xl text-gray-300 mb-2">📸</span>
              <p className="text-xs text-gray-500 font-bold mb-1">Select one or more event photographs</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  if (files.length === 0) return;
                  setActivityGalleryUploading(true);
                  const uploadedUrls = [];
                  for (const file of files) {
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const uploadRes = await fetch(`${apiUrl}/admin/activity-gallery/upload`, { method: 'POST', body: fd });
                      if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        uploadedUrls.push(uploadData.url);
                      }
                    } catch (err) { }
                  }
                  setActivityEventFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                  }));
                  setActivityGalleryUploading(false);
                }}
                className="hidden"
                id="activity-event-images-input"
              />
              <label
                htmlFor="activity-event-images-input"
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer mt-4 inline-block"
              >
                {activityGalleryUploading ? 'Uploading...' : 'Choose Images to Upload'}
              </label>
            </div>
            {errors.images && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.images}</p>}
          </div>

          {/* Image Grid Preview */}
          {activityEventFormData.images && activityEventFormData.images.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest font-extrabold">Uploaded Photos ({activityEventFormData.images.length})</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activityEventFormData.images.map((imgUrl, imgIdx) => {
                  const base = apiUrl.replace('/api', '');
                  const fullImgUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                  return (
                    <div key={imgIdx} className="relative aspect-video rounded-lg border border-gray-200 bg-white overflow-hidden group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fullImgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setActivityEventFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== imgIdx)
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl font-sans">
          <button
            onClick={async () => {
              if (!activityEventFormData.title.trim()) { alert('Please enter an event title!'); return; }
              let updatedEvents = [...sectionGalleryEvents];
              const savedData = { ...activityEventFormData, category: 'Activities' };
              if (activeActivityEvent && activeActivityEvent.originalIndex !== undefined) {
                updatedEvents[activeActivityEvent.originalIndex] = savedData;
              } else {
                updatedEvents.push(savedData);
              }
              setSectionGalleryEvents(updatedEvents);
              setActiveActivityEvent(null);
              setActivityEventFormData({ title: '', images: [] });
              setView('editor');
              setActiveBuilderTab('image');
              alert('✓ Event saved successfully!');
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans"
          >
            {activeActivityEvent ? 'Update Event & Finish' : 'Save Event & Finish'}
          </button>
          <button
            onClick={() => {
              setView('editor');
              setActiveBuilderTab('image');
            }}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer text-sm shadow-sm font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
}
