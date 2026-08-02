'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Topbar from '@/components/Topbar';
import MainHeader from '@/components/MainHeader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeptNavbar from '@/components/DeptNavbar';
import FacultySection from '@/components/FacultySection';
import AlumniTableSection from '@/components/AlumniTableSection';
import PlacementTableSection from '@/components/PlacementTableSection';
import MuseumSection from '@/components/MuseumSection';
import FacilitiesSection from '@/components/FacilitiesSection';
import GuestFacultySection from '@/components/GuestFacultySection';
import { sanitizeHtml } from '@/utils/sanitize';
import dynamic from 'next/dynamic';
const FlipbookModal = dynamic(() => import('@/components/FlipbookModal'), { ssr: false });

export default function DeptPage() {
  const { slug } = useParams();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [openAccordions, setOpenAccordions] = useState({
    programmes: false,
    achievements: false
  });

  const toggleAccordion = (sec) => {
    setOpenAccordions(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [expandedYears, setExpandedYears] = useState({});
  const toggleYear = (yr) => {
    setExpandedYears(prev => ({ ...prev, [yr]: !prev[yr] }));
  };

  const [flipbookFile, setFlipbookFile] = useState(null);

  const handleSyllabusContainerClick = (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    let fileUrl = anchor.getAttribute('href');
    if (!fileUrl) return;

    // Clean up any legacy localhost URLs stored in database content
    fileUrl = fileUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');

    // Resolve full absolute URL for local uploads and legacy university PDFs
    if (fileUrl.startsWith('/api/uploads') || fileUrl.startsWith('/uploads')) {
      const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
      const cleanPath = fileUrl.startsWith('/api') ? fileUrl : '/api' + fileUrl;
      fileUrl = `${backendBase}${cleanPath}`;
    } else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
      const cleanPath = fileUrl.replace(/^\/+/, '');
      fileUrl = cleanPath.startsWith('Dept/') 
        ? `https://www.periyaruniversity.ac.in/${cleanPath}`
        : `https://www.periyaruniversity.ac.in/Dept/${cleanPath}`;
    }

    // Handle View Button (Opens Flipbook Modal)
    if (anchor.classList.contains('view') || anchor.title?.toLowerCase().includes('view')) {
      e.preventDefault();
      const tr = anchor.closest('tr');
      let title = 'Document';
      if (tr) {
        const cells = Array.from(tr.querySelectorAll('td'));
        const nonAnchorCells = cells.filter(cell => !cell.contains(anchor) && cell.textContent.trim().length > 0);
        if (nonAnchorCells.length > 0) {
          const preferredCell = cells[1] && nonAnchorCells.includes(cells[1]) ? cells[1] : nonAnchorCells[0];
          title = preferredCell.textContent.trim();
        }
      }
      setFlipbookFile({ url: fileUrl, title });
    }
    // Handle Download Button
    else if (anchor.classList.contains('download') || anchor.hasAttribute('download') || anchor.title?.toLowerCase().includes('download')) {
      e.preventDefault();
      const downloadName = anchor.getAttribute('download') || fileUrl.split('/').pop() || 'document.pdf';
      fetch(fileUrl)
        .then(res => {
          if (!res.ok) throw new Error('Network response failed');
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = downloadName.endsWith('.pdf') ? downloadName : `${downloadName}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        })
        .catch(() => {
          // Direct fallback if fetch is blocked
          window.open(fileUrl, '_blank');
        });
    }
  };

  const categories = [
    { name: 'Home', slug: 'home' },
    { name: 'Programmes Offered', slug: 'programmes' },
    { name: 'Syllabus', slug: 'syllabus' },
    { name: 'Faculty', slug: 'faculty' },
    { name: 'Guest Faculty', slug: 'guest-faculty' },
    { name: 'Conference', slug: 'conference' },
    { name: 'Activities', slug: 'activities' },
    { name: 'Facilities', slug: 'facilities' },
    { name: 'Funded Projects', slug: 'projects' },
    { name: 'UGC-MRP', slug: 'ugc-mrp' },
    { name: 'Journal', slug: 'journal' },
    { name: 'Alumni', slug: 'alumni' },
    { name: 'Placement', slug: 'placement' },
    { name: 'Contact', slug: 'contact' },
    { name: 'PDF', slug: 'pdf' },
    { name: 'Gallery', slug: 'gallery' },
    { name: 'Best Practices', slug: 'best-practices' },
    { name: 'Finance Details', slug: 'finance-details' },
  ];

  useEffect(() => {
    const fetchDept = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/departments/${slug}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!res.ok) throw new Error('Department not found');
        const data = await res.json();
        setDept(data);

        const hash = window.location.hash.replace('#', '');
        if (hash) {
          const isKnownTab = categories.some(c => c.slug === hash) ||
            (data.nav_links && data.nav_links.some(l => l.url.replace('#', '') === hash));
          if (isKnownTab) setActiveTab(hash);
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchDept();
  }, [slug]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && dept) {
        const isKnownTab = categories.some(c => c.slug === hash) ||
          (dept.nav_links && dept.nav_links.some(l => l.url.replace('#', '') === hash));
        if (isKnownTab) setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [dept]);

  const syllabusSections = dept?.sections?.filter(section => section.category === 'syllabus') || [];
  const isSyllabusTab = activeTab === 'syllabus';
  const isProgrammesTab = activeTab === 'programmes';
  const isProjectsTab = activeTab === 'projects';
  const isUgcMrpTab = activeTab === 'ugc-mrp';
  const isJournalTab = activeTab === 'journal';
  const isConferenceTab = activeTab === 'conference';

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Topbar />
        <MainHeader />
        <Navbar />
        <div className="flex-1 flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a0000]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !dept) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Topbar />
        <MainHeader />
        <Navbar />
        <div className="flex-1 container mx-auto max-w-[1140px] px-[15px] py-12 text-center text-red-600 font-bold">
          {error || 'Department not found'}
        </div>
        <Footer />
      </div>
    );
  }

  const isEnergyScience = dept?.slug === 'energy-science-and-technology';
  const isFoodScience = dept?.slug === 'food-science-and-nutrition';
  const isTextiles = dept?.slug === 'textiles-and-apparel-design';

  // Compute final navbar links
  let navbarLinks = dept?.nav_links && dept.nav_links.length > 0
    ? dept.nav_links.map(l => ({
      label: l.label,
      url: l.url,
      slug: l.url.replace('#', '')
    }))
    : categories.map(c => ({
      label: c.name,
      url: `#${c.slug}`,
      slug: c.slug
    }));

  // Normalize slug names (just in case there are duplicates or legacy names like guestfaculty)
  navbarLinks = navbarLinks.map(l => {
    if (l.slug === 'guestfaculty') {
      return { ...l, slug: 'guest-faculty', url: '#guest-faculty' };
    }
    return l;
  });

  // Ensure default fallback for Energy Science if not explicitly set
  if (isEnergyScience && !navbarLinks.some(l => l.slug === 'placement')) {
    navbarLinks.push({ label: 'Placement', url: '#placement', slug: 'placement' });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Topbar />
      <MainHeader />
      <Navbar />

      <div className="container mx-auto max-w-[1140px] px-[15px] pt-8 pb-4">
        {(() => {
          const apiBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
          const bannerUrl = dept.banner_image && dept.banner_image !== '/logo.JPG' && dept.banner_image !== '/logo.jpg'
            ? (dept.banner_image.startsWith('/api/') ? `${apiBase}${dept.banner_image}` : dept.banner_image)
            : null;

          return (
            <div
              className="relative rounded-2xl border border-gray-200/80 shadow-sm text-center px-4 overflow-hidden flex items-center justify-center"
              style={bannerUrl ? {
                backgroundImage: `url("${bannerUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '196.8px'
              } : {
                backgroundColor: '#ebf0f2',
                height: '196.8px'
              }}
            >
              {/* Overlay for legibility when banner exists */}
              {bannerUrl && (
                <div className="absolute inset-0 bg-white/15" />
              )}
              <h1
                className="relative z-10 text-black bg-white py-2 px-3 rounded-md shadow-md text-[24px] md:text-[34px] font-bold uppercase tracking-[1.5px] m-0 leading-tight"
                style={bannerUrl ? { textShadow: '0 2px 8px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(255, 255, 255, 0.95)' } : {}}
              >
                {dept.title || `Department of ${dept.name}`}
              </h1>
            </div>
          );
        })()}
      </div>

      <DeptNavbar
        activeTab={activeTab}
        links={navbarLinks}
      />

      <main className="flex-1 py-4 bg-white min-h-[250px]">
        <div className="container mx-auto max-w-[1140px] px-[15px]">


          <div className={`${(activeTab === 'facilities' || activeTab === 'pdf') ? 'space-y-1' : 'space-y-12'} mb-8`}>
            {activeTab === 'faculty' && dept.faculties && (
              <FacultySection faculties={dept.faculties} />
            )}

            {activeTab === 'alumni' && (
              <AlumniTableSection alumniTable={dept.alumni_table} />
            )}

            {activeTab === 'placement' && (
              <PlacementTableSection placementTable={dept.placement_table} />
            )}

            {activeTab === 'guest-faculty' && dept.faculties && (
              <GuestFacultySection faculties={dept.faculties} />
            )}

            {activeTab === 'museum' && (
              <MuseumSection content={dept.sections?.find(s => s.category === 'museum')?.content} slug={dept.slug} />
            )}

            {activeTab === 'facilities' && !dept.sections?.some(s => s.category === 'facilities' && s.content?.includes('[SPECIALIZED_FACILITIES]')) && (
              <FacilitiesSection facilities={dept.facilities} />
            )}

            {/* Fallback Facilities Event Gallery - shown at the bottom of the facilities tab only if not dynamically positioned */}
            {activeTab === 'facilities' && !dept.sections?.some(s => s.category === 'facilities' && s.content?.includes('[SPECIALIZED_FACILITIES_GALLERY]')) && dept.activity_gallery && dept.activity_gallery.events && dept.activity_gallery.events.filter(evt => evt.category === 'Facilities').length > 0 && (
              <div className="space-y-10 mt-10">
                {dept.activity_gallery.events.filter(evt => evt.category === 'Facilities').map((evt, idx) => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');
                  return (
                    <div key={idx} className="animate-in fade-in duration-500 w-full mb-8 font-sans">
                      {evt.title && (
                        <h3 style={{
                          color: '#333',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '16px',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #990033',
                          paddingBottom: '8px',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {evt.title}
                        </h3>
                      )}
                      <div className="flex flex-wrap gap-[14px]">
                        {evt.images && evt.images.map((imgUrl, imgIdx) => {
                          const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                          const isSingle = evt.images.length === 1;
                          return (
                            <div
                              key={imgIdx}
                              className={`w-full flex-shrink-0 ${isSingle ? 'w-full' : 'sm:w-[calc(50%-7px)]'
                                }`}
                            >
                              <img
                                src={fullUrl}
                                alt={evt.title || 'Facility photo'}
                                className="w-full h-[250px] sm:h-[420px] object-cover rounded-[10px] shadow-md border-2 border-[#f0f0f0] block hover:scale-[1.01] transition-transform duration-300"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Gallery Events - shown at the bottom of the activities tab only if not dynamically positioned */}
            {activeTab === 'activities' && !dept.sections?.some(s => s.category === 'activities' && (s.content?.includes('[SPECIALIZED_ACTIVITIES_GALLERY]') || s.content?.startsWith('[SECTION_GALLERY]'))) && dept.activity_gallery && dept.activity_gallery.events && dept.activity_gallery.events.filter(evt => evt.category !== 'Programmes' && evt.category !== "Student's Achievements" && evt.category !== 'Facilities').length > 0 && (
              <div className="space-y-10">
                {dept.activity_gallery.events.filter(evt => evt.category !== 'Programmes' && evt.category !== "Student's Achievements" && evt.category !== 'Facilities').map((evt, idx) => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');
                  return (
                    <div key={idx}>
                      {evt.title && (
                        <h3 style={{
                          color: '#333',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '16px',
                          textTransform: 'uppercase',
                          borderBottom: '2px solid #990033',
                          paddingBottom: '8px',
                          fontFamily: 'Arial, sans-serif'
                        }}>
                          {evt.title}
                        </h3>
                      )}
                      <div className="flex flex-wrap gap-[14px]">
                        {evt.images && evt.images.map((imgUrl, imgIdx) => {
                          const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                          const isSingle = evt.images.length === 1;
                          return (
                            <div
                              key={imgIdx}
                              className={`w-full flex-shrink-0 ${isSingle ? 'w-full' : 'sm:w-[calc(50%-7px)]'
                                }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={fullUrl}
                                alt={evt.title || 'Activity photo'}
                                className="w-full h-[250px] sm:h-[420px] object-cover rounded-[10px] shadow-md border-2 border-[#f0f0f0] block"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dedicated Gallery Section */}
            {activeTab === 'gallery' && dept.activity_gallery && dept.activity_gallery.events && (
              <div className="space-y-4 font-sans">
                {/* Accordion 1: Programmes */}
                <div className="bg-white overflow-hidden">
                  <button
                    onClick={() => toggleAccordion('programmes')}
                    className="w-full p-4 flex justify-between items-center border-none text-left cursor-pointer transition-all duration-300 select-none"
                    style={{
                      backgroundColor: '#85c5e3',
                      color: '#333333',
                      fontFamily: '"CMU Sans Serif Demi borderless", "CMU Sans Serif", "Computer Modern Sans", sans-serif',
                      fontSize: '20px',
                    }}
                  >
                    <span>Programmes</span>
                    <span className="text-lg transform transition-transform duration-300 flex items-center justify-center">
                      {openAccordions.programmes ? '▼' : '▶'}
                    </span>
                  </button>
                  {openAccordions.programmes && (
                    <div className="py-6 bg-white space-y-8 animate-in slide-in-from-top-2 duration-300">
                      {dept.activity_gallery.events.filter(e => !e.category || e.category === 'Programmes').length === 0 ? (
                        <p className="text-gray-455 italic text-sm text-center py-6">No programmes gallery items available.</p>
                      ) : (
                        dept.activity_gallery.events
                          .filter(e => !e.category || e.category === 'Programmes')
                          .map((evt, idx) => {


                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                            const base = apiUrl.replace('/api', '');
                            return (
                              <div key={idx} className="space-y-4 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                {evt.title && (
                                  <h4 className="text-base font-bold text-slate-800 m-0 leading-snug">
                                    {evt.title}
                                  </h4>
                                )}
                                <div className="flex flex-wrap justify-center gap-6 mt-6">
                                  {evt.images && evt.images.map((imgUrl, imgIdx) => {
                                    const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                                    return (
                                      <div key={imgIdx} className="w-full sm:w-[calc(50%-12px)] overflow-hidden border border-gray-200 aspect-video relative">
                                        <img
                                          src={fullUrl}
                                          alt={evt.title || 'Gallery image'}
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>

                {/* Accordion 2: Student's Achievements */}
                <div className="bg-white overflow-hidden">
                  <button
                    onClick={() => toggleAccordion('achievements')}
                    className="w-full p-4 flex justify-between items-center border-none text-left cursor-pointer transition-all duration-300 select-none"
                    style={{
                      backgroundColor: '#85c5e3',
                      color: '#333333',
                      fontFamily: '"CMU Sans Serif Demi borderless", "CMU Sans Serif", "Computer Modern Sans", sans-serif',
                      fontSize: '20px',
                    }}
                  >
                    <span>Student&apos;s Achievements</span>
                    <span className="text-lg transform transition-transform duration-300 flex items-center justify-center">
                      {openAccordions.achievements ? '▼' : '▶'}
                    </span>
                  </button>
                  {openAccordions.achievements && (
                    <div className="py-6 bg-white space-y-8 animate-in slide-in-from-top-2 duration-300">
                      {dept.activity_gallery.events.filter(e => e.category === "Student's Achievements").length === 0 ? (
                        <p className="text-gray-455 italic text-sm text-center py-6">No student achievements gallery items available.</p>
                      ) : (
                        dept.activity_gallery.events
                          .filter(e => e.category === "Student's Achievements")
                          .map((evt, idx) => {
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                            const base = apiUrl.replace('/api', '');
                            return (
                              <div key={idx} className="space-y-4 border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                {evt.title && (
                                  <h4 className="text-base font-bold text-slate-800 m-0 leading-snug">
                                    {evt.title}
                                  </h4>
                                )}
                                <div className="flex flex-wrap justify-center gap-6 mt-6">
                                  {evt.images && evt.images.map((imgUrl, imgIdx) => {
                                    const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                                    return (
                                      <div key={imgIdx} className="w-full sm:w-[calc(50%-12px)] overflow-hidden border border-gray-200 aspect-video relative">
                                        <img
                                          src={fullUrl}
                                          alt={evt.title || 'Gallery image'}
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dedicated Energy and Environment Park Section */}
            {activeTab === 'energy-environment-park' && (
              <div className="space-y-8">
                {(() => {
                  const section = dept.sections?.find(s => s.category === 'energy-environment-park');
                  if (!section) return null;
                  let parsedData = { images: [], equipments: [] };
                  try {
                    parsedData = JSON.parse(section.content);
                  } catch (e) {
                    console.error("Error parsing energy park JSON:", e);
                  }

                  const { images, equipments } = parsedData;
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');

                  return (
                    <div className="space-y-8">
                      {images && images.length > 0 && (
                        <div>
                          <h3 className="text-slate-800 text-[18px] font-bold mb-4 uppercase tracking-wider font-sans border-b border-gray-200 pb-2">
                            Photographs
                          </h3>
                          <div className="flex flex-wrap justify-center gap-6 mt-6">
                            {images.map((imgUrl, imgIdx) => {
                              const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                              return (
                                <div key={imgIdx} className="w-full sm:w-[calc(50%-12px)] overflow-hidden border border-gray-200 aspect-video relative">
                                  <img
                                    src={fullUrl}
                                    alt="Energy and Environment Park"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 2. Table Section */}
                      {equipments && equipments.length > 0 && (
                        <div>
                          <h3 className="text-slate-800 text-[18px] font-bold mb-4 uppercase tracking-wider font-sans border-b border-gray-200 pb-2">
                            List of Equipments
                          </h3>
                          <div className="w-full overflow-hidden bg-white border border-gray-200 rounded-xl shadow-md mt-6">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[#ebf0f2] border-b border-gray-200">
                                    <th className="px-6 py-4 text-[15px] font-bold text-slate-700 uppercase tracking-wider w-24 text-center border-r border-gray-200">
                                      S.No
                                    </th>
                                    <th className="px-6 py-4 text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                                      List of Equipments
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150">
                                  {equipments.map((eq, eqIdx) => (
                                    <tr key={eqIdx} className="hover:bg-gray-50/50 transition-colors duration-150">
                                      <td className="px-6 py-4 text-[15px] text-[#444] font-medium text-center border-r border-gray-150">
                                        {eqIdx + 1}
                                      </td>
                                      <td className="px-6 py-4 text-[15px] text-[#444] font-medium font-sans">
                                        {eq}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Dedicated Student's Project Section */}
            {activeTab === 'student-project' && (
              <div className="space-y-8 font-sans">
                {(() => {
                  const section = dept.sections?.find(s => s.category === 'student-project');
                  if (!section) return null;

                  let projects = [];
                  try {
                    projects = JSON.parse(section.content);
                  } catch (e) {
                    console.error("Error parsing student projects JSON:", e);
                  }

                  if (!Array.isArray(projects) || projects.length === 0) {
                    return null;
                  }

                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      {projects.map((proj, idx) => {
                        const fullUrl = proj.image_url
                          ? (proj.image_url.startsWith('/api/') ? `${base}${proj.image_url}` : proj.image_url)
                          : '';

                        return (
                          <div key={idx} className="flex flex-col items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
                            {/* Project Image */}
                            <div className="w-full aspect-[4/3] bg-gray-50 border-b border-gray-100 relative flex items-center justify-center p-4">
                              {fullUrl ? (
                                <img
                                  src={fullUrl}
                                  alt={proj.title || "Student Project"}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-gray-300 text-5xl">📄</div>
                              )}
                            </div>
                            {/* Project Info */}
                            <div className="p-6 flex-1 flex flex-col justify-between w-full text-center space-y-3">
                              <h4 className="text-slate-800 text-[16px] md:text-[17px] font-bold line-clamp-3 min-h-[55px] leading-snug">
                                {proj.title}
                              </h4>
                              <div className="space-y-1">
                                <p className="text-slate-600 text-sm font-semibold">{proj.student}</p>
                                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">{proj.degree}</p>
                              </div>
                            </div>
                            {/* Bottom Golden Border/Accent */}
                            <div className="w-full h-1.5 bg-[#FFB81C]" />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Dedicated Best Practices Section */}
            {activeTab === 'best-practices' && (
              <div className="space-y-8 font-sans flex flex-col items-center">
                {(() => {
                  const section = dept.sections?.find(s => s.category === 'best-practices');
                  if (!section) return null;

                  let data = { title: 'BEST PRACTICES', video_url: '', description: 'Best Practices, Periyar University' };
                  try {
                    data = JSON.parse(section.content);
                  } catch (e) {
                    data = { title: 'BEST PRACTICES', video_url: '', description: section.content };
                  }

                  const getYouTubeEmbedUrl = (url) => {
                    if (!url) return '';
                    if (url.includes('youtube.com/embed/')) return url;

                    let videoId = '';
                    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
                    if (watchMatch && watchMatch[1]) {
                      videoId = watchMatch[1];
                    }
                    if (videoId) {
                      return `https://www.youtube.com/embed/${videoId}`;
                    }
                    return url;
                  };

                  const embedUrl = getYouTubeEmbedUrl(data.video_url);

                  return (
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-300">
                      <h2 className="text-2xl font-extrabold text-slate-800 tracking-wider text-center uppercase">
                        {data.title || 'BEST PRACTICES'}
                      </h2>

                      {embedUrl ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title={data.title || "YouTube video player"}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-250 bg-gray-50 flex items-center justify-center text-slate-400 font-bold">
                          No Video URL configured yet.
                        </div>
                      )}

                      <p className="text-slate-700 text-lg font-bold text-center mt-4">
                        {data.description}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Dedicated Finance Details Section */}
            {activeTab === 'finance-details' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-300 font-sans">
                {(() => {
                  const section = dept.sections?.find(s => s.category === 'finance-details');
                  if (!section || !section.content) return null;

                  let items = [];
                  try {
                    items = JSON.parse(section.content);
                  } catch (e) {
                    return <div className="prose max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }} />;
                  }

                  if (!Array.isArray(items) || items.length === 0) {
                    return null;
                  }

                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');

                  return (
                    <div className="space-y-6">
                      <h2 className="text-xl font-black text-slate-800 m-0 border-b border-slate-100 pb-3 flex items-center gap-2">
                        Finance Details
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px] font-extrabold text-slate-700">
                        <span className="text-slate-500 font-bold">Finance Details</span>
                        {items.map((item, idx) => {
                          const imgUrl = item.image_url.startsWith('http') ? item.image_url : `${base}${item.image_url}`;
                          return (
                            <React.Fragment key={idx}>
                              <a
                                href={imgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#990033] hover:text-[#80002a] hover:underline font-bold transition-all duration-200"
                              >
                                {item.label}
                              </a>
                              {idx < items.length - 1 && <span className="text-slate-350 font-normal">|</span>}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {dept.sections && dept.sections
              .filter(section => section.category === activeTab && activeTab !== 'museum' && activeTab !== 'energy-environment-park' && activeTab !== 'student-project' && activeTab !== 'best-practices' && activeTab !== 'finance-details')
              .map((section, idx) => {
                if (section.content?.startsWith('[BOTANY_YEARLY_GALLERY]')) {
                  let albums = [];
                  try {
                    const jsonStr = section.content.replace('[BOTANY_YEARLY_GALLERY]', '');
                    albums = JSON.parse(jsonStr) || [];
                  } catch (e) {
                    console.error("Error parsing yearly gallery:", e);
                  }

                  if (albums.length === 0) return null;

                  return (
                    <div key={section.id || idx} className="space-y-4 animate-in fade-in duration-500 w-full mb-8 font-sans">
                      {albums.map((album, albIdx) => {
                        const isExpanded = expandedYears[album.year];
                        return (
                          <div key={albIdx} className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100">
                            <button
                              onClick={() => toggleYear(album.year)}
                              className="w-full p-4 flex justify-between items-center border-none text-left cursor-pointer transition-all duration-300 select-none"
                              style={{
                                backgroundColor: '#85c5e3',
                                color: '#333333',
                                fontFamily: '"CMU Sans Serif Demi borderless", "CMU Sans Serif", "Computer Modern Sans", sans-serif',
                                fontSize: '20px',
                              }}
                            >
                              <span>{album.year}</span>
                              <span className="text-lg transform transition-transform duration-300 flex items-center justify-center">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                {!album.images || album.images.length === 0 ? (
                                  <p className="text-gray-450 italic text-sm text-center py-6">No images available for this year.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {album.images.map((imgUrl, imgIdx) => {
                                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                                      const base = apiUrl.replace('/api', '');
                                      const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                                      return (
                                        <div
                                          key={imgIdx}
                                          className="group overflow-hidden rounded-xl border border-slate-150 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={fullUrl}
                                            alt={`Botany Activities Year ${album.year} - Photo ${imgIdx + 1}`}
                                            className="w-full aspect-[4/3] object-cover block group-hover:scale-105 transition-transform duration-500 ease-out"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                if (section.content?.includes('[SPECIALIZED_FACILITIES]')) {
                  const htmlContent = section.content.replace('[SPECIALIZED_FACILITIES]', '').trim();
                  return (
                    <div key={section.id || idx} className="animate-in fade-in duration-500 w-full mb-8">
                      {section.section_title && section.section_title.toLowerCase() !== 'specialized facilities cards grid' && section.section_title.toLowerCase() !== 'facilities list' && (
                        <h3 className="text-[#990033] text-[20px] font-bold mb-4 uppercase flex items-center gap-2">
                          {section.section_title}
                        </h3>
                      )}
                      {htmlContent && (
                        <div
                          className="prose max-w-none w-full mb-6"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
                        />
                      )}
                      <FacilitiesSection facilities={dept.facilities} />
                    </div>
                  );
                }
                if (section.content?.startsWith('[SECTION_GALLERY]')) {
                  let events = [];
                  try {
                    const jsonStr = section.content.replace('[SECTION_GALLERY]', '');
                    events = JSON.parse(jsonStr) || [];
                  } catch (e) {
                    console.error("Error parsing section gallery:", e);
                  }
                  if (events.length === 0) {
                    return null;
                  }
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');
                  return (
                    <div key={section.id || idx} className="animate-in fade-in duration-500 w-full mb-8">
                      {section.section_title && (
                        <h3 className="text-[#990033] text-[20px] font-bold mb-4 uppercase flex items-center gap-2">
                          {section.section_title}
                        </h3>
                      )}
                      <div className="space-y-10">
                        {events.map((evt, evtIdx) => (
                          <div key={evtIdx}>
                            {evt.title && (
                              <h3 style={{
                                color: '#333',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                marginBottom: '16px',
                                textTransform: 'uppercase',
                                borderBottom: '2px solid #990033',
                                paddingBottom: '8px',
                                fontFamily: 'Arial, sans-serif'
                              }}>
                                {evt.title}
                              </h3>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {evt.images && evt.images.map((imgUrl, imgIdx) => {
                                const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                                const isSingle = evt.images.length === 1;
                                return (
                                  <div
                                    key={imgIdx}
                                    className={`w-full overflow-hidden rounded-xl border border-slate-150 shadow-sm transition-all duration-300 hover:shadow-md ${isSingle ? 'sm:col-span-2 max-w-2xl mx-auto' : ''
                                      }`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={fullUrl}
                                      alt={evt.title || 'Activity photo'}
                                      className="w-full aspect-[4/3] object-cover block hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (section.content?.includes('[SPECIALIZED_ACTIVITIES_GALLERY]')) {
                  const htmlContent = section.content.replace('[SPECIALIZED_ACTIVITIES_GALLERY]', '').trim();
                  const filteredEvents = dept.activity_gallery?.events?.filter(evt => evt.category !== 'Programmes' && evt.category !== "Student's Achievements" && evt.category !== 'Facilities') || [];
                  if (filteredEvents.length === 0 && !htmlContent) {
                    return null;
                  }
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');
                  return (
                    <div key={section.id || idx} className="animate-in fade-in duration-500 w-full mb-8">
                      {section.section_title && section.section_title.toLowerCase() !== 'specialized activities photo gallery' && (
                        <h3 className="text-[#990033] text-[20px] font-bold mb-4 uppercase flex items-center gap-2">
                          {section.section_title}
                        </h3>
                      )}
                      {htmlContent && (
                        <div
                          className="prose max-w-none w-full mb-6"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
                        />
                      )}
                      {filteredEvents.length > 0 && (
                        <div className="space-y-10">
                          {filteredEvents.map((evt, evtIdx) => (
                            <div key={evtIdx}>
                              {evt.title && (
                                <h3 style={{
                                  color: '#333',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  marginBottom: '16px',
                                  textTransform: 'uppercase',
                                  borderBottom: '2px solid #990033',
                                  paddingBottom: '8px',
                                  fontFamily: 'Arial, sans-serif'
                                }}>
                                  {evt.title}
                                </h3>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {evt.images && evt.images.map((imgUrl, imgIdx) => {
                                  const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                                  const isSingle = evt.images.length === 1;
                                  return (
                                    <div
                                      key={imgIdx}
                                      className={`w-full overflow-hidden rounded-xl border border-slate-150 shadow-sm transition-all duration-300 hover:shadow-md ${isSingle ? 'sm:col-span-2 max-w-2xl mx-auto' : ''
                                        }`}
                                    >
                                      <img
                                        src={fullUrl}
                                        alt={evt.title || 'Activity photo'}
                                        className="w-full aspect-[4/3] object-cover block hover:scale-105 transition-transform duration-550 ease-out"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                if (section.content?.includes('[SPECIALIZED_FACILITIES_GALLERY]')) {
                  const htmlContent = section.content.replace('[SPECIALIZED_FACILITIES_GALLERY]', '').trim();
                  const filteredEvents = dept.activity_gallery?.events?.filter(evt => evt.category === 'Facilities') || [];
                  if (filteredEvents.length === 0 && !htmlContent) {
                    return null;
                  }
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                  const base = apiUrl.replace('/api', '');
                  return (
                    <div key={section.id || idx} className="animate-in fade-in duration-500 w-full mb-8 font-sans">
                      {section.section_title && section.section_title.toLowerCase() !== 'specialized facilities event gallery' && section.section_title.toLowerCase() !== 'facilities list' && (
                        <h3 className="text-[#990033] text-[20px] font-bold mb-4 uppercase flex items-center gap-2">
                          {section.section_title}
                        </h3>
                      )}
                      {htmlContent && (
                        <div
                          className="prose max-w-none w-full mb-6"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
                        />
                      )}
                      {filteredEvents.length > 0 && (
                        <div className="space-y-10">
                          {filteredEvents.map((evt, evtIdx) => (
                            <div key={evtIdx}>
                              {evt.title && (
                                <h3 style={{
                                  color: '#333',
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  marginBottom: '16px',
                                  textTransform: 'uppercase',
                                  borderBottom: '2px solid #990033',
                                  paddingBottom: '8px',
                                  fontFamily: 'Arial, sans-serif'
                                }}>
                                  {evt.title}
                                </h3>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {evt.images && evt.images.map((imgUrl, imgIdx) => {
                                  const fullUrl = imgUrl.startsWith('/api/') ? `${base}${imgUrl}` : imgUrl;
                                  const isSingle = evt.images.length === 1;
                                  return (
                                    <div
                                      key={imgIdx}
                                      className={`w-full overflow-hidden rounded-xl border border-slate-150 shadow-sm transition-all duration-300 hover:shadow-md ${isSingle ? 'sm:col-span-2 max-w-2xl mx-auto' : ''
                                        }`}
                                    >
                                      <img
                                        src={fullUrl}
                                        alt={evt.title || 'Facility photo'}
                                        className="w-full aspect-[4/3] object-cover block hover:scale-105 transition-transform duration-550 ease-out"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                const hasTable = /<table[\s>]/i.test(section.content);

                let contentHtml = section.content;
                if (contentHtml) {
                  // Clean and convert all HTML &nbsp; entities and Unicode non-breaking spaces to standard spaces globally
                  contentHtml = contentHtml
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\u00a0/g, ' ')
                    .replace(/\xa0/g, ' ')
                    .replace(/padding:\s*(12px\s+20px|8px\s+15px)/gi, 'padding: 6px 12px')
                    .replace(/font-size:\s*(16px|14px)/gi, 'font-size: 12px')
                    .replace(/(width|height)="(20|16)"/gi, '$1="14"')
                    .replace(/margin-bottom:\s*(25px|12px)/gi, 'margin-bottom: 8px')
                    .replace(/gap:\s*8px/gi, 'gap: 6px');
                }
                if (isUgcMrpTab && typeof window !== 'undefined') {
                  try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(contentHtml, 'text/html');
                    const tables = doc.querySelectorAll('table');
                    tables.forEach(table => {
                      const firstRow = table.querySelector('tr');
                      if (firstRow) {
                        const cells = firstRow.querySelectorAll('td, th');
                        // ONLY style as header if first row has exactly 1 column/cell
                        if (cells.length === 1) {
                          const cell = cells[0];
                          cell.setAttribute('colspan', '2');
                          cell.style.cssText = 'background-color: #1fa2b8 !important; color: #ffffff !important; font-weight: bold !important; text-align: center !important; border: none !important; text-transform: uppercase; padding: 15px 12px !important;';
                        }
                      }
                    });
                    contentHtml = doc.body.innerHTML;
                  } catch (e) {
                    console.error("UGC-MRP parser error:", e);
                  }
                }

                if (isJournalTab) {
                  contentHtml = contentHtml.replace(
                    /<img([^>]*)\/?>/gi,
                    (match) => {
                      const srcMatch = match.match(/src="([^"]*)"/i);
                      const altMatch = match.match(/alt="([^"]*)"/i);
                      const src = srcMatch ? srcMatch[1] : '';
                      const alt = altMatch ? altMatch[1] : 'Journal Logo';
                      return `<img src="${src}" alt="${alt}" style="display: block !important; width: 300px !important; height: 70px !important; object-fit: contain !important; margin-bottom: 20px !important;" />`;
                    }
                  );
                }

                if (isConferenceTab) {
                  // Clean and style any tables in the Conference tab
                  contentHtml = contentHtml.replace(
                    /<table([^>]*)>/gi,
                    '<table style="width: 100% !important; border-collapse: collapse !important; border: 1px solid #e2e8f0 !important; margin: 20px 0 !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; background-color: #ffffff !important;">'
                  );

                  // Style tbody rows
                  contentHtml = contentHtml.replace(
                    /<tr([^>]*)>/gi,
                    '<tr style="border-bottom: 1px solid #e2e8f0 !important; background-color: #ffffff !important;">'
                  );

                  // Style table cells
                  contentHtml = contentHtml.replace(
                    /<td([^>]*)>([\s\S]*?)<\/td>/gi,
                    (match, p1, p2) => {
                      // Check if this is the brochure cell
                      if (p2.toLowerCase().includes('href') || p2.toLowerCase().includes('brochure')) {
                        const hrefMatch = p2.match(/href="([^"]*)"/i);
                        const fileUrl = hrefMatch ? hrefMatch[1] : '#';
                        return `<td style="padding: 16px 20px !important; text-align: center !important; vertical-align: middle !important; width: 160px !important;"><a href="${fileUrl}" target="_blank" style="display: inline-block !important; background-color: #1fa2b8 !important; color: #ffffff !important; font-weight: bold !important; padding: 8px 18px !important; border-radius: 6px !important; text-decoration: none !important; font-size: 12px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; box-shadow: 0 2px 4px rgba(31,162,184,0.15) !important; transition: all 0.2s ease !important; border: 1px solid #1fa2b8 !important;">Brochure</a></td>`;
                      } else {
                        // Clean dynamic inline styles but keep bold / semantic formatting tags (strong, b, em, etc.)
                        const cleanHtml = p2.replace(/style="[^"]*"/gi, '').trim();
                        return `<td style="border-right: 1px solid #e2e8f0 !important; padding: 16px 20px !important; text-align: left !important; vertical-align: middle !important; color: #334155 !important; font-size: 15px !important; line-height: 1.6 !important;">${cleanHtml}</td>`;
                      }
                    }
                  );
                }

                return (
                  <div key={idx} className="animate-in fade-in slide-in-from-top-2 duration-500">
                    {/* Only show section title if it's different from the category name or if there is no table markup */}
                    {section.section_title && section.section_title.toLowerCase() !== activeTab.toLowerCase() && section.section_title.toLowerCase() !== 'facilities list' && activeTab !== 'dst-faculty' && !hasTable && (
                      <h3 className="text-[#990033] text-[20px] font-bold mb-4 uppercase flex items-center gap-2">
                        {section.section_title}
                      </h3>
                    )}
                    <div
                      onClick={handleSyllabusContainerClick}
                      className={`text-[15px] md:text-[16px] text-[#444] leading-[1.8] ${isSyllabusTab ? 'syllabus-content' : isProgrammesTab ? 'programmes-content' : isProjectsTab ? 'projects-content' : isUgcMrpTab ? 'ugc-mrp-content' : isJournalTab ? 'journal-content prose' : 'prose'} max-w-none w-full whitespace-normal break-words overflow-x-auto scrollbar-hide 
                        prose-headings:text-[#7a0000] prose-a:text-[#d9534f] prose-a:font-bold 
                        prose-table:w-full prose-table:my-6
                        prose-table:border-collapse prose-td:p-3 prose-th:p-3`}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
                    />
                  </div>
                );
              })}
          </div>
          {activeTab !== 'faculty' && activeTab !== 'guest-faculty' && activeTab !== 'alumni' && activeTab !== 'placement' && activeTab !== 'museum' && activeTab !== 'facilities' && activeTab !== 'energy-environment-park' && activeTab !== 'student-project' && activeTab !== 'best-practices' && activeTab !== 'finance-details' && dept.sections &&
            dept.sections.filter(s => s.category === activeTab).length === 0 &&
            !((activeTab === 'activities' || activeTab === 'gallery') && dept.activity_gallery && dept.activity_gallery.events && dept.activity_gallery.events.length > 0) &&
            null}
        </div>
      </main>

      <Footer />

      {flipbookFile && (
        <FlipbookModal
          fileUrl={flipbookFile.url}
          title={flipbookFile.title}
          onClose={() => setFlipbookFile(null)}
        />
      )}
    </div>
  );
}
