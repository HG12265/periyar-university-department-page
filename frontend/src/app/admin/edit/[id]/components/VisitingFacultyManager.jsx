'use client';

import React, { useState, useEffect } from 'react';
import { useEditDepartment } from './EditDepartmentContext';

export default function VisitingFacultyManager() {
  const {
    setView,
    visitingFacultyRows,
    setVisitingFacultyRows,
    uploading,
    handleSaveVisitingFacultyTable,
    showConfirm
  } = useEditDepartment();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
  }, [visitingFacultyRows]);

  const handleSaveVisitingFacultyTableLocal = () => {
    const newErrors = {};
    if (visitingFacultyRows.length === 0) {
      newErrors.general = 'Please add at least one row';
    }
    visitingFacultyRows.forEach((row, rowIdx) => {
      if (!row.no_visited?.trim()) {
        newErrors[`row_${rowIdx}_no_visited`] = 'No of Professors Visited is required';
      }
      if (!row.dates_visited?.trim()) {
        newErrors[`row_${rowIdx}_dates_visited`] = 'Dates Visited is required';
      }
      if (!row.professors || row.professors.length === 0) {
        newErrors[`row_${rowIdx}_professors`] = 'At least one professor detail is required';
      } else {
        row.professors.forEach((prof, profIdx) => {
          if (!prof?.trim()) {
            newErrors[`row_${rowIdx}_prof_${profIdx}`] = 'Professor Details are required';
          }
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    handleSaveVisitingFacultyTable();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 m-0">Visiting Faculty Manager</h2>
          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Manage department visiting faculty table data</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setVisitingFacultyRows(prev => [
                ...prev,
                {
                  no_visited: '',
                  dates_visited: '',
                  professors: ['']
                }
              ]);
            }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition cursor-pointer border-none shadow-md flex items-center gap-1.5"
          >
            ➕ Add New Row
          </button>
          <button
            onClick={() => setView('dashboard')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer border-none shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Rows List */}
      <div className="space-y-6">
        {visitingFacultyRows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
            <p className="text-slate-400 font-bold text-base">No visiting faculty members listed yet.</p>
            <p className="text-slate-400 text-xs mt-1">Click "+ Add New Row" to start adding visiting faculty members.</p>
          </div>
        ) : (
          visitingFacultyRows.map((row, rowIdx) => (
            <div key={rowIdx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-4">
                <span className="font-extrabold text-slate-700 text-sm uppercase tracking-wide bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                  Row #{rowIdx + 1}
                </span>
                <button
                  onClick={async () => {
                    const confirmed = await showConfirm({
                      title: 'Delete Visiting Faculty Row',
                      message: 'Are you sure you want to delete this visiting faculty row?',
                      itemName: `Row #${rowIdx + 1}`
                    });
                    if (confirmed) {
                      setVisitingFacultyRows(prev => prev.filter((_, idx) => idx !== rowIdx));
                    }
                  }}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 font-bold text-xs px-3 py-1.5 rounded-xl border-none cursor-pointer transition"
                >
                  🗑️ Delete Row
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">No of Professors Visited</label>
                  <input
                    type="text"
                    value={row.no_visited || ''}
                    onChange={(e) => {
                      const newRows = [...visitingFacultyRows];
                      newRows[rowIdx].no_visited = e.target.value;
                      setVisitingFacultyRows(newRows);
                    }}
                    className={`w-full p-3 border rounded-xl focus:outline-none bg-slate-50/50 transition-all ${errors[`row_${rowIdx}_no_visited`] ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-blue-400'}`}
                    placeholder="e.g. 03"
                  />
                  {errors[`row_${rowIdx}_no_visited`] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="text-xs">⚠️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{errors[`row_${rowIdx}_no_visited`]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Dates Visited</label>
                  <input
                    type="text"
                    value={row.dates_visited || ''}
                    onChange={(e) => {
                      const newRows = [...visitingFacultyRows];
                      newRows[rowIdx].dates_visited = e.target.value;
                      setVisitingFacultyRows(newRows);
                    }}
                    className={`w-full p-3 border rounded-xl focus:outline-none bg-slate-50/50 transition-all ${errors[`row_${rowIdx}_dates_visited`] ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-200 focus:border-blue-400'}`}
                    placeholder="e.g. 01 – 03 Feb, 2016"
                  />
                  {errors[`row_${rowIdx}_dates_visited`] && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="text-xs">⚠️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{errors[`row_${rowIdx}_dates_visited`]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professors in this Row */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Professors List ({row.professors.length})</label>
                  <button
                    onClick={() => {
                      const newRows = [...visitingFacultyRows];
                      newRows[rowIdx].professors.push('');
                      setVisitingFacultyRows(newRows);
                    }}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-bold text-xs border-none cursor-pointer transition"
                  >
                    ➕ Add Professor Details
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {row.professors.map((profText, profIdx) => {
                    const lines = (profText || '').split('\n').map(l => l.trim()).filter(Boolean);
                    const name = lines[0] || '';
                    const rest = lines.slice(1);

                    return (
                      <div key={profIdx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex-1 w-full space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professor #{profIdx + 1} Details (First line is Name/Title)</label>
                          <textarea
                            value={profText || ''}
                            onChange={(e) => {
                              const newRows = [...visitingFacultyRows];
                              newRows[rowIdx].professors[profIdx] = e.target.value;
                              setVisitingFacultyRows(newRows);
                            }}
                            className={`w-full p-3 border rounded-xl focus:outline-none min-h-[100px] bg-white text-xs leading-relaxed font-sans transition-all ${errors[`row_${rowIdx}_prof_${profIdx}`] ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/5' : 'border-slate-250 focus:border-blue-400'}`}
                            placeholder={"Prof. Name\nDesignation\nDepartment\nInstitution\nCountry"}
                          />
                          {errors[`row_${rowIdx}_prof_${profIdx}`] && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-red-655 bg-red-50/50 px-3 py-1.5 rounded-xl border border-red-100/50 w-fit animate-in fade-in slide-in-from-top-1 duration-200">
                              <span className="text-xs">⚠️</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">{errors[`row_${rowIdx}_prof_${profIdx}`]}</span>
                            </div>
                          )}
                        </div>

                        {/* Preview Card */}
                        <div className="w-full md:w-1/3 bg-white p-4 rounded-xl border border-slate-150 shadow-sm self-stretch flex flex-col justify-start">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pb-1 border-b border-slate-100">Live Preview</span>
                          {lines.length > 0 ? (
                            <div className="text-xs text-slate-700 leading-normal font-sans">
                              <strong className="text-slate-900 text-[13px]">{name}</strong>
                              {rest.map((line, lIdx) => (
                                <div key={lIdx} className="text-slate-650 mt-0.5">{line}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No details entered yet</span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (row.professors.length <= 1) {
                              alert("Must keep at least one professor in this visit!");
                              return;
                            }
                            const newRows = [...visitingFacultyRows];
                            newRows[rowIdx].professors = newRows[rowIdx].professors.filter((_, pIdx) => pIdx !== profIdx);
                            setVisitingFacultyRows(newRows);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-none font-bold text-xs p-2 rounded-lg cursor-pointer self-end md:self-start transition"
                          title="Delete Professor Details"
                        >
                          🗑&nbsp;Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {errors.general && (
        <div className="flex items-center gap-1.5 p-4 bg-red-50 text-red-655 rounded-2xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200 text-sm font-bold w-fit">
          <span>⚠️</span>
          <span>{errors.general}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSaveVisitingFacultyTableLocal}
          disabled={uploading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer border-none shadow-md disabled:bg-gray-400"
        >
          {uploading ? 'Saving Table...' : 'Save Visiting Faculty Table'}
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
