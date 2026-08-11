'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const defaultMenuItems = [
  {
    label: 'University',
    links: [
      { name: 'About University', url: 'https://www.periyaruniversity.ac.in/AboutUs.php' },
      { name: 'VC Desk', url: 'https://www.periyaruniversity.ac.in' },
      { name: 'Services', url: 'https://www.periyaruniversity.ac.in/services.php' },
      { name: 'Facilities', url: 'https://www.periyaruniversity.ac.in/Facilities.php' },
      {
        name: '2(f) - 12 (B)',
        links: [
          { name: '2(f)', url: 'https://www.periyaruniversity.ac.in/Documents/2025/Ranking/2f.jpg' },
          { name: '12(B)', url: 'https://www.periyaruniversity.ac.in/Documents/2025/Ranking/12b.jpg' },
        ]
      },
      { name: 'Approval', url: 'https://www.periyaruniversity.ac.in/Documents/2025/Ranking/tnapproval.pdf' },
      { name: 'Act and Statutes', url: 'https://www.periyaruniversity.ac.in/Documents/2016/01/ACT-STATUTES-Book-2016.pdf' },
      { name: 'Roll Call', url: 'https://www.periyaruniversity.ac.in/rollcall.php' },
      { name: 'Funding Agency', url: 'https://www.periyaruniversity.ac.in/Images/Fund_Agency.pdf' },
      { name: 'Organogram', url: 'https://www.periyaruniversity.ac.in/Documents/2021/organogram.pdf' },
      { name: 'Campus Map', url: 'https://www.periyaruniversity.ac.in/campusmap.php' },
    ]
  },
  {
    label: 'Authorities',
    links: [
      { name: 'Chancellor', url: 'https://www.periyaruniversity.ac.in/chancellor.php' },
      { name: 'Pro Chancellor', url: 'https://www.periyaruniversity.ac.in/prochancellor.php' },
      { name: 'Vice Chancellor', url: 'https://www.periyaruniversity.ac.in/vicechancellor.php' },
      { name: 'Members of Syndicate', url: 'https://www.periyaruniversity.ac.in/Syndicate.php' },
      { name: 'Members of Senate', url: 'https://www.periyaruniversity.ac.in/Senate.php' },
      { name: 'Members of Standing Committee', url: 'https://www.periyaruniversity.ac.in/scaa.php' },
      { name: 'Planning Board', url: 'https://www.periyaruniversity.ac.in/PlanningBoard.php' },
    ]
  },
  {
    label: 'Administration',
    links: [
      { name: 'Registrar', url: 'https://www.periyaruniversity.ac.in/registrar.php' },
      { name: 'Controller of Examinations', url: 'https://www.periyaruniversity.ac.in/coe.php' },
      { name: 'Deans and Coordinators', url: 'https://www.periyaruniversity.ac.in/Dean.php' },
      { name: 'Finance Officer', url: 'https://www.periyaruniversity.ac.in/Finance.php' },
    ]
  },
  {
    label: 'Academic',
    links: [
      { name: 'Schools and Departments', url: '/' },
      { name: 'CBCS Regulations', url: 'https://www.periyaruniversity.ac.in/Documents/2021/CBCS_Regulations.pdf' },
      { name: 'Centres and Cells', url: 'https://www.periyaruniversity.ac.in/Centres.php' },
      { name: 'Awards and Honors', url: 'https://www.periyaruniversity.ac.in/Awards.php' },
      { name: 'Centre for PG and Research Studies', url: 'https://www.periyaruniversity.ac.in/Dept/pgex.php' },
      { name: 'Community Colleges', url: 'https://www.periyaruniversity.ac.in/Community_Colleges.php' },
      { name: 'Affiliated Colleges', url: 'https://www.periyaruniversity.ac.in/Affiliated_Colleges.php' },
      {
        name: 'BOS Members',
        links: [
          { name: 'University Departments', url: 'https://www.periyaruniversity.ac.in/Documents/2025/CDC/ud_bos_members1.pdf' },
          { name: 'Affiliated Colleges for UG Programmes', url: 'https://www.periyaruniversity.ac.in/Documents/2025/CDC/UG_BOS_Members.pdf' },
          { name: 'Affiliated Colleges for PG Programmes', url: 'https://www.periyaruniversity.ac.in/Documents/2025/CDC/PG_BOS_Members.pdf' },
        ]
      },
      { name: 'Memorandum of Understanding', url: 'https://www.periyaruniversity.ac.in/Images/MOU.pdf' },
    ]
  },
  {
    label: 'Admission',
    links: [
      { name: 'Admission Details', url: 'https://www.periyaruniversity.ac.in/Admission_Details.php' },
      {
        name: 'Programmes offered',
        links: [
          { name: 'University Departments', url: 'https://www.periyaruniversity.ac.in/Programmes_offered.php' },
          { name: 'Affiliated Colleges', url: 'https://www.periyaruniversity.ac.in/Programmes_offered_college23-24.php' },
        ]
      },
      { name: 'Eligibility Details', url: 'https://www.periyaruniversity.ac.in/Eligi.php' },
      { name: 'Fees Structure', url: 'https://www.periyaruniversity.ac.in/fees.php' },
      { name: 'Admission Process', url: 'https://www.periyaruniversity.ac.in/Prospectus.php' },
      { name: 'Scholarships', url: 'https://www.periyaruniversity.ac.in/StudentCorner.php' },
      { name: 'Fellowship', url: 'https://www.periyaruniversity.ac.in/Fellowship.php' },
    ]
  },
  { label: 'Research', url: 'https://www.periyaruniversity.ac.in/Research/' },
  {
    label: 'Examination',
    links: [
      { name: 'Revised Fees & PRIDE Fees Structure', url: 'https://www.periyaruniversity.ac.in/examfee.php' },
      { name: 'Unclaimed Certificates', url: 'https://www.periyaruniversity.ac.in/unclime.php' },
      { name: 'E-Sanad Services', url: 'https://www.periyaruniversity.ac.in/esanad.php' },
      { name: 'Examination Schedule', url: 'https://www.periyaruniversity.ac.in/COEExamSche.php' },
      { name: 'Results', url: 'https://www.periyaruniversity.ac.in/Result.php' },
      { name: 'Downloads', url: 'https://www.periyaruniversity.ac.in/Download.php' },
      { name: 'Procedure for Certification', url: 'https://www.periyaruniversity.ac.in/Cert_Procedure.php' },
    ]
  },
  {
    label: 'IQAC',
    links: [
      { name: 'About IQAC', url: 'https://www.periyaruniversity.ac.in/aboutiqac.php' },
      { name: 'Members', url: 'https://www.periyaruniversity.ac.in/iqac.php' },
      { name: 'NAAC Accreditation', url: 'https://www.periyaruniversity.ac.in/nacc.php' },
      {
        name: 'Call for CAS (Application)',
        links: [
          { name: '2025 - UD', url: 'https://www.periyaruniversity.ac.in/Documents/2025/CDC/cas_ud_app_2025.pdf' },
          { name: '2025 - PG', url: 'https://www.periyaruniversity.ac.in/Documents/2025/CDC/cas_pg_app_2025.pdf' },
          { name: '2024', url: 'https://www.periyaruniversity.ac.in/Documents/2024/CDC/cas_app_2024.pdf' },
          { name: '2018', url: 'https://www.periyaruniversity.ac.in/Documents/2023/CAS/CAS-Application-2018.pdf' },
          { name: '2016', url: 'https://www.periyaruniversity.ac.in/Documents/2023/CAS/CAS-Application-2016.pdf' },
        ]
      },
      { name: 'Policies', url: 'https://www.periyaruniversity.ac.in/Policies.php' },
      { name: 'Strategic Plan', url: 'https://www.periyaruniversity.ac.in/Strategic_Plan.php' },
      {
        name: 'IQAC Meetings',
        links: [
          { name: 'Meetings Minutes', url: 'https://www.periyaruniversity.ac.in/iqcmeet.php' },
          { name: 'Action Taken Report', url: 'https://www.periyaruniversity.ac.in/iqcatr.php' },
        ]
      },
      { name: 'AQAR', url: 'https://www.periyaruniversity.ac.in/aqar.php' },
      { name: 'Feedback System', url: 'https://www.periyaruniversity.ac.in/feedbacksystem.php' },
      { name: 'Best Practices', url: 'https://www.periyaruniversity.ac.in/bestpractices.php' },
      { name: 'Annual Report', url: 'https://www.periyaruniversity.ac.in/annualreport.php' },
      { name: 'Programme Brochure', url: 'https://www.periyaruniversity.ac.in/program_brochure.php' },
      {
        name: 'IIC',
        links: [
          { name: 'NISP', url: 'https://www.periyaruniversity.ac.in/iic/' },
        ]
      },
    ]
  },
  {
    label: 'Ranking',
    links: [
      { name: 'ARIIA', url: 'https://www.periyaruniversity.ac.in/ariia.php' },
      { name: 'NIRF', url: 'https://www.periyaruniversity.ac.in/nirf.php' },
      {
        name: 'IIC',
        links: [
          { name: '2023-24', url: 'https://www.periyaruniversity.ac.in/Need/images/iic_23.jpg' },
          { name: '2022-23', url: 'https://www.periyaruniversity.ac.in/Need/images/iic22_23.jpg' },
          { name: '2021-22', url: 'https://www.periyaruniversity.ac.in/Need/images/iic.jpg' },
        ]
      },
    ]
  },
  { label: 'DistanceEdu.', url: 'http://pride.periyaruniversity.ac.in/' },
  { label: 'Contact', url: 'https://www.periyaruniversity.ac.in/Contact.php' },
];

