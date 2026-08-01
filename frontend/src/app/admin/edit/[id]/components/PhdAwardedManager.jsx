'use client';

import React, { useState } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function PhdAwardedManager() {
  const {
    setView,
    phdAwardedRows,
    setPhdAwardedRows,
    uploading,
    handleSavePhdAwardedTable,
    showConfirm
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  const handleSavePhdLocal = () => {
    const newErrors = {};
    if (phdAwardedRows.length === 0) {
      alert("Please add at least one group.");
      return;
    }
    phdAwardedRows.forEach((group, gIdx) => {
      if (!group.year?.trim()) {
        newErrors[`group_${gIdx}_year`] = 'Academic Year is required';
      }
      if (!group.candidates || group.candidates.length === 0) {
        newErrors[`group_${gIdx}_candidates`] = 'Please add at least one candidate under this group.';
      } else {
        group.candidates.forEach((cand, cIdx) => {
          if (!cand.sno?.trim()) {
            newErrors[`cand_${gIdx}_${cIdx}_sno`] = 'S.No is required';
          }
          if (!cand.scholar_name?.trim()) {
            newErrors[`cand_${gIdx}_${cIdx}_scholar_name`] = 'Scholar Name is required';
          }
          if (!cand.supervisor?.trim()) {
            newErrors[`cand_${gIdx}_${cIdx}_supervisor`] = 'Supervisor is required';
          }
          if (!cand.award_date?.trim()) {
            newErrors[`cand_${gIdx}_${cIdx}_award_date`] = 'Date of Award is required';
          }
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill all required fields.");
      return;
    }
    setErrors({});
    handleSavePhdAwardedTable();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">Ph.D. Awarded Manager</h2>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Manage department Ph.D. awarded candidates by Academic Year groups</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPhdAwardedRows(prev => [
                ...prev,
                {
                  year: 'New Academic Year',
                  candidates: []
                }
              ]);
            }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-md flex items-center gap-1.5"
          >
            ➕ Add New Year Group
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="space-y-8">
        {phdAwardedRows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
            <p className="text-slate-400 font-bold text-base">No academic year groups found.</p>
            <p className="text-slate-450 text-xs mt-1">Click "+ Add New Year Group" to get started.</p>
          </div>
        ) : (
          phdAwardedRows.map((group, groupIdx) => (
            <div key={groupIdx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className="bg-slate-50/75 p-5 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Academic Year Bar:</label>
                    <input
                      type="text"
                      value={group.year || ''}
                      onChange={(e) => {
                        const newRows = [...phdAwardedRows];
                        newRows[groupIdx].year = e.target.value;
                        setPhdAwardedRows(newRows);
                        if (errors[`group_${groupIdx}_year`]) setErrors({ ...errors, [`group_${groupIdx}_year`]: null });
                      }}
                      className={`bg-white border px-4 py-1.5 rounded-xl text-sm font-extrabold text-[#1ca3bc] focus:outline-none transition-all ${errors[`group_${groupIdx}_year`] ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-[#1ca3bc]'}`}
                      placeholder="e.g. 2020 - 2021"
                    />
                  </div>
                  {errors[`group_${groupIdx}_year`] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200 ml-32">
                      <span className="text-xs">⚠️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{errors[`group_${groupIdx}_year`]}</span>
                    </div>
                  )}
                  {errors[`group_${groupIdx}_candidates`] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200 ml-32">
                      <span className="text-xs">⚠️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{errors[`group_${groupIdx}_candidates`]}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newRows = [...phdAwardedRows];
                      const nextSNo = newRows[groupIdx].candidates.length + 1;
                      newRows[groupIdx].candidates.push({
                        sno: `${nextSNo}`,
                        scholar_name: '',
                        supervisor: '',
                        thesis_title: '',
                        award_date: ''
                      });
                      setPhdAwardedRows(newRows);
                    }}
                    className="bg-[#1ca3bc] hover:bg-[#158ea4] text-white px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer transition shadow-sm"
                  >
                    ➕ Add Candidate
                  </button>
                  <button
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Delete Year Group',
                        message: `Are you sure you want to delete the entire year group "${group.year}" and all its candidates?`,
                        itemName: group.year
                      });
                      if (confirmed) {
                        setPhdAwardedRows(prev => prev.filter((_, idx) => idx !== groupIdx));
                      }
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-xs px-3 py-2 rounded-xl border-none cursor-pointer transition"
                  >
                    🗑️ Delete Group
                  </button>
                </div>
              </div>

              {/* Candidate Table inside Group */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left font-sans">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/20">
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[8%]">S.No</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[22%]">Scholar Name</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[22%]">Research Supervisor</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[38%]">Title of the Thesis</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-[12%]">Date of Award</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-[8%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!group.candidates || group.candidates.length === 0) ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400 font-bold text-xs italic">
                          No candidates added under this group. Click "+ Add Candidate" above.
                        </td>
                      </tr>
                    ) : (
                      group.candidates.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50/20 transition duration-150">
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.sno || ''}
                              onChange={(e) => {
                                const newRows = [...phdAwardedRows];
                                newRows[groupIdx].candidates[rowIdx].sno = e.target.value;
                                setPhdAwardedRows(newRows);
                                if (errors[`cand_${groupIdx}_${rowIdx}_sno`]) {
                                  const updated = { ...errors };
                                  delete updated[`cand_${groupIdx}_${rowIdx}_sno`];
                                  setErrors(updated);
                                }
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-400"
                            />
                            {errors[`cand_${groupIdx}_${rowIdx}_sno`] && <p className="text-red-500 text-[10px] mt-1 font-semibold m-0">{errors[`cand_${groupIdx}_${rowIdx}_sno`]}</p>}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.scholar_name || ''}
                              onChange={(e) => {
                                const newRows = [...phdAwardedRows];
                                newRows[groupIdx].candidates[rowIdx].scholar_name = e.target.value;
                                setPhdAwardedRows(newRows);
                                if (errors[`cand_${groupIdx}_${rowIdx}_scholar_name`]) {
                                  const updated = { ...errors };
                                  delete updated[`cand_${groupIdx}_${rowIdx}_scholar_name`];
                                  setErrors(updated);
                                }
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 font-semibold text-slate-800"
                              placeholder="Scholar Name"
                            />
                            {errors[`cand_${groupIdx}_${rowIdx}_scholar_name`] && <p className="text-red-500 text-[10px] mt-1 font-semibold m-0">{errors[`cand_${groupIdx}_${rowIdx}_scholar_name`]}</p>}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.supervisor || ''}
                              onChange={(e) => {
                                const newRows = [...phdAwardedRows];
                                newRows[groupIdx].candidates[rowIdx].supervisor = e.target.value;
                                setPhdAwardedRows(newRows);
                                if (errors[`cand_${groupIdx}_${rowIdx}_supervisor`]) {
                                  const updated = { ...errors };
                                  delete updated[`cand_${groupIdx}_${rowIdx}_supervisor`];
                                  setErrors(updated);
                                }
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 text-slate-600"
                              placeholder="Dr. Supervisor"
                            />
                            {errors[`cand_${groupIdx}_${rowIdx}_supervisor`] && <p className="text-red-500 text-[10px] mt-1 font-semibold m-0">{errors[`cand_${groupIdx}_${rowIdx}_supervisor`]}</p>}
                          </td>
                          <td className="p-3">
                            <textarea
                              value={row.thesis_title || ''}
                              onChange={(e) => {
                                const newRows = [...phdAwardedRows];
                                newRows[groupIdx].candidates[rowIdx].thesis_title = e.target.value;
                                setPhdAwardedRows(newRows);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 min-h-[50px] leading-relaxed text-slate-700"
                              placeholder="Title of thesis..."
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.award_date || ''}
                              onChange={(e) => {
                                const newRows = [...phdAwardedRows];
                                newRows[groupIdx].candidates[rowIdx].award_date = e.target.value;
                                setPhdAwardedRows(newRows);
                                if (errors[`cand_${groupIdx}_${rowIdx}_award_date`]) {
                                  const updated = { ...errors };
                                  delete updated[`cand_${groupIdx}_${rowIdx}_award_date`];
                                  setErrors(updated);
                                }
                              }}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 text-slate-600"
                              placeholder="e.g. 06.07.2020"
                            />
                            {errors[`cand_${groupIdx}_${rowIdx}_award_date`] && <p className="text-red-500 text-[10px] mt-1 font-semibold m-0">{errors[`cand_${groupIdx}_${rowIdx}_award_date`]}</p>}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={async () => {
                                const confirmed = await showConfirm({
                                  title: 'Delete Scholar Row',
                                  message: 'Are you sure you want to delete this scholar row?',
                                  itemName: row.scholar_name || `S.No ${row.sno}`
                                });
                                if (confirmed) {
                                  const newRows = [...phdAwardedRows];
                                  newRows[groupIdx].candidates = newRows[groupIdx].candidates.filter((_, idx) => idx !== rowIdx);
                                  newRows[groupIdx].candidates.forEach((c, idx) => {
                                    c.sno = `${idx + 1}`;
                                  });
                                  setPhdAwardedRows(newRows);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg border-none bg-transparent cursor-pointer transition active:scale-95 text-xs font-bold"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSavePhdLocal}
          disabled={uploading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md disabled:bg-gray-400"
        >
          {uploading ? 'Saving Table...' : 'Save Ph.D. Awarded Table'}
        </button>
        <button
          onClick={() => setView('dashboard')}
          className="bg-slate-150 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold transition cursor-pointer border-none"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
