'use client';

import React, { useState, useEffect } from 'react';
import { useToast, ToastProvider } from './ToastContext';

function FacultyProfileModalContent({ faculty, onClose, initialTab = 'profile' }) {
  const { id: facultyId, name, designation, email, specialization, image_url } = faculty;
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' or 'resume'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');

  const getFullImageUrl = (url) => {
    if (!url || url.trim() === '') return '/placeholder-faculty.png';
    if (url.startsWith('http')) return url;
    return `${backendBase}${url}`;
  };

  const fetchProfileAndResume = React.useCallback(async () => {
    // Avoid synchronous cascading render lint error
    setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/resume/faculty/${facultyId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Failed to load profile details.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfileAndResume();
  }, [facultyId, fetchProfileAndResume]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/resume/faculty/${facultyId}/regenerate`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setResumeData(data.resume);
        showToast('✓ Resume and PDF successfully regenerated!');
      } else {
        showToast('Failed to regenerate resume.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend.', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrint = () => {
    if (!resumeData || !resumeData.generated_pdf_url) return;
    const printUrl = `${backendBase}${resumeData.generated_pdf_url}`;
    const printWindow = window.open(printUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    } else {
      showToast('Popup blocker prevented opening PDF print window. Please allow popups.', 'warning');
    }
  };

  const handleDownload = () => {
    if (!resumeData || !resumeData.generated_pdf_url) return;
    const pdfUrl = `${backendBase}${resumeData.generated_pdf_url}`;
    
    // Create direct download link
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Resume_${name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast('✓ PDF download started.');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#000066] to-[#0a0a52] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="text-lg font-bold text-white m-0 tracking-wide uppercase">{name}</h2>
              <p className="text-white/80 text-xs m-0 font-medium">{designation || 'Faculty Member'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border-none text-white text-base flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Controls / Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#000066] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-150'
              }`}
            >
              👤 Profile Details
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                activeTab === 'resume'
                  ? 'bg-[#000066] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-150'
              }`}
            >
              📄 Faculty Resume
            </button>
          </div>

          {!loading && !error && resumeData && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold border-none cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Print Resume PDF"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-[#990033] hover:bg-[#80002a] text-white rounded-lg text-xs font-bold border-none cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                title="Download PDF"
              >
                📥 Download PDF
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-[#ffc107] rounded-lg text-xs font-bold border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#ffc107] border-t-transparent animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>🔄 Regenerate</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content Arena */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          {loading ? (
            /* Skeleton Loading States */
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                <div className="w-20 h-28 bg-slate-200 rounded-md"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">⚠️</span>
              <p className="text-slate-700 font-bold text-lg">{error}</p>
              <button
                onClick={fetchProfileAndResume}
                className="mt-4 px-4 py-2 bg-[#000066] text-white font-bold rounded-lg border-none cursor-pointer hover:bg-[#0a0a52]"
              >
                Retry
              </button>
            </div>
          ) : !resumeData ? (
            <p className="text-center text-slate-500 font-semibold py-12">No data available.</p>
          ) : activeTab === 'profile' ? (
            /* --- TAB 1: ACADEMIC PROFILE DETAILS --- */
            <div className="space-y-8">
              {/* Profile Card Summary Row */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-32 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 shrink-0 self-center md:self-start">
                  <img
                    src={getFullImageUrl(image_url)}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder-faculty.png'; }}
                  />
                </div>
                
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
                  <div className="border-b border-slate-50 pb-2.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</span>
                    <strong className="text-slate-800 font-semibold">{resumeData.generated_resume_json.personal.employee_id}</strong>
                  </div>
                  <div className="border-b border-slate-50 pb-2.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Official Email</span>
                    <a href={`mailto:${email}`} className="text-[#990033] hover:underline font-semibold break-all">{email}</a>
                  </div>
                  {resumeData.generated_resume_json.personal.mobile_number && (
                    <div className="border-b border-slate-50 pb-2.5">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</span>
                      <strong className="text-slate-800 font-semibold">{resumeData.generated_resume_json.personal.mobile_number}</strong>
                    </div>
                  )}
                  <div className="border-b border-slate-50 pb-2.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                    <strong className="text-slate-800 font-semibold">{resumeData.generated_resume_json.personal.department}</strong>
                  </div>
                  <div className="border-b border-slate-50 pb-2.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Designation</span>
                    <strong className="text-slate-800 font-semibold">{designation}</strong>
                  </div>
                  {specialization && (
                    <div className="sm:col-span-2 border-b border-slate-50 pb-2.5">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
                      <p className="text-slate-650 m-0 mt-0.5 leading-relaxed font-medium">{specialization}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Educational Qualifications */}
              {resumeData.generated_resume_json.qualifications?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Educational Qualifications</h3>
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Degree</th>
                          <th className="p-3">Years</th>
                          <th className="p-3">Marks/Grade</th>
                          <th className="p-3">Institution/University</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.qualifications.map((qual, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{qual.qualification}</td>
                            <td className="p-3">
                              {qual.year_from}
                              {qual.year_upto ? ` - ${qual.year_upto}` : ''}
                            </td>
                            <td className="p-3">{qual.mark || '-'}</td>
                            <td className="p-3">{qual.institute}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {resumeData.generated_resume_json.experience?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Work Experience</h3>
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Role</th>
                          <th className="p-3">Organization/Institution</th>
                          <th className="p-3">Period</th>
                          <th className="p-3">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.experience.map((exp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{exp.role}</td>
                            <td className="p-3">{exp.company}</td>
                            <td className="p-3">
                              {exp.month_from} {exp.year_from} - {exp.year_upto ? `${exp.month_upto} ${exp.year_upto}` : 'Present'}
                            </td>
                            <td className="p-3 capitalize">{exp.Exp_type || 'Teaching'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Research Areas */}
              {resumeData.generated_resume_json.research_areas?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Research Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.generated_resume_json.research_areas.map((area, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-100 text-xs font-bold rounded-lg shadow-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards & Achievements */}
              {resumeData.generated_resume_json.awards?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Awards & Achievements</h3>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                    {resumeData.generated_resume_json.awards.map((awd, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed font-medium">
                        <span className="text-base shrink-0">🏆</span>
                        <div>
                          <strong className="text-slate-800 font-semibold">{awd.Level || 'Award Title'}</strong>
                          <span className="text-slate-500">
                            {awd.Sponcer ? ` - Sponsored by ${awd.Sponcer}` : ''} 
                            {awd.A_date && awd.A_date !== '0000-00-00' ? ` (${awd.A_date})` : ''}
                          </span>
                          {awd.Spon_Address && <p className="text-[10px] text-slate-400 m-0 mt-0.5">{awd.Spon_Address}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patents */}
              {resumeData.generated_resume_json.patents?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Patents</h3>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                    {resumeData.generated_resume_json.patents.map((pat, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed font-medium">
                        <span className="text-base shrink-0">📄</span>
                        <div>
                          <strong className="text-slate-800 font-semibold">Patent: {pat.PNumber || 'N/A'}</strong>
                          <span className="text-slate-500"> ({pat.Stus || 'Published'})</span>
                          <span className="text-slate-400 block mt-0.5 text-[10px]">
                            {pat.Fdate && pat.Fdate !== '0001-01-01' ? `Filed Date: ${pat.Fdate}` : ''}
                            {pat.Issued ? ` | Issued Date: ${pat.Issued}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications & Sponsored Projects */}
              {resumeData.generated_resume_json.publications?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Publications & Projects</h3>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                    {resumeData.generated_resume_json.publications.map((pub, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed font-medium">
                        <span className="text-base shrink-0">🧬</span>
                        <div>
                          <strong className="text-slate-800 font-semibold">{pub.title}</strong>
                          <div className="text-slate-500 text-[10px] mt-0.5">
                            {pub.FundAgency ? `Funding Agency: ${pub.FundAgency}` : ''}
                            {pub.samt ? ` | Amount: Rs. ${pub.samt.toLocaleString()}` : ''}
                            {pub.duration ? ` | Duration: ${pub.duration} years` : ''}
                          </div>
                          {pub.publications_list && (
                            <p className="text-[10px] text-slate-450 italic m-0 mt-1 font-semibold">Publications: {pub.publications_list}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Publications */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Academic Publications</h3>
                {resumeData.generated_resume_json.academic_publications?.length > 0 ? (
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Title & Authors</th>
                          <th className="p-3">Journal / Publisher</th>
                          <th className="p-3">Details</th>
                          <th className="p-3">Indexing & DOI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.academic_publications.map((pub, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="font-semibold text-slate-900">{pub.Title || 'N/A'}</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Authors: {[pub.Author_1, pub.Author_2, pub.Author_3].filter(Boolean).join(', ') || 'N/A'}
                              </div>
                            </td>
                            <td className="p-3">
                              <div>{pub.P_Name || pub.Publisher || 'N/A'}</div>
                              <div className="text-[10px] text-slate-400 capitalize mt-0.5">{pub.P_type || 'Paper'} ({pub.P_Level || 'National'})</div>
                            </td>
                            <td className="p-3">
                              <div>Year: {pub.P_year || 'N/A'} {pub.P_month ? `(${pub.P_month})` : ''}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {pub.Volume ? `Vol. ${pub.Volume}` : ''} {pub.Issue ? `Issue ${pub.Issue}` : ''} {pub.Page_from ? `pp. ${pub.Page_from}-${pub.Page_to || ''}` : ''}
                              </div>
                            </td>
                            <td className="p-3">
                              <div>Indexing: {pub.Indexing || 'None'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">IF: {pub.Impact_F || '-'} {pub.DOI ? `| DOI: ${pub.DOI}` : ''}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-xs text-slate-500 font-medium italic">
                    No Records Available
                  </div>
                )}
              </div>

              {/* Foreign Visits */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Foreign Visits</h3>
                {resumeData.generated_resume_json.foreign_visits?.length > 0 ? (
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Country / Company</th>
                          <th className="p-3">Purpose</th>
                          <th className="p-3">Period</th>
                          <th className="p-3">Agency & Invitation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.foreign_visits.map((fv, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{fv.company || 'N/A'}</td>
                            <td className="p-3">{fv.purpose || 'N/A'}</td>
                            <td className="p-3">{fv.dfrom || 'N/A'} {fv.dto ? ` to ${fv.dto}` : ''}</td>
                            <td className="p-3">
                              <div>Agency: {fv.agency || 'N/A'}</div>
                              {fv.invitation && <div className="text-[10px] text-slate-400 mt-0.5">Invite: {fv.invitation}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-xs text-slate-500 font-medium italic">
                    No Records Available
                  </div>
                )}
              </div>

              {/* Events Organized */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Events Organized</h3>
                {resumeData.generated_resume_json.events_organized?.length > 0 ? (
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Title of Event</th>
                          <th className="p-3">Type & Role</th>
                          <th className="p-3">Period & Organizer</th>
                          <th className="p-3">Budget Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.events_organized.map((eo, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{eo.Title || 'N/A'}</td>
                            <td className="p-3">
                              <div>Role: {eo.Role || 'N/A'} ({eo.T_role || 'N/A'})</div>
                              <div className="text-[10px] text-slate-400 capitalize mt-0.5">{eo.O_type || 'Event'} ({eo.Level || 'National'})</div>
                            </td>
                            <td className="p-3">
                              <div>{eo.Date_f || 'N/A'} {eo.Date_t ? ` to ${eo.Date_t}` : ''}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{eo.Org || 'N/A'}</div>
                            </td>
                            <td className="p-3">
                              <div>Sanctioned: {eo.Sanctioned || '-'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Utilized: {eo.Utilized || '-'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-xs text-slate-500 font-medium italic">
                    No Records Available
                  </div>
                )}
              </div>

              {/* Lectures Delivered */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Lectures Delivered</h3>
                {resumeData.generated_resume_json.lectures_delivered?.length > 0 ? (
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Title of Lecture</th>
                          <th className="p-3">Role / Type</th>
                          <th className="p-3">Organization & Venue</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.lectures_delivered.map((lec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">
                              <div>{lec.Title || 'N/A'}</div>
                              {lec.EventTitle && (
                                <div className="text-[10px] text-slate-450 font-normal mt-0.5">Event: {lec.EventTitle}</div>
                              )}
                            </td>
                            <td className="p-3">{lec.Role || 'N/A'}</td>
                            <td className="p-3">
                              <div>{lec.Org || 'N/A'}</div>
                              {lec.Mode && (
                                <div className="text-[10px] text-slate-450 font-normal mt-0.5">Mode: {lec.Mode}</div>
                              )}
                            </td>
                            <td className="p-3">{lec.Date_f || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-xs text-slate-500 font-medium italic">
                    No Records Available
                  </div>
                )}
              </div>

              {/* Copyrights */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">Copyrights</h3>
                {resumeData.generated_resume_json.copyrights?.length > 0 ? (
                  <div className="overflow-x-auto bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-3">Work Name</th>
                          <th className="p-3">Registration Number</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Filed/Reg Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
                        {resumeData.generated_resume_json.copyrights.map((cop, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{cop.Name || 'N/A'}</td>
                            <td className="p-3">{cop.PNumber || 'N/A'}</td>
                            <td className="p-3">{cop.Stus || 'N/A'}</td>
                            <td className="p-3">{cop.Fdate || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-xs text-slate-500 font-medium italic">
                    No Records Available
                  </div>
                )}
              </div>

              {/* PhD Guided / Produced */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider m-0">PhD Guidance / Produced</h3>
                {resumeData.generated_resume_json.phd_produced?.length > 0 ? (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                    {resumeData.generated_resume_json.phd_produced.map((phd, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed font-medium">
                        <span className="text-base shrink-0">🎓</span>
                        <div dangerouslySetInnerHTML={{ __html: phd }}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-xs text-slate-500 font-medium italic">
                    No Records Available
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- TAB 2: # FACULTY RESUME SECTION --- */
            <div className="bg-white p-8 md:p-12 border border-slate-200 rounded-xl shadow-md max-w-3xl mx-auto font-serif text-slate-900 relative">
              
              {/* Premium Top Bar Design Accent */}
              <div className="absolute top-0 inset-x-0 h-2 bg-[#000066]"></div>
              
              <div className="space-y-8 print:space-y-6">
                
                {/* 1. Profile (Name, Designation, Photo, summary, qualifications) */}
                <div className="flex justify-between items-start border-b-2 border-[#000066] pb-5">
                  <div className="space-y-1.5 flex-1 pr-6">
                    <h1 className="text-2xl font-bold font-sans text-[#000066] tracking-tight uppercase m-0 leading-none">
                      {resumeData.generated_resume_json.personal.name}
                    </h1>
                    <p className="text-sm font-bold font-sans text-[#990033] uppercase tracking-wide m-0">
                      {resumeData.generated_resume_json.personal.designation}
                    </p>
                    <p className="text-xs font-sans text-slate-600 m-0">
                      Department of {resumeData.generated_resume_json.personal.department}
                    </p>
                    <p className="text-xs font-sans text-slate-600 m-0">
                      Periyar University, Salem, Tamil Nadu, India
                    </p>
                  </div>
                  
                  {/* Photo inside Resume if available */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <div className="w-20 h-26 rounded border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                      <img
                        src={getFullImageUrl(image_url)}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/placeholder-faculty.png'; }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">ID: #{resumeData.generated_resume_json.personal.employee_id}</span>
                  </div>
                </div>

                {/* Professional Summary */}
                {resumeData.generated_resume_json.summary && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0">Professional Summary</h3>
                    <p className="text-xs leading-relaxed text-slate-700 m-0">{resumeData.generated_resume_json.summary}</p>
                  </div>
                )}

                {/* Educational Qualifications */}
                {resumeData.generated_resume_json.qualifications?.length > 0 && (
                  <div className="space-y-3.5">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Educational Qualifications</h3>
                    <div className="space-y-2.5">
                      {resumeData.generated_resume_json.qualifications.map((qual, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <div className="space-y-0.5">
                            <strong className="text-slate-800 font-bold font-sans">{qual.qualification}</strong>
                            <p className="text-slate-660 m-0">{qual.institute}</p>
                          </div>
                          <div className="text-right shrink-0 text-slate-500 font-sans">
                            <span>{qual.year_from}{qual.year_upto ? " - " + qual.year_upto : ""}</span>
                            {qual.mark && <p className="text-[10px] text-slate-450 m-0">Grade: {qual.mark}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Web Pages (Contact Info) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Web Pages & Contact Links</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600 font-sans">
                    <span>✉ <b>Email:</b> <a href={"mailto:" + email} className="text-[#990033] hover:underline font-bold break-all">{email}</a></span>
                    {resumeData.generated_resume_json.personal.mobile_number && (
                      <span>📞 <b>Mobile:</b> <span className="text-slate-800 font-bold">{resumeData.generated_resume_json.personal.mobile_number}</span></span>
                    )}
                    {resumeData.generated_resume_json.personal.profile_url && (
                      <span>🌐 <b>Faculty Link:</b> <a href={resumeData.generated_resume_json.personal.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold truncate inline-block max-w-[250px] align-bottom">Profile page</a></span>
                    )}
                  </div>
                </div>

                {/* 3. Previous Positions */}
                {resumeData.generated_resume_json.previous_positions?.length > 0 && (
                  <div className="space-y-3.5">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Previous Positions</h3>
                    <div className="space-y-3">
                      {resumeData.generated_resume_json.previous_positions.map((exp, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs font-sans">
                          <div className="space-y-0.5">
                            <strong className="text-slate-800 font-bold">{exp.role}</strong>
                            <p className="text-slate-650 m-0">{exp.company} <span className="text-[10px] text-slate-400 capitalize">({exp.Exp_type || 'Teaching/Research'})</span></p>
                          </div>
                          <div className="text-right shrink-0 text-slate-500">
                            <span>{exp.month_from} {exp.year_from} - {exp.year_upto ? exp.month_upto + " " + exp.year_upto : "Present"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Area of Specialisation */}
                {((resumeData.generated_resume_json.research_areas?.length > 0) || (resumeData.generated_resume_json.skills?.length > 0)) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Area of Specialisation</h3>
                    {resumeData.generated_resume_json.research_areas?.length > 0 && (
                      <div className="space-y-1">
                        <strong className="text-xs text-slate-800 font-bold font-sans">Research Areas:</strong>
                        <p className="text-xs text-slate-700 leading-relaxed m-0">{resumeData.generated_resume_json.research_areas.join(', ')}</p>
                      </div>
                    )}
                    {resumeData.generated_resume_json.skills?.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <strong className="text-xs text-slate-800 font-bold font-sans">Skills & Expertise:</strong>
                        <p className="text-xs text-slate-700 leading-relaxed m-0">{resumeData.generated_resume_json.skills.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Recognition and Award */}
                {resumeData.generated_resume_json.awards?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Recognition and Award</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.awards.map((awd, idx) => (
                        <li key={idx}>
                          <b>{awd.Level || 'Award Title'}</b> 
                          {awd.Sponcer ? " - Sponsored by " + awd.Sponcer : ""}
                          {awd.A_date && awd.A_date !== '0000-00-00' ? " (" + awd.A_date + ")" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Foreign Visits */}
                {resumeData.generated_resume_json.foreign_visits?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Foreign Visits</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.foreign_visits.map((fv, idx) => (
                        <li key={idx}>
                          ✈ <b>{fv.company || 'N/A'}</b> - {fv.purpose || 'Visit'}
                          {(fv.dfrom || fv.dto) && " (" + [fv.dfrom, fv.dto].filter(Boolean).join(' to ') + ")"}
                          {fv.agency && " | Sponsored by " + fv.agency}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 7. PhD Produced */}
                {resumeData.generated_resume_json.phd_produced?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">PhD Produced</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.phd_produced.map((phd, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: phd }}></li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 8. Publications */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Publications (Total: {resumeData.generated_resume_json.academic_publications?.length || 0})</h3>
                  {resumeData.generated_resume_json.academic_publications?.length > 0 ? (
                    <ol className="list-decimal pl-5 m-0 space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.academic_publications.map((pub, idx) => {
                        const authors = [pub.Author_1, pub.Author_2, pub.Author_3].filter(Boolean).join(', ');
                        const detailParts = [];
                        if (pub.Volume) detailParts.push("Vol. " + pub.Volume);
                        if (pub.Issue) detailParts.push("No. " + pub.Issue);
                        if (pub.Page_from) detailParts.push("pp. " + pub.Page_from + (pub.Page_to ? "-" + pub.Page_to : ""));
                        
                        const extraParts = [];
                        if (pub.Impact_F) extraParts.push("Impact Factor: " + pub.Impact_F);
                        if (pub.Indexing) extraParts.push("Indexing: " + pub.Indexing);
                        if (pub.DOI) extraParts.push("DOI: " + pub.DOI);

                        return (
                          <li key={idx}>
                            {authors && <span>{authors}, </span>}
                            {pub.Title && <strong className="text-slate-800 font-bold">"{pub.Title.trim()}", </strong>}
                            {pub.P_Name && <span className="italic">{pub.P_Name.trim()}</span>}
                            {detailParts.length > 0 && <span>, {detailParts.join(', ')}</span>}
                            {(pub.P_month || pub.P_year) && <span>, {[pub.P_month, pub.P_year].filter(Boolean).join(' ')}</span>}
                            {extraParts.length > 0 && <span className="text-slate-500 block text-[10px] mt-0.5">({extraParts.join(', ')})</span>}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="text-xs text-slate-500 italic font-sans m-0">No Records Available</p>
                  )}
                </div>

                {/* 9. Projects */}
                {resumeData.generated_resume_json.publications?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Projects</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.publications.map((pub, idx) => (
                        <li key={idx}>
                          <b>{pub.title}</b>
                          {pub.FundAgency ? " (Agency: " + pub.FundAgency : ""}
                          {pub.samt ? ", Grant: Rs. " + pub.samt.toLocaleString() : ""}
                          {pub.duration ? ", Duration: " + pub.duration + " years)" : pub.FundAgency ? ")" : ""}
                          {pub.publications_list && <span className="block mt-0.5 text-[10px] text-slate-500">Publications: {pub.publications_list}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 10. Patents */}
                {resumeData.generated_resume_json.patents?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Patents</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.patents.map((pat, idx) => (
                        <li key={idx}>
                          <b>Patent No: {pat.PNumber || 'N/A'}</b> ({pat.Stus || 'Published'})
                          {pat.Fdate && pat.Fdate !== '0001-01-01' ? ", Filed Date: " + pat.Fdate : ""}
                          {pat.Issued ? ", Issued Date: " + pat.Issued : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 11. Copyright */}
                {resumeData.generated_resume_json.copyrights?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Copyright</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.copyrights.map((cop, idx) => (
                        <li key={idx}>
                          © <b>{cop.Name || 'Work'}</b> | Reg No: {cop.PNumber || 'N/A'} ({cop.Stus || 'Registered'}) {cop.Fdate && "| Date: " + cop.Fdate}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 12. Events Conducted */}
                {resumeData.generated_resume_json.events_organized?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Events Conducted</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.events_organized.map((eo, idx) => (
                        <li key={idx}>
                          🎪 <b>{eo.Title || 'Event'}</b> ({eo.Level || 'National'}) | Role: {eo.Role || 'Organizer'}
                          {(eo.Date_f || eo.Date_t) && " (" + [eo.Date_f, eo.Date_t].filter(Boolean).join(' to ') + ")"}
                          {eo.Org && " | Organised by " + eo.Org}
                          {eo.Sanctioned && " [Budget: " + eo.Sanctioned + "]"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 13. Lectures Delivered */}
                {resumeData.generated_resume_json.lectures_delivered?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Lectures Delivered</h3>
                    <ul className="list-disc pl-5 m-0 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                      {resumeData.generated_resume_json.lectures_delivered.map((lec, idx) => (
                        <li key={idx}>
                          🎙 <b>{lec.Title || 'Lecture'}</b> {lec.EventTitle && "at \"" + lec.EventTitle + "\""} | Role: {lec.Role || 'Speaker'} | Org: {lec.Org || 'N/A'} {lec.Mode && "(" + lec.Mode + ")"} {lec.Date_f && "(" + lec.Date_f + ")"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 14. Positions Held in University */}
                {resumeData.generated_resume_json.university_positions?.length > 0 && (
                  <div className="space-y-3.5">
                    <h3 className="text-sm font-bold font-sans text-[#000066] tracking-wider uppercase m-0 border-b border-slate-200 pb-1">Positions Held in University</h3>
                    <div className="space-y-3">
                      {resumeData.generated_resume_json.university_positions.map((exp, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs font-sans">
                          <div className="space-y-0.5">
                            <strong className="text-slate-800 font-bold">{exp.role}</strong>
                            <p className="text-slate-650 m-0">{exp.company} <span className="text-[10px] text-slate-400 capitalize">({exp.Exp_type || 'Administrative'})</span></p>
                          </div>
                          <div className="text-right shrink-0 text-slate-500">
                            <span>{exp.month_from} {exp.year_from} - {exp.year_upto ? exp.month_upto + " " + exp.year_upto : "Present"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-355 text-slate-700 font-bold border-none rounded-xl cursor-pointer transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultyProfileModal(props) {
  return (
    <ToastProvider>
      <FacultyProfileModalContent {...props} />
    </ToastProvider>
  );
}
