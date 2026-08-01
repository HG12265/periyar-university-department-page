'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function ActivityGalleryManager() {
  const {
    view,
    setView,
    id,
    apiUrl,
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [view, errors]);

  if (view === 'gallery-manager') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 m-0">Gallery Manager</h2>
            <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Manage department gallery events and student achievements</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveActivityEvent(null);
                setActivityEventFormData({ title: '', category: 'Programmes', images: [] });
                setView('gallery-event-editor');
              }}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-md flex items-center gap-1.5"
            >
              ➕ Add New Item
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        {/* Items List */}
        <div className="space-y-4">
          {activityGalleryEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
              <p className="text-slate-400 font-bold text-base">No gallery items found.</p>
              <p className="text-slate-450 text-xs mt-1 font-bold uppercase tracking-wider">Click &quot;+ Add New Item&quot; to get started.</p>
            </div>
          ) : (
            activityGalleryEvents
              .map((evt, idx) => ({ evt, originalIndex: idx }))
              .map(({ evt, originalIndex }, idx) => (
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
                    <div className="flex gap-2 items-center mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        evt.category === "Student's Achievements" ? 'bg-purple-100 text-purple-600' :
                        evt.category === 'Activities' ? 'bg-amber-100 text-amber-600' :
                        evt.category === 'Facilities' ? 'bg-teal-100 text-teal-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {evt.category || 'Programmes'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {evt.images ? evt.images.length : 0} photos
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
                        category: evt.category || 'Programmes',
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
                        title: 'Delete Gallery Item',
                        message: 'Are you sure you want to delete this gallery item?',
                        itemName: evt.title || `Gallery Item #${idx + 1}`
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
                    className="bg-red-50 text-red-605 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'gallery-event-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setView('gallery-manager')}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 font-bold border-none bg-transparent cursor-pointer"
          >
            ← Back to Gallery List
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
                newErrors.images = 'Event Photos are required';
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
                  setActiveActivityEvent(null);
                  setActivityEventFormData({ title: '', category: 'Programmes', images: [] });
                  setView('gallery-manager');
                  alert('✓ Gallery item saved successfully!');
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
            className="bg-amber-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer border-none shadow-md disabled:bg-gray-400"
          >
            {activityGalleryUploading ? 'Saving...' : (activeActivityEvent ? 'Update Item' : 'Save Item')}
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Title */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Title / Heading</label>
              <input
                type="text"
                value={activityEventFormData.title || ''}
                onChange={(e) => setActivityEventFormData({ ...activityEventFormData, title: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none text-sm font-medium"
                placeholder="e.g. Workshop on Energy Storage Systems"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title}</p>}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Category</label>
              <select
                value={activityEventFormData.category || 'Programmes'}
                onChange={(e) => setActivityEventFormData({ ...activityEventFormData, category: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none bg-white text-sm font-medium"
              >
                <option value="Programmes">Programmes</option>
                <option value="Student's Achievements">Student&apos;s Achievements</option>
                <option value="Activities">Activities (Legacy)</option>
                <option value="Facilities">Facilities (Legacy)</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.category}</p>}
            </div>
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
                  setActiveActivityEvent(null);
                  setActivityEventFormData({ title: '', category: 'Programmes', images: [] });
                  setView('gallery-manager');
                  alert('✓ Gallery item saved successfully!');
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
