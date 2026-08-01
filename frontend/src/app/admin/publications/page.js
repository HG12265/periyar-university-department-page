'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { ToastProvider, useToast } from '@/components/ToastContext';

function PublicationsContent() {
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
    P_type: '',
    Title: '',
    P_Name: '',
    P_Level: '',
    Author_1: '',
    Author_2: '',
    Author_3: '',
    Volume: '',
    Issue: '',
    Page_from: '',
    Page_to: '',
    Impact_F: '',
    Indexing: '',
    Publisher: '',
    P_year: '',
    P_month: '',
    DOI: '',
    Webpage: '',
    Paper: '',
    UPDATED: ''
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
        const fac = faculties.find(f => f.email === filterFaculty);
        if (fac && fac.emp_id) {
          params.append('emp_id', fac.emp_id);
        }
      }

      const res = await fetch(`${apiUrl}/admin/publications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data);
        setTotal(data.total);
      } else {
        showToast('Failed to load publication records.', 'error');
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
      P_type: '',
      Title: '',
      P_Name: '',
      P_Level: '',
      Author_1: '',
      Author_2: '',
      Author_3: '',
      Volume: '',
      Issue: '',
      Page_from: '',
      Page_to: '',
      Impact_F: '',
      Indexing: '',
      Publisher: '',
      P_year: '',
      P_month: '',
      DOI: '',
      Webpage: '',
      Paper: '',
      UPDATED: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      faculty_email: rec.faculty_email || '',
      P_type: rec.P_type || '',
      Title: rec.Title || '',
      P_Name: rec.P_Name || '',
      P_Level: rec.P_Level || '',
      Author_1: rec.Author_1 || '',
      Author_2: rec.Author_2 || '',
      Author_3: rec.Author_3 || '',
      Volume: rec.Volume || '',
      Issue: rec.Issue || '',
      Page_from: rec.Page_from || '',
      Page_to: rec.Page_to || '',
      Impact_F: rec.Impact_F || '',
      Indexing: rec.Indexing || '',
      Publisher: rec.Publisher || '',
      P_year: rec.P_year || '',
      P_month: rec.P_month || '',
      DOI: rec.DOI || '',
      Webpage: rec.Webpage || '',
      Paper: rec.Paper || '',
      UPDATED: rec.UPDATED || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, facultyName) => {
    if (!confirm(`Are you sure you want to delete the publication record for ${facultyName || 'this faculty'}?`)) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/publications/${id}`, {
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
        ? `${apiUrl}/admin/publications/${editingRecord.id}`
        : `${apiUrl}/admin/publications`;
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
    window.open(`${apiUrl}/admin/publications?${params.toString()}`, '_blank');
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
                Publications Management
              </h1>
              <p className="text-slate-500 text-sm mt-1 m-0">
                Track, add, edit, and export academic journal and conference publications.
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
                + Add Publication
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Search</label>
              <input
                type="text"
                placeholder="Search by title, publisher, authors, indexing..."
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
              <span className="text-4xl block mb-3">📚</span>
              <h3 className="text-slate-800 font-bold text-base m-0">No Publication Records Found</h3>
              <p className="text-slate-400 text-xs font-semibold mt-1 mb-0">
                Log a new publication record by clicking the "+ Add Publication" button.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Faculty Name</th>
                      <th className="px-6 py-4">Title of Paper</th>
                      <th className="px-6 py-4">Journal / Publisher</th>
                      <th className="px-6 py-4">Details</th>
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
                        <td className="px-6 py-4 text-slate-800 font-bold max-w-[200px] truncate" title={rec.Title}>
                          <div>{rec.Title || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                            By: {[rec.Author_1, rec.Author_2, rec.Author_3].filter(Boolean).join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-650">
                          <div>{rec.P_Name || rec.Publisher || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{rec.P_type || 'Journal'} ({rec.P_Level || 'International'})</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium font-sans">
                          <div>Year: {rec.P_year || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Indexing: {rec.Indexing || 'None'}</div>
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
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-[#000033] to-[#0b0b47] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#ffc107] m-0">
                  {editingRecord ? 'Edit Publication' : 'Add Publication'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Select Faculty Member</label>
                  <select
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none bg-slate-50/50"
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
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Publication Type</label>
                  <select
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none bg-slate-50/50"
                    value={formData.P_type}
                    onChange={(e) => setFormData({ ...formData, P_type: e.target.value })}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Journal">Journal Article</option>
                    <option value="Conference">Conference Paper</option>
                    <option value="Book">Book</option>
                    <option value="Book Chapter">Book Chapter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Title of Paper / Book</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A review on deep learning techniques"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                  value={formData.Title}
                  onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Journal / Publisher Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IEEE Transactions on Computers"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.P_Name}
                    onChange={(e) => setFormData({ ...formData, P_Name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Publisher Address</label>
                  <input
                    type="text"
                    placeholder="e.g. IEEE, USA"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Publisher}
                    onChange={(e) => setFormData({ ...formData, Publisher: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Author 1</label>
                  <input
                    type="text"
                    placeholder="First Author"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Author_1}
                    onChange={(e) => setFormData({ ...formData, Author_1: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Author 2</label>
                  <input
                    type="text"
                    placeholder="Second Author"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Author_2}
                    onChange={(e) => setFormData({ ...formData, Author_2: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Author 3</label>
                  <input
                    type="text"
                    placeholder="Third Author"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Author_3}
                    onChange={(e) => setFormData({ ...formData, Author_3: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Volume</label>
                  <input
                    type="text"
                    placeholder="Vol. 24"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Volume}
                    onChange={(e) => setFormData({ ...formData, Volume: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Issue</label>
                  <input
                    type="text"
                    placeholder="No. 4"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Issue}
                    onChange={(e) => setFormData({ ...formData, Issue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Page From</label>
                  <input
                    type="text"
                    placeholder="120"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Page_from}
                    onChange={(e) => setFormData({ ...formData, Page_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Page To</label>
                  <input
                    type="text"
                    placeholder="135"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Page_to}
                    onChange={(e) => setFormData({ ...formData, Page_to: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.P_year}
                    onChange={(e) => setFormData({ ...formData, P_year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Month</label>
                  <input
                    type="text"
                    placeholder="e.g. June"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.P_month}
                    onChange={(e) => setFormData({ ...formData, P_month: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Level</label>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none bg-slate-50/50"
                    value={formData.P_Level}
                    onChange={(e) => setFormData({ ...formData, P_Level: e.target.value })}
                  >
                    <option value="">-- Choose Level --</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Impact Factor</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.4"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Impact_F}
                    onChange={(e) => setFormData({ ...formData, Impact_F: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Indexing</label>
                  <input
                    type="text"
                    placeholder="e.g. Scopus, SCI, UGC"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.Indexing}
                    onChange={(e) => setFormData({ ...formData, Indexing: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">DOI</label>
                  <input
                    type="text"
                    placeholder="e.g. 10.1002/PU.123"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                    value={formData.DOI}
                    onChange={(e) => setFormData({ ...formData, DOI: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Paper Link / Webpage URL</label>
                <input
                  type="text"
                  placeholder="https://doi.org/10.1002/PU.123"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
                  value={formData.Webpage}
                  onChange={(e) => setFormData({ ...formData, Webpage: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold border-none rounded-xl cursor-pointer text-sm"
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

export default function PublicationsPage() {
  return (
    <ToastProvider>
      <PublicationsContent />
    </ToastProvider>
  );
}
