'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { ToastProvider, useToast } from '@/components/ToastContext';

function ForeignVisitsContent() {
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    faculty_email: '',
    company: '',
    purpose: '',
    dfrom: '',
    dto: '',
    agency: '',
    invitation: '',
    certificate: ''
  });

  const fetchFaculties = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/faculties-all`);
      if (res.ok) {
        const data = await res.json();
        setFaculties(data);
      }
    } catch (err) {
      console.error('Failed to fetch faculties:', err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (search.trim()) params.append('search', search.trim());
      if (filterFaculty) {
        // Resolve email to emp_id
        const fac = faculties.find(f => f.email === filterFaculty);
        if (fac && fac.emp_id) {
          params.append('emp_id', fac.emp_id);
        }
      }

      const res = await fetch(`${apiUrl}/admin/foreign-visits?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data);
        setTotal(data.total);
      } else {
        showToast('Failed to load foreign visit records.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, search, filterFaculty, faculties]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      faculty_email: '',
      company: '',
      purpose: '',
      dfrom: '',
      dto: '',
      agency: '',
      invitation: '',
      certificate: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      faculty_email: rec.faculty_email || '',
      company: rec.company || '',
      purpose: rec.purpose || '',
      dfrom: rec.dfrom || '',
      dto: rec.dto || '',
      agency: rec.agency || '',
      invitation: rec.invitation || '',
      certificate: rec.certificate || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, facultyName) => {
    if (!confirm(`Are you sure you want to delete the foreign visit record for ${facultyName || 'this faculty'}?`)) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/foreign-visits/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('✓ Record deleted successfully.');
        fetchRecords();
      } else {
        showToast('Failed to delete record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.faculty_email) {
      alert('Please select a faculty member');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const isEdit = !!editingRecord;
      const url = isEdit
        ? `${apiUrl}/admin/foreign-visits/${editingRecord.id}`
        : `${apiUrl}/admin/foreign-visits`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast(isEdit ? '✓ Record updated successfully.' : '✓ Record created successfully.');
        setIsModalOpen(false);
        fetchRecords();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to save record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const params = new URLSearchParams({ export: 'true' });
    if (search.trim()) params.append('search', search.trim());
    if (filterFaculty) {
      const fac = faculties.find(f => f.email === filterFaculty);
      if (fac && fac.emp_id) {
        params.append('emp_id', fac.emp_id);
      }
    }
    window.open(`${apiUrl}/admin/foreign-visits?${params.toString()}`, '_blank');
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#000033] tracking-tight m-0">
                Foreign Visits Management
              </h1>
              <p className="text-slate-500 text-sm mt-1 m-0">
                Log and monitor international research collaborations and official foreign visits.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold border border-slate-200 transition-all text-xs cursor-pointer shadow-sm"
              >
                📥 Export CSV
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center bg-[#000033] hover:bg-[#0b0b47] text-[#ffc107] px-5 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm border-none outline-none"
              >
                + Add Record
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Search</label>
              <input
                type="text"
                placeholder="Search by company, purpose, agency..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-800"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#000033] mb-1.5 uppercase tracking-wide">Filter by Faculty</label>
              <select
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-800"
                value={filterFaculty}
                onChange={(e) => { setFilterFaculty(e.target.value); setPage(1); }}
              >
                <option value="">All Faculty</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.email}>{f.name} ({f.department_name})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid/Table */}
          {loading ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-100 rounded w-full"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
              <span className="text-4xl block mb-3">✈️</span>
              <h3 className="text-slate-800 font-bold text-base m-0">No Foreign Visit Records Found</h3>
              <p className="text-slate-400 text-xs font-semibold mt-1 mb-0">
                Log international travel details by clicking the "+ Add Record" button.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Faculty Name</th>
                      <th className="px-6 py-4">Country / Company</th>
                      <th className="px-6 py-4">Purpose & Agency</th>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#000033] text-sm">{rec.faculty_name || 'N/A'}</div>
                          <div className="text-slate-400 font-medium text-[11px] mt-0.5">{rec.faculty_email || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Emp ID: {rec.emp_id}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-bold max-w-[200px] truncate">
                          {rec.company || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-650">
                          <div>{rec.purpose || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Agency: {rec.agency || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium font-sans">
                          {rec.dfrom || 'N/A'} to {rec.dto || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg border-none cursor-pointer font-bold transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id, rec.faculty_name)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border-none cursor-pointer font-bold transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-400 font-bold">
                  Showing Page {page} of {totalPages} ({total} total records)
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-[#000033] to-[#0b0b47] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#ffc107] m-0">
                  {editingRecord ? 'Edit Foreign Visit Record' : 'Add Foreign Visit Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border-none text-white text-base flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Select Faculty Member</label>
                <select
                  required
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                  value={formData.faculty_email}
                  onChange={(e) => setFormData({ ...formData, faculty_email: e.target.value })}
                >
                  <option value="">-- Choose Faculty --</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.email}>{f.name} ({f.department_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Country / Company / University Visited</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University, USA"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Purpose of Visit</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. To attend international conference on AI"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">From Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD or DD-MM-YYYY"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.dfrom}
                    onChange={(e) => setFormData({ ...formData, dfrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">To Date</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD or DD-MM-YYYY"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.dto}
                    onChange={(e) => setFormData({ ...formData, dto: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Funding Agency / Sponsorship</label>
                <input
                  type="text"
                  placeholder="e.g. DST, UGC, Self-funded"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                  value={formData.agency}
                  onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Invitation Details</label>
                <input
                  type="text"
                  placeholder="e.g. Letter dated 2026-04-12"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                  value={formData.invitation}
                  onChange={(e) => setFormData({ ...formData, invitation: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Certificate / Outcome Details</label>
                <input
                  type="text"
                  placeholder="e.g. Presented research paper"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                  value={formData.certificate}
                  onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-none rounded-xl cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#000033] hover:bg-[#0b0b47] text-[#ffc107] font-extrabold border-none rounded-xl shadow-md cursor-pointer text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForeignVisitsPage() {
  return (
    <ToastProvider>
      <ForeignVisitsContent />
    </ToastProvider>
  );
}
