'use client';

import React, { useState } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function EnergyParkManager() {
  const {
    setView,
    energyParkImages,
    energyParkEquipments,
    energyParkUploading,
    newEquipmentInput,
    setNewEquipmentInput,
    handleUploadEnergyParkImage,
    handleDeleteEnergyParkImage,
    handleAddEquipment,
    handleDeleteEquipment,
    handleMoveEquipment
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  const handleAddEquipmentLocal = () => {
    if (!newEquipmentInput?.trim()) {
      setErrors({ newEquipmentInput: 'Equipment Name is required' });
      return;
    }
    setErrors({});
    handleAddEquipment();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      {/* Header Card */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">Energy & Environment Park Manager</h2>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">
            Manage park photographs and list of equipments
          </p>
        </div>
        <button
          onClick={() => setView('dashboard')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Column */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 m-0">Park Photos</h3>
            <p className="text-xs text-slate-400 mt-1">Upload images (2 images per row on the live page)</p>
          </div>

          {/* Upload Image Input Card */}
          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition relative group bg-slate-50/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadEnergyParkImage}
              disabled={energyParkUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl">{energyParkUploading ? '⏳' : '🖼️'}</span>
              <span className="font-bold text-sm text-slate-600">
                {energyParkUploading ? 'Uploading...' : 'Click to Upload Photo'}
              </span>
              <span className="text-xs text-slate-400 font-medium">JPEG, PNG, WebP supported</span>
            </div>
          </div>

          {/* Images Grid */}
          {energyParkImages.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-bold text-sm">No photos uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {energyParkImages.map((imgUrl, imgIdx) => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                const backendBaseUrl = apiUrl.replace('/api', '');
                const fullImgUrl = imgUrl && imgUrl.startsWith('/api/') ? `${backendBaseUrl}${imgUrl}` : imgUrl;
                return (
                  <div key={imgIdx} className="group relative border border-slate-100 rounded-xl overflow-hidden aspect-video bg-slate-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fullImgUrl}
                      alt="Energy Park"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteEnergyParkImage(imgIdx)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full border-none cursor-pointer shadow-md transition transform hover:scale-110"
                        title="Delete Image"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Equipment List Column */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 m-0">List of Equipments</h3>
            <p className="text-xs text-slate-400 mt-1">Configure serial number and equipment titles</p>
          </div>

          {/* Add New Equipment Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newEquipmentInput}
                onChange={(e) => {
                  setNewEquipmentInput(e.target.value);
                  if (errors.newEquipmentInput) setErrors({});
                }}
                placeholder="Enter equipment name (e.g. Solar Water Pump)..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-sans text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddEquipmentLocal();
                }}
              />
              <button
                onClick={handleAddEquipmentLocal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition cursor-pointer border-none shadow-md"
              >
                Add
              </button>
            </div>
            {errors.newEquipmentInput && <p className="text-red-500 text-xs font-semibold">{errors.newEquipmentInput}</p>}
          </div>

          {/* Equipments list Table */}
          {energyParkEquipments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-bold text-sm">No equipments added yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center border-r border-slate-200">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Equipment Name
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-36 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  {energyParkEquipments.map((eq, eqIdx) => (
                    <tr key={eqIdx} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-500 text-center border-r border-slate-150">
                        {eqIdx + 1}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-700 font-sans">
                        {eq}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleMoveEquipment(eqIdx, 'up')}
                            disabled={eqIdx === 0}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-600 rounded-lg border-none cursor-pointer text-xs"
                            title="Move Up"
                          >
                            ⬆️
                          </button>
                          <button
                            onClick={() => handleMoveEquipment(eqIdx, 'down')}
                            disabled={eqIdx === energyParkEquipments.length - 1}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-600 rounded-lg border-none cursor-pointer text-xs"
                            title="Move Down"
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(eqIdx)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border-none cursor-pointer text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
