'use client';

import React, { useState } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function FinanceDetailsManager() {
  const {
    financeDetailsContent,
    setFinanceDetailsContent,
    saveFinanceDetailsContentDirectly,
    setView,
    apiUrl,
    showConfirm
  } = useEditDepartment();

  // Local state for adding a new link-to-image pair
  const [linkLabel, setLinkLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAddFinanceDetailLocal = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!linkLabel.trim()) {
      newErrors.linkLabel = 'Link Text Label is required';
    }
    if (!selectedFile) {
      newErrors.selectedFile = 'Select Document Image is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleAddFinanceDetail(e);
  };

  // Submit Handler to upload image and add it to the list
  const handleAddFinanceDetail = async (e) => {
    e.preventDefault();

    if (!linkLabel.trim() || !selectedFile) {
      alert("Please enter the link label and select a document image.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder', 'finance');

    try {
      const upRes = await fetch(`${apiUrl}/admin/upload?folder=finance`, {
        method: 'POST',
        body: formData
      });

      if (upRes.ok) {
        const upData = await upRes.json();
        
        // Append the new item to the array
        const updatedList = [
          ...financeDetailsContent,
          {
            label: linkLabel.trim(),
            image_url: upData.url
          }
        ];

        // Update local context and save directly to database
        setFinanceDetailsContent(updatedList);
        await saveFinanceDetailsContentDirectly(updatedList);

        // Reset local form states
        setLinkLabel('');
        setSelectedFile(null);
        alert('✓ Finance Detail added successfully!');
      } else {
        alert('Failed to upload the image.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading document image.');
    } finally {
      setUploading(false);
    }
  };

  // Reorder Handlers (Move Up / Down)
  const handleMove = async (idx, direction) => {
    const list = [...financeDetailsContent];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap elements
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    setFinanceDetailsContent(list);
    await saveFinanceDetailsContentDirectly(list);
  };

  // Delete Handler
  const handleDelete = async (idx) => {
    const item = financeDetailsContent[idx];
    const confirmed = await showConfirm({
      title: 'Delete Finance Document',
      message: 'Are you sure you want to delete this financial document link?',
      itemName: item.label
    });
    if (confirmed) {
      const list = financeDetailsContent.filter((_, i) => i !== idx);
      setFinanceDetailsContent(list);
      await saveFinanceDetailsContentDirectly(list);
      alert('✓ Finance Detail deleted!');
    }
  };

  // Helper to format image URLs
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiUrl.replace('/api', '')}${url}`;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">💰 Finance Details Manager</h2>
          <p className="text-xs text-slate-450 mt-1 font-bold uppercase tracking-wider">
            Configure dynamic hyperlinks that launch uploaded accounts images in new windows.
          </p>
        </div>
        <button
          onClick={() => setView('dashboard')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Input Form */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5 sticky top-6">
          <h3 className="text-base font-black text-slate-800 m-0 border-b border-slate-100 pb-3 flex items-center gap-2">
            ➕ Add New Financial Document
          </h3>

          <form onSubmit={handleAddFinanceDetailLocal} className="space-y-4">
            {/* Link Text Label */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Link Text Label *
              </label>
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="e.g. Receipt and Payment Account 2018-19"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans text-sm"
              />
              {errors.linkLabel && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.linkLabel}</p>}
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-normal">
                This is the actual clickable label text that users will see inside the tab.
              </p>
            </div>

            {/* Document Image Upload */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Select Document Image *
              </label>
              <div className="relative border-2 border-dashed border-slate-250 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-h-36 object-contain rounded-xl mx-auto border border-slate-100 shadow-sm"
                    />
                    <p className="text-xs text-indigo-650 font-bold group-hover:underline truncate max-w-[200px] mx-auto">
                      {selectedFile.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5 py-4">
                    <span className="text-4xl">📄</span>
                    <span className="font-extrabold text-sm text-slate-600">
                      Click to Upload Image
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">JPEG, PNG, WebP</span>
                  </div>
                )}
              </div>
              {errors.selectedFile && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.selectedFile}</p>}
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#990033] hover:bg-[#80002a] disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold transition cursor-pointer border-none shadow-md"
            >
              {uploading ? 'Uploading & Saving...' : 'Add Document Link'}
            </button>
          </form>
        </div>

        {/* Right Documents List */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-base font-black text-slate-700 m-0 flex items-center justify-between pb-1">
            <span>Linked Documents List</span>
            <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {financeDetailsContent.length} Total
            </span>
          </h3>

          {financeDetailsContent.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
              <span className="text-5xl block mb-4">💰</span>
              <p className="text-slate-450 font-black text-base m-0">No finance documents linked yet.</p>
              <p className="text-slate-400 text-xs mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                Add receipt accounts or dynamic balance sheets using the left builder panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {financeDetailsContent.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-slate-250 hover:shadow-md transition-all duration-200"
                >
                  {/* Image Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-150 flex-shrink-0 flex items-center justify-center relative">
                    <img
                      src={getFullImageUrl(item.image_url)}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Document Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-800 leading-snug m-0">
                      {item.label}
                    </p>
                    <a
                      href={getFullImageUrl(item.image_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline font-extrabold flex items-center gap-1 mt-1.5"
                    >
                      👁️ View Live Image
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 ml-auto items-center">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 disabled:opacity-30 rounded-lg cursor-pointer text-xs"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === financeDetailsContent.length - 1}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 disabled:opacity-30 rounded-lg cursor-pointer text-xs"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="bg-red-50 hover:bg-red-600 text-red-650 hover:text-white px-3.5 py-3 rounded-xl font-bold transition border-none cursor-pointer text-xs shadow-sm flex items-center justify-center"
                      title="Delete Link"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