const DropdownItem = ({ item, isMobile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubmenu = item.links && item.links.length > 0;

  return (
    <li className={`relative w-full group/sub border-b border-gray-300 md:border-b-0`}>
      <div className={`flex items-center justify-between ${isMobile ? 'bg-white' : ''}`}>
        <a
          href={item.url || '#'}
          className={`block px-4 py-[10px] md:py-[8px] text-[15px] md:text-[14px] lg:text-[15px] font-semibold transition-colors flex-1 no-underline ${
            isMobile ? 'text-[#000066]' : 'text-[#000066] hover:bg-[#990033] hover:text-white'
          }`}
          onClick={(e) => {
            if (isMobile && hasSubmenu) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {item.name || item.label}
          {hasSubmenu && (
            <i className={`fa ml-1 text-[11px] ${isOpen ? 'fa-caret-down' : 'fa-caret-right'}`}></i>
          )}
        </a>
      </div>
      {hasSubmenu && (
        <ul className={`
          ${isOpen ? 'block' : 'hidden md:group-hover/sub:block'} 
          ${isMobile ? 'relative w-full bg-white border-l-4 border-[#000066]/10' : 'absolute left-full top-0 bg-white shadow-xl min-w-max z-[110] border border-gray-200'}
          list-none p-0
        `}>
          {item.links.map((subLink, idx) => (
            <DropdownItem key={idx} item={subLink} isMobile={isMobile} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function Navbar() {
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    fetch(`${apiUrl}/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.navbarMenu && Array.isArray(data.navbarMenu)) setMenuItems(data.navbarMenu);
      })
      .catch(err => console.error('Failed to fetch navbar settings:', err.message));
  }, []);

  const handleLinkClick = (e, idx, hasLinks) => {
    // Detect mobile correctly
    const isMobile = window.innerWidth < 768;
    if (isMobile && hasLinks) {
      e.preventDefault();
      setMobileActiveIdx(mobileActiveIdx === idx ? null : idx);
    }
  };

  return (
    <nav className="w-full z-50 bg-white relative my-4">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
      
      <div className="container mx-auto max-w-[1140px] px-0 bg-[#000066] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-stretch h-full">

          {/* Home Link Section */}
          <div className="px-3 md:px-3 py-2 md:py-0 border-b border-white/10 md:border-b-0 md:border-r border-white/20 flex items-center">
            <Link href="/" className="inline-block border border-white/30 p-[2px] rounded-sm">
              <img src="/home.png" alt="Home" width={15} height={20} className="h-[18px] md:h-[18px] w-auto invert" />
            </Link>
          </div>

          <ul className="flex flex-col md:flex-row m-0 p-0 list-none w-full">
            {menuItems.map((item, idx) => {
              const hasLinks = item.links && item.links.length > 0;
              return (
                <li key={idx} className="relative group md:dropdown border-b border-white/10 md:border-b-0 flex flex-col md:flex-row md:items-stretch">
                  <div className="flex items-stretch justify-between w-full">
                    <a
                      href={item.url || '#'}
                      className="px-4 md:px-[6px] lg:px-2 py-[12px] md:py-[10px] text-white text-[15px] md:text-[13px] lg:text-[15px] font-bold hover:bg-white/10 flex-1 transition-colors no-underline capitalize flex items-center whitespace-nowrap"
                      onClick={(e) => handleLinkClick(e, idx, hasLinks)}
                    >
                      {item.label}
                      {hasLinks && (
                        <i className={`fa ml-1 text-[11px] text-white/80 ${mobileActiveIdx === idx ? 'fa-caret-down' : 'fa-caret-down'}`}></i>
                      )}
                    </a>
                  </div>

                  {/* Dropdown Menu */}
                  {hasLinks && (
                    <ul className={`
                      ${mobileActiveIdx === idx ? 'block' : 'hidden'} 
                      md:group-hover:block md:absolute left-0 top-full bg-white shadow-2xl min-w-max z-[100] md:border border-gray-300 py-0 list-none p-0
                      relative md:absolute w-full md:w-auto
                    `}>
                      {item.links.map((link, lIdx) => (
                        <DropdownItem key={lIdx} item={link} isMobile={mobileActiveIdx === idx} />
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
