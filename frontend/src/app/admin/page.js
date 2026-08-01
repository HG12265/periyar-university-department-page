'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

const getDeptIcon = (name) => {
  const n = name ? name.toLowerCase() : '';
  if (n.includes('computer') || n.includes('information')) return '💻';
  if (n.includes('biochem') || n.includes('microbiol') || n.includes('biotech')) return '🧬';
  if (n.includes('chemistry')) return '🧪';
  if (n.includes('physics')) return '⚛️';
  if (n.includes('math') || n.includes('stat')) return '📐';
  if (n.includes('geology')) return '⛰️';
  if (n.includes('environmental') || n.includes('energy')) return '🌱';
  if (n.includes('botany')) return '🌿';
  if (n.includes('zoology')) return '🦁';
  if (n.includes('commerce') || n.includes('economics')) return '📈';
  if (n.includes('management')) return '💼';
  if (n.includes('english') || n.includes('tamil') || n.includes('journalism')) return '✍️';
  if (n.includes('education')) return '🎓';
  if (n.includes('nutrition') || n.includes('food') || n.includes('diet')) return '🍎';
  if (n.includes('textiles') || n.includes('apparel')) return '🧵';
  if (n.includes('sociology') || n.includes('psychology')) return '🧠';
  if (n.includes('history')) return '⏳';
  return '🏛️';
};

