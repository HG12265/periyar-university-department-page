'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function PlacementManager() {
  const {
    view,
    setView,
    id,
    apiUrl,
    placementTableData,
    setPlacementTableData,
    showConfirm
  } = useEditDepartment();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states for Student Card Editor
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentIndex, setEditingStudentIndex] = useState(null);
  const [editingStudent, setEditingStudent] = useState({
    sno: '',
    photo: '',
    name: '',
    designation: '',
    place: '',
    programme: '',
    year: ''
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Initialize and migrate data
  useEffect(() => {
    if (placementTableData) {
      const dbRows = placementTableData.rows || [];
      let loadedItems = [];

      // Check if rows are already stored in the new sequential block format
      const isNewFormat = dbRows.some(row => row.type && (row.type === 'student' || row.type === 'year_header' || row.type === 'image'));

      if (isNewFormat) {
        loadedItems = dbRows;
      } else if (dbRows.length > 0) {
        // Upgrade legacy rows and meeting_images to sequential items format
        const migratedItems = [];

        // Push initial academic year header if there was an old meeting title
        const oldYear = placementTableData.meeting_title || "Placement Records";
        migratedItems.push({ type: "year_header", text: oldYear });

        // Push student rows
        dbRows.forEach((row, idx) => {
          migratedItems.push({
            type: "student",
            sno: row["S.No"]?.replace('.', '') || String(idx + 1),
            photo: row["Photo"] || row["Image"] || row["pic"] || "",
            name: row["Name of the Student"] || row["Name"] || "",
            designation: row["Present designation"] || row["Designation"] || "",
            place: row["Place of work"] || row["Company"] || row["Place"] || "",
            programme: row["Programme Studied"] || row["Programme"] || "",
            year: row["Year Passed"] || row["Year"] || ""
          });
        });

        // Push meeting images as group photos
        const events = placementTableData.meeting_images || [];
        if (events.length > 0) {
          events.forEach(evt => {
            if (evt.images && evt.images.length > 0) {
              evt.images.forEach(imgUrl => {
                migratedItems.push({ type: "image", image_url: imgUrl });
              });
            }
          });
        }
        loadedItems = migratedItems;
      }

      setItems(loadedItems);
      setLoading(false);
    }
  }, [placementTableData]);

  // Image Upload Helper
  const handleUploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${apiUrl}/admin/placement/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.url; // Returns path e.g. '/uploads/...'
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    return '';
  };

  const handleStudentPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    const url = await handleUploadFile(file);
    if (url) {
      setEditingStudent(prev => ({ ...prev, photo: url }));
    }
    setUploadingFile(false);
  };

  const handleGroupPhotoUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    const url = await handleUploadFile(file);
    if (url) {
      setItems(prev => prev.map((item, idx) => idx === index ? { ...item, image_url: url } : item));
    }
    setUploadingIndex(null);
  };

  // Reordering helpers
  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[nextIndex];
    newItems[nextIndex] = temp;
    setItems(newItems);
  };

  // Item additions
  const addYearHeader = () => {
    setItems([...items, { type: 'year_header', text: 'Academic Year 2023 - 2024' }]);
  };

  const addGroupPhoto = () => {
    setItems([...items, { type: 'image', image_url: '' }]);
  };

  const openAddStudentModal = () => {
    setEditingStudentIndex(null);
    setEditingStudent({
      sno: String(items.filter(i => i.type === 'student').length + 1),
      photo: '',
      name: '',
      designation: '',
      place: '',
      programme: '',
      year: new Date().getFullYear().toString()
    });
    setShowStudentModal(true);
  };

  const openEditStudentModal = (index, studentItem) => {
    setEditingStudentIndex(index);
    setEditingStudent({ ...studentItem });
    setShowStudentModal(true);
  };

  const saveStudentModal = () => {
    if (editingStudentIndex !== null) {
      setItems(prev => prev.map((item, idx) => idx === editingStudentIndex ? { ...editingStudent, type: 'student' } : item));
    } else {
      setItems([...items, { ...editingStudent, type: 'student' }]);
    }
    setShowStudentModal(false);
  };

  const deleteItem = async (index) => {
    const item = items[index];
    const itemName = item.type === 'student' ? item.name : (item.type === 'year_header' ? item.text : 'Group Photo');
    const confirmed = await showConfirm({
      title: 'Delete Placement Block',
      message: 'Are you sure you want to delete this placement block?',
      itemName: itemName
    });
    if (confirmed) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  // Database Save
  const handleSaveAll = async () => {
    setSaving(true);

    const payload = {
      ...placementTableData,
      columns: ["S.No", "Photo", "Name of the Student", "Present designation", "Place of work", "Programme Studied", "Year Passed"],
      rows: items
    };

    try {
      const res = await fetch(`${apiUrl}/admin/placement/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPlacementTableData(payload);
        alert('Placement configuration saved successfully!');
        setView('dashboard');
      } else {
        alert('Failed to save placement settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving placement settings.');
    } finally {
      setSaving(false);
    }
  };

  const getFullImgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanApiUrl = apiUrl.replace('/api', '');
    return `${cleanApiUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 m-0 font-sans">Placement Sequence Builder</h2>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider font-sans">
            Build custom headers, student tables, and group banners in any order
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addYearHeader}
            className="bg-[#ebf0f2] text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition cursor-pointer border-none text-xs font-sans shadow-sm"
          >
            🗓️ + Add Year Header
          </button>
          <button
            onClick={openAddStudentModal}
            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none text-xs font-sans shadow-sm"
          >
            👤 + Add Student Card
          </button>
          <button
            onClick={addGroupPhoto}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 transition cursor-pointer border-none text-xs font-sans shadow-sm"
          >
            📸 + Add Group Photo
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition cursor-pointer border-none text-xs font-sans"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Sequencer List */}
      <div className="space-y-4 pr-1">
        {items.length === 0 ? (
          <div className="p-16 text-center bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-400 font-sans">
            <span className="text-4xl">📭</span>
            <p className="font-bold mt-2">No placement blocks defined.</p>
            <p className="text-xs text-gray-300">Click any of the buttons above to add tables, photos, or academic years!</p>
          </div>
        ) : (
          items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch"
              >
                {/* Visual block tag marker */}
                <div className={`w-2 flex-shrink-0 ${
                  item.type === 'year_header' ? 'bg-[#1D4ED8]' :
                  item.type === 'image' ? 'bg-teal-600' : 'bg-yellow-500'
                }`} />

                {/* Content Area */}
                <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Item Content Renderers */}
                  {item.type === 'year_header' && (
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded">Academic Year Header</span>
                      </div>
                      <input
                        type="text"
                        value={item.text || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => prev.map((it, idx) => idx === index ? { ...it, text: val } : it));
                        }}
                        className="w-full max-w-lg p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none font-bold text-gray-700 text-sm font-sans"
                        placeholder="e.g. Academic Year 2023 - 2024"
                      />
                    </div>
                  )}

                  {item.type === 'image' && (
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
                      <div className="w-full md:w-32 h-20 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative flex-shrink-0">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getFullImgUrl(item.image_url)} alt="Group Photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-300 text-2xl">📸</span>
                        )}
                        {uploadingIndex === index && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <span className="animate-spin text-teal-600 text-sm font-bold">...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase text-teal-600 tracking-wider bg-teal-50 px-2.5 py-1 rounded">Full Width Group Photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGroupPhotoUpload(index, e.target.files[0])}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-extrabold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {item.type === 'student' && (
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        {item.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getFullImgUrl(item.photo)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-300 text-xl">👤</span>
                        )}
                      </div>
                      <div>
                        <h4 className="m-0 text-sm font-bold text-gray-800 font-sans">
                          <span className="text-yellow-600 font-bold mr-1.5">[{item.sno || '?'}]</span>
                          {item.name || 'Untitled Student'}
                        </h4>
                        <p className="m-0 text-xs text-gray-500 mt-1 font-sans">
                          {item.designation || 'No Designation'} • <span className="font-bold text-indigo-600">{item.place || 'No Workplace'}</span>
                        </p>
                        <p className="m-0 text-[10px] text-gray-400 mt-1 font-sans uppercase tracking-wider font-extrabold">
                          {item.programme || 'No Program'} {item.year ? `(${item.year})` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions / Order controllers */}
                  <div className="flex items-center justify-end gap-1.5 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 font-sans">
                    {item.type === 'student' && (
                      <button
                        onClick={() => openEditStudentModal(index, item)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition border-none cursor-pointer text-xs font-bold font-sans"
                        title="Edit Student Details"
                      >
                        ✏️ Edit
                      </button>
                    )}

                    <button
                      disabled={isFirst}
                      onClick={() => moveItem(index, -1)}
                      className={`p-2 rounded-lg transition border-none cursor-pointer text-xs font-bold ${
                        isFirst ? 'text-gray-200 bg-gray-50 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Move Block Up"
                    >
                      ▲
                    </button>

                    <button
                      disabled={isLast}
                      onClick={() => moveItem(index, 1)}
                      className={`p-2 rounded-lg transition border-none cursor-pointer text-xs font-bold ${
                        isLast ? 'text-gray-200 bg-gray-50 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Move Block Down"
                    >
                      ▼
                    </button>

                    <button
                      onClick={() => deleteItem(index)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition border-none cursor-pointer text-xs font-bold"
                      title="Remove Block"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Bottom Panel */}
      <div className="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md font-sans text-sm disabled:bg-blue-400"
        >
          {saving ? 'Saving Placement Details...' : 'Save Configuration & Finish'}
        </button>
        <button
          onClick={() => setView('dashboard')}
          className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-6 py-3 rounded-xl font-bold transition cursor-pointer font-sans text-sm shadow-sm"
        >
          Discard Changes
        </button>
      </div>

      {/* Student Modal overlay */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800 m-0 font-sans">
                {editingStudentIndex !== null ? '✏️ Edit Student Placement details' : '👤 Add New Student Placement'}
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold border-none bg-transparent cursor-pointer text-lg font-sans"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">S.No (Order Number)</label>
                  <input
                    type="text"
                    value={editingStudent.sno || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, sno: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm font-sans"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Year of Passing</label>
                  <input
                    type="text"
                    value={editingStudent.year || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm font-sans"
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Name of the Student</label>
                <input
                  type="text"
                  value={editingStudent.name || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm font-sans"
                  placeholder="e.g. S. Arun Prakash"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Present Designation</label>
                <input
                  type="text"
                  value={editingStudent.designation || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, designation: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm font-sans"
                  placeholder="e.g. Software Engineer / Trainee"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Place of Work</label>
                <input
                  type="text"
                  value={editingStudent.place || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, place: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm font-sans"
                  placeholder="e.g. Ashok Leyland, Hosur"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Programme Studied</label>
                <input
                  type="text"
                  value={editingStudent.programme || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, programme: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm font-sans"
                  placeholder="e.g. M.Tech Energy Technology"
                />
              </div>

              {/* Student Photo */}
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-4 font-sans">
                <div className="w-20 h-24 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                  {editingStudent.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getFullImgUrl(editingStudent.photo)} className="w-full h-full object-cover animate-in fade-in" alt="Profile" />
                  ) : (
                    <span className="text-[10px] font-extrabold text-gray-300 font-sans uppercase">NO PHOTO</span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-wider font-sans">Upload Profile Portrait</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStudentPhotoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-extrabold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer font-sans"
                  />
                  <p className="mt-1 text-[10px] text-gray-400 font-medium tracking-tight uppercase font-sans">Recommended: Portrait/Passport Size Image</p>
                  {uploadingFile && <p className="text-xs text-blue-600 font-bold animate-pulse font-sans">Uploading photo...</p>}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-2 font-sans">
              <button
                onClick={() => setShowStudentModal(false)}
                className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2 rounded-xl font-bold transition text-xs font-sans"
              >
                Cancel
              </button>
              <button
                onClick={saveStudentModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition text-xs font-sans shadow-md border-none cursor-pointer"
              >
                Save Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
