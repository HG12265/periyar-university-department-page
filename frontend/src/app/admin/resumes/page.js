'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import FacultyProfileModal from '@/components/FacultyProfileModal';
import { ToastProvider, useToast } from '@/components/ToastContext';

function AdminResumesContent() {
  const { showToast } = useToast();
  
  const [resumes, setResumes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Search & Filter state
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  
  // Active Faculty Modal state
  const [viewingFaculty, setViewingFaculty] = useState(null);

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
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      
      const params = new URLSearchParams();
      if (searchName.trim()) params.append('search', searchName.trim());
      if (searchEmail.trim()) params.append('email', searchEmail.trim());
      if (selectedDept) params.append('dept_id', selectedDept);
      
      const res = await fetch(`${apiUrl}/admin/resumes?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      } else {
        showToast('Failed to load resumes.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResumes();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchName, searchEmail, selectedDept]);

  const handleRegenerate = async (id, facultyName) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/resumes/${id}/regenerate`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast(`✓ Resume for ${facultyName} successfully regenerated.`);
        fetchResumes();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to regenerate resume.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id, facultyName) => {
    if (isActionLoading) return;
    if (!confirm(`Are you sure you want to delete the generated resume and PDF document for ${facultyName}? This action is irreversible.`)) {
      return;
    }
    
    setIsActionLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/admin/resumes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`✓ Resume for ${facultyName} deleted successfully.`);
        fetchResumes();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to delete resume.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getFullPdfUrl = (path) => {
    if (!path) return '#';
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
    return `${backendBase}${path}`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#000033] tracking-tight m-0">
              Resume Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 m-0">
              Monitor, search, regenerate, and manage generated faculty resume documents.
            </p>
          </div>

          {/* Search / Filter Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 m-0">
              Filter Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Faculty Name</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-800"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Official Email</label>
                <input
                  type="text"
                  placeholder="Search by email..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-800"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#000033] mb-1.5 uppercase tracking-wide">Department</label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 text-slate-800"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resumes Grid/Table */}
          {loading ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-100 rounded w-full"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
              <span className="text-4xl block mb-3">📄</span>
              <h3 className="text-slate-800 font-bold text-base m-0">No Generated Resumes Found</h3>
              <p className="text-slate-400 text-xs font-semibold mt-1 mb-0">
                Resumes are compiled automatically when accessed by faculty members or through verification.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Faculty Name</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Last Updated</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
                    {resumes.map((resume) => (
                      <tr key={resume.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#000033] text-sm">{resume.faculty_name}</div>
                          <div className="text-slate-400 font-medium text-[11px] mt-0.5">{resume.faculty_email}</div>
                          <div className="text-slate-500 font-bold text-[10px] uppercase mt-0.5">{resume.faculty_designation || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-650 font-bold">
                          {resume.department_name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium font-sans">
                          {new Date(resume.updated_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setViewingFaculty({
                              id: resume.faculty_id,
                              name: resume.faculty_name,
                              designation: resume.faculty_designation,
                              email: resume.faculty_email,
                              image_url: '',
                              specialization: ''
                            })}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg border-none cursor-pointer font-bold transition-colors"
                          >
                            👁️ View
                          </button>
                          
                          <a
                            href={getFullPdfUrl(resume.generated_pdf_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-[#990033]/10 hover:bg-[#990033]/20 text-[#990033] rounded-lg border-none cursor-pointer font-bold transition-colors no-underline"
                          >
                            📥 PDF
                          </a>
                          
                          <button
                            onClick={() => handleRegenerate(resume.id, resume.faculty_name)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-[#ffc107] rounded-lg border-none cursor-pointer font-bold transition-colors disabled:opacity-50"
                          >
                            🔄 Sync
                          </button>

                          <button
                            onClick={() => handleDelete(resume.id, resume.faculty_name)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border-none cursor-pointer font-bold transition-colors disabled:opacity-50"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {viewingFaculty && (
        <FacultyProfileModal
          faculty={viewingFaculty}
          onClose={() => setViewingFaculty(null)}
        />
      )}
    </div>
  );
}

export default function AdminResumesPage() {
  return (
    <ToastProvider>
      <AdminResumesContent />
    </ToastProvider>
  );
}