export default function AdminDashboard() {
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_publications: 0, total_foreign_visits: 0, total_events_organized: 0 });

  // Add Department Pop-up States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: '', slug: '', title: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slugify Helper
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start
      .replace(/-+$/, '');            // Trim - from end
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const slugVal = slugify(nameVal);
    const titleVal = nameVal ? `DEPARTMENT OF ${nameVal.toUpperCase()}` : '';
    setAddFormData({
      ...addFormData,
      name: nameVal,
      slug: slugVal,
      title: titleVal
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.slug) {
      alert('Please fill in Department Name and Slug');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const queryParams = new URLSearchParams({
        name: addFormData.name.trim(),
        slug: addFormData.slug.toLowerCase().trim(),
        title: addFormData.title.trim() || `DEPARTMENT OF ${addFormData.name.toUpperCase().trim()}`
      }).toString();

      const res = await fetch(`${apiUrl}/admin/departments?${queryParams}`, {
        method: 'POST'
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setAddFormData({ name: '', slug: '', title: '' });
        fetchDepartments();
      } else {
        alert('Failed to add department. Slug might be already taken.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/list-departments`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/dashboard-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };
 
  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to completely delete the Department of ${name}? All associated sections, faculties, and alumni tables will be permanently deleted.`)) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/departments/${id}`, { 
        method: 'DELETE'
      });
      if (res.ok) fetchDepartments();
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#000033] tracking-tight m-0">
                Departments Management
              </h1>
              <p className="text-slate-500 text-sm mt-1 m-0">
                Create, monitor, and manage curriculum portals for all university schools.
              </p>
            </div>

            <button
              onClick={() => {
                setAddFormData({ name: '', slug: '', title: '' });
                setIsAddModalOpen(true);
              }}
              suppressHydrationWarning={true}
              className="inline-flex items-center justify-center bg-[#000033] hover:bg-[#0b0b47] text-[#ffc107] px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-900/10 hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 cursor-pointer text-sm shadow-sm border-none outline-none"
            >
              <span className="mr-2 text-base">+</span> Add New Department
            </button>
          </div>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                🏫
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Total Portals</p>
                <h3 className="text-2xl font-black text-slate-800 m-0 mt-0.5">{departments.length}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Active Status</p>
                <h3 className="text-2xl font-black text-emerald-600 m-0 mt-0.5">Online</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#ffc107] flex items-center justify-center text-xl font-bold">
                🛠️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">System State</p>
                <h3 className="text-2xl font-black text-slate-800 m-0 mt-0.5">Operational</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                📚
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Total Publications</p>
                <h3 className="text-2xl font-black text-slate-800 m-0 mt-0.5">{stats.total_publications}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                ✈️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Total Foreign Visits</p>
                <h3 className="text-2xl font-black text-slate-800 m-0 mt-0.5">{stats.total_foreign_visits}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                🎪
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Events Organized</p>
                <h3 className="text-2xl font-black text-slate-800 m-0 mt-0.5">{stats.total_events_organized}</h3>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search department by name or slug..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm bg-slate-50/50"
                value={searchQuery ?? ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning={true}
              />
            </div>

            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Showing <span className="text-slate-800">{filteredDepartments.length}</span> of {departments.length} Portals
            </div>
          </div>

          {/* Departments Dynamic Grid Layout */}
          {loading ? (
            <div className="bg-white rounded-3xl p-20 border border-slate-100 shadow-sm text-center">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full mb-4"></div>
              <p className="text-slate-500 font-semibold m-0">Loading Department Portals...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-sm text-center">
              <span className="text-4xl block mb-3">📂</span>
              <p className="text-slate-600 font-bold text-lg m-0">No Departments Found</p>
              <p className="text-slate-400 text-sm mt-1 m-0">Try adjusting your search terms or create a new department portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => {
                const deptIcon = getDeptIcon(dept.name);
                // Curated background color map for visual excellence
                const colorSchemes = [
                  'from-blue-500 to-indigo-600',
                  'from-teal-500 to-emerald-600',
                  'from-purple-500 to-pink-600',
                  'from-rose-500 to-red-600',
                  'from-[#000033] to-[#0b0b47]'
                ];
                const colorIdx = dept.id % colorSchemes.length;
                const activeScheme = colorSchemes[colorIdx];

                return (
                  <div
                    key={dept.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Card Top Banner / Accent */}
                    <div className="p-6 pb-4 flex items-start gap-4 flex-1">
                      {/* Premium Specialized Icon Badge */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${activeScheme} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                        <span className="relative z-10">{deptIcon}</span>
                      </div>

                      {/* Header details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug truncate m-0 group-hover:text-blue-900 transition-colors">
                          {dept.name}
                        </h3>

                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                            /{dept.slug}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="px-6 py-3 bg-slate-50/50 border-y border-slate-100 text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>ID: #{dept.id}</span>
                      <span>Created: {new Date(dept.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 bg-slate-50 flex items-center justify-between gap-2 border-t border-slate-100">
                      <Link
                        href={`/dept/${dept.slug}`}
                        target="_blank"
                        className="flex-1 text-center py-2 px-3 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-blue-900 transition-colors no-underline shadow-sm"
                      >
                        👁️ View Page
                      </Link>

                      <Link
                        href={`/admin/edit/${dept.id}`}
                        className="flex-1 text-center py-2 px-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-lg text-xs font-bold hover:shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all no-underline shadow-sm"
                      >
                        ✏️ Edit Content
                      </Link>

                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="w-9 h-9 flex items-center justify-center bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="Delete Department"
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
      </main>

      {/* Add Department Popup Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          {/* Modal Container Card */}
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-transform duration-300 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#000033] to-[#0b0b47] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#ffc107] m-0">Add New Department</h3>
                <p className="text-white/70 text-xs m-0 mt-0.5">Register a new department school into the university portal.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border-none text-white text-base flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {/* Department Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold bg-slate-50/50"
                  value={addFormData.name ?? ''}
                  onChange={handleNameChange}
                  required
                  autoFocus
                  suppressHydrationWarning={true}
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Enter the display name. The URL slug and header title will auto-generate dynamically!
                </p>
              </div>

              {/* Slug (URL Part) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Slug (URL Route)</label>
                <input
                  type="text"
                  placeholder="e.g. computer-science"
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-mono text-sm font-bold text-blue-600 bg-slate-50/50"
                  value={addFormData.slug ?? ''}
                  onChange={(e) => setAddFormData({ ...addFormData, slug: slugify(e.target.value) })}
                  required
                  suppressHydrationWarning={true}
                />

                {/* Live URL Preview Card */}
                {addFormData.slug && (
                  <div className="mt-2.5 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[11px] text-blue-700 font-semibold flex items-center gap-2">
                    <span className="text-sm">🔗</span>
                    <span>
                      Public Route Preview: <strong className="font-bold underline">/dept/{addFormData.slug}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Page Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Page Header Title (Official Name)</label>
                <input
                  type="text"
                  placeholder="e.g. DEPARTMENT OF COMPUTER SCIENCE"
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm font-semibold bg-slate-50/50"
                  value={addFormData.title ?? ''}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  suppressHydrationWarning={true}
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  This serves as the official banner title. Leave it as is to use the auto-generated UPPERCASE version.
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-none rounded-2xl cursor-pointer transition-colors text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full sm:flex-1 py-3.5 bg-[#000033] hover:bg-[#0b0b47] text-[#ffc107] font-extrabold border-none rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer transition-all text-sm tracking-wide
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-[#ffc107] border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    '🚀 Register Portal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

