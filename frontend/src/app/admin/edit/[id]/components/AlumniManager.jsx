'use client';

import React from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function AlumniManager() {
  const {
    view,
    setView,
    id,
    apiUrl,
    alumniTableData,
    setAlumniTableData,
    alumniUploading,
    setAlumniUploading,
    activeAlumni,
    setActiveAlumni,
    alumniFormData,
    setAlumniFormData,
    alumniImageFile,
    setAlumniImageFile,
    activeEvent,
    setActiveEvent,
    eventFormData,
    setEventFormData,
    handleSaveAlumniTable,
    handleSaveSingleAlumni,
    handleSaveSingleEvent,
    showConfirm
  } = useEditDepartment();

  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [view, errors]);

  const handleSaveSingleAlumniLocal = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!alumniFormData['Name of the Student']?.trim()) {
      newErrors['Name of the Student'] = 'Name of the Student is required';
    }
    if (!alumniFormData['Present designation']?.trim()) {
      newErrors['Present designation'] = 'Present designation is required';
    }
    if (!alumniFormData['Place of work']?.trim()) {
      newErrors['Place of work'] = 'Place of work is required';
    }
    if (!alumniFormData['Programme Studied']?.trim()) {
      newErrors['Programme Studied'] = 'Programme Studied is required';
    }
    if (!alumniFormData['Year Passed']?.trim()) {
      newErrors['Year Passed'] = 'Year Passed is required';
    }
    if (!alumniFormData['Photo']?.trim() && !alumniImageFile) {
      newErrors['Photo'] = 'Photo is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSaveSingleAlumni(e);
  };

  const handleSaveSingleEventLocal = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!eventFormData.title?.trim()) {
      newErrors.title = 'Event Title is required';
    }
    if (!eventFormData.images || eventFormData.images.length === 0) {
      newErrors.images = 'Event Photos are required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSaveSingleEvent(e);
  };

  if (view === 'alumni-manager') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-700 m-0">Alumni Manager</h2>
            <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">Manage department alumni</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveAlumni(null);
                setAlumniFormData({
                  'Name of the Student': '',
                  'Present designation': '',
                  'Place of work': '',
                  'Programme Studied': '',
                  'Year Passed': '',
                  'Photo': ''
                });
                setAlumniImageFile(null);
                setView('alumni-editor');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-sm"
            >
              + Add New Alumni
            </button>
            <button
              onClick={() => setView('dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-lg font-bold transition cursor-pointer border-none shadow-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Alumni List View */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 m-0">Existing Alumni</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {alumniTableData.rows.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold">
                 No alumni added yet. Click &quot;+ Add New Alumni&quot; to begin.
              </div>
            ) : (
              alumniTableData.rows.map((row, rowIdx) => {
                const apiUrlClean = apiUrl.replace('/api', '');
                const photoUrl = row['Photo'] || '';
                const fullImgUrl = photoUrl.startsWith('/api/') ? `${apiUrlClean}${photoUrl}` : photoUrl;

                return (
                  <div key={rowIdx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={fullImgUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl text-gray-300">👤</span>
                        )}
                      </div>
                      <div>
                        <h4 className="m-0 text-sm font-bold text-gray-800">{row['Name of the Student'] || 'Unknown Name'}</h4>
                        <p className="m-0 text-xs text-gray-500 mt-1">{row['Present designation']} • {row['Place of work']}</p>
                        <p className="m-0 text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{row['Programme Studied']} {row['Year Passed'] ? `(${row['Year Passed']})` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveAlumni({ originalIndex: rowIdx });
                          setAlumniFormData({ ...row });
                          setAlumniImageFile(null);
                          setView('alumni-editor');
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded transition border-none cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: 'Delete Alumni Profile',
                            message: 'Are you sure you want to delete this alumni profile?',
                            itemName: row['Name of the Student']
                          });
                          if (confirmed) {
                            setAlumniTableData(prev => {
                              const remaining = prev.rows.filter((_, idx) => idx !== rowIdx);
                              const hasSNo = prev.columns.includes('S.No');
                              const payload = {
                                ...prev,
                                rows: remaining.map((r, i) => (hasSNo ? { ...r, 'S.No': `${i + 1}.` } : r))
                              };
                              // Save it immediately
                              fetch(`${apiUrl}/admin/alumni/${id}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                              });
                              return payload;
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded transition border-none cursor-pointer"
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

        {/* Alumni Meeting Section Builder */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md mt-6">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 m-0">Meeting Gallery Events</h3>
            <button
              onClick={() => {
                setActiveEvent(null);
                setEventFormData({ title: '', images: [] });
                setView('alumni-event-editor');
              }}
              className="bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-teal-600 transition cursor-pointer border-none shadow-sm text-xs"
            >
              + Add New Event
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {(!alumniTableData.meeting_images || alumniTableData.meeting_images.length === 0) ? (
              <div className="p-8 text-center text-gray-400 font-bold">
                 No meeting events added yet. Click &quot;+ Add New Event&quot; to begin.
              </div>
            ) : (
              alumniTableData.meeting_images.map((evt, evtIdx) => (
                <div key={evtIdx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 text-xl">
                      📸
                    </div>
                    <div>
                      <h4 className="m-0 text-sm font-bold text-gray-800">{evt.title || 'Untitled Event'}</h4>
                      <p className="m-0 text-xs text-gray-500 mt-1">{evt.images ? evt.images.length : 0} photos in gallery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveEvent({ originalIndex: evtIdx });
                        setEventFormData({ ...evt });
                        setView('alumni-event-editor');
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded transition border-none cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await showConfirm({
                          title: 'Delete Meeting Event',
                          message: 'Are you sure you want to delete this meeting event?',
                          itemName: evt.title
                        });
                        if (confirmed) {
                          setAlumniTableData(prev => {
                            const payload = {
                              ...prev,
                              meeting_images: prev.meeting_images.filter((_, idx) => idx !== evtIdx)
                            };
                            fetch(`${apiUrl}/admin/alumni/${id}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(payload)
                            });
                            return payload;
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded transition border-none cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSaveAlumniTable}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md"
          >
            Save Table
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-lg font-bold transition cursor-pointer border-none"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (view === 'alumni-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setView('alumni-manager')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold border-none bg-transparent cursor-pointer">← Back to Alumni List</button>
          <button onClick={handleSaveSingleAlumniLocal} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md">
            {activeAlumni ? 'Update Alumni Details' : 'Save New Alumni'}
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Name of the Student</label>
              <input type="text" value={alumniFormData['Name of the Student'] || ''} onChange={(e) => setAlumniFormData({ ...alumniFormData, 'Name of the Student': e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. Kavimal M" />
              {errors['Name of the Student'] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors['Name of the Student']}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Present Designation</label>
              <input type="text" value={alumniFormData['Present designation'] || ''} onChange={(e) => setAlumniFormData({ ...alumniFormData, 'Present designation': e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. Designer" />
              {errors['Present designation'] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors['Present designation']}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Place of Work</label>
              <input type="text" value={alumniFormData['Place of work'] || ''} onChange={(e) => setAlumniFormData({ ...alumniFormData, 'Place of work': e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. Home Textiles Manufacturers" />
              {errors['Place of work'] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors['Place of work']}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Programme Studied</label>
              <input type="text" value={alumniFormData['Programme Studied'] || ''} onChange={(e) => setAlumniFormData({ ...alumniFormData, 'Programme Studied': e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. M.Sc. Textiles" />
              {errors['Programme Studied'] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors['Programme Studied']}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Year Passed</label>
              <input type="text" value={alumniFormData['Year Passed'] || ''} onChange={(e) => setAlumniFormData({ ...alumniFormData, 'Year Passed': e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. 2021" />
              {errors['Year Passed'] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors['Year Passed']}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Alumni Photo</label>
              <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-20 h-24 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                  {alumniImageFile ? (
                    <img src={URL.createObjectURL(alumniImageFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : alumniFormData['Photo'] ? (
                    <img src={alumniFormData['Photo'].startsWith('http') ? alumniFormData['Photo'] : `${apiUrl.replace('/api', '')}${alumniFormData['Photo']}`} className="w-full h-full object-cover" alt="Alumni" />
                  ) : (
                    <span className="text-xs font-bold text-gray-300">NO PHOTO</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAlumniImageFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="mt-1 text-[10px] text-gray-400 font-medium tracking-tight uppercase">Recommended: Portrait Image</p>
                  {errors['Photo'] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors['Photo']}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Save & Cancel Panel */}
        <div className="flex gap-4 p-5 bg-gray-50 border-t border-gray-100 justify-end rounded-b-2xl font-sans">
          <button
            onClick={handleSaveSingleAlumni}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans"
          >
            {activeAlumni ? 'Update Alumni Details & Finish' : 'Save Alumni & Finish'}
          </button>
          <button
            onClick={() => setView('alumni-manager')}
            className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer text-sm shadow-sm font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (view === 'alumni-event-editor') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setView('alumni-manager')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold border-none bg-transparent cursor-pointer">← Back to Event List</button>
          <button onClick={handleSaveSingleEventLocal} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md">
            {activeEvent ? 'Update Event Details' : 'Save New Event'}
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Event Header Title</label>
            <input type="text" value={eventFormData.title || ''} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none" placeholder="e.g. Alumni Meeting on 03/03/2023" />
            {errors.title && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Upload Meeting Images</label>
            <div className="p-6 border border-gray-200 border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center">
              <span className="text-3xl text-gray-300 mb-2">📸</span>
              <p className="text-xs text-gray-500 font-bold mb-1">Select one or more meeting photographs</p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  if (files.length === 0) return;
                  setAlumniUploading(true);
                  const uploadedUrls = [];
                  for (const file of files) {
                     const formData = new FormData();
                     formData.append('file', file);
                     try {
                       const uploadRes = await fetch(`${apiUrl}/admin/alumni/upload`, {
                         method: 'POST',
                         body: formData
                       });
                       if (uploadRes.ok) {
                         const uploadData = await uploadRes.json();
                         uploadedUrls.push(uploadData.url);
                       } else {
                         const errData = await uploadRes.json();
                         alert(`Failed to upload ${file.name}: ${errData.detail || 'Upload failed'}`);
                       }
                     } catch (err) { }
                  }
                  setEventFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                  }));
                  setAlumniUploading(false);
                }}
                className="hidden"
                id="event-images-file-input"
              />
              <label
                htmlFor="event-images-file-input"
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer mt-4 inline-block"
              >
                {alumniUploading ? 'Uploading...' : 'Choose Images to Upload'}
              </label>
            </div>
            {errors.images && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.images}</p>}
          </div>

          {eventFormData.images && eventFormData.images.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Current Gallery Images for this Event</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {eventFormData.images.map((imgUrl, imgIdx) => {
                  const apiUrlClean = apiUrl.replace('/api', '');
                  const fullImgUrl = imgUrl.startsWith('/api/') ? `${apiUrlClean}${imgUrl}` : imgUrl;
                  return (
                    <div key={imgIdx} className="relative aspect-video rounded-lg border border-gray-200 bg-white overflow-hidden group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fullImgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setEventFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, idx) => idx !== imgIdx)
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer shadow-md opacity-90 transition-opacity"
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
            onClick={handleSaveSingleEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md text-sm font-sans"
          >
            {activeEvent ? 'Update Event & Finish' : 'Save Event & Finish'}
          </button>
          <button
            onClick={() => setView('alumni-manager')}
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
