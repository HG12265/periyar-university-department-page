'use client';

import React from 'react';

const academicLinksCol1 = [
  { name: 'Affiliated Colleges', url: 'https://www.periyaruniversity.ac.in/Affiliated_Colleges.php' },
  { name: 'Community Colleges', url: 'https://www.periyaruniversity.ac.in/Community_Colleges.php' },
  { name: 'Library', url: 'https://www.periyaruniversity.ac.in/library.php' },
  { name: 'PG Research Studies', url: 'https://www.periyaruniversity.ac.in/Dept/pgex.php' },
  { name: 'Physical Education', url: 'https://www.periyaruniversity.ac.in/PhyEdu.php' },
  { name: 'PU-CRI', url: 'https://www.periyaruniversity.ac.in/centre/CRI/' },
  { name: 'Schools and Departments', url: '/dept' }
];

const academicLinksCol2 = [
  { name: 'Academic Calendar', url: 'https://www.periyaruniversity.ac.in/academiccalendar.php' },
  { name: 'Achievements', url: 'https://www.periyaruniversity.ac.in/Major_Achievements.php' },
  { name: 'Admission Details', url: 'https://www.periyaruniversity.ac.in/Admission_Details.php' },
  { name: 'Awards', url: 'https://www.periyaruniversity.ac.in/Awards.php' },
  { name: 'Centres & Cells', url: 'https://www.periyaruniversity.ac.in/Centres.php' },
  { name: 'Distance Education', url: 'http://pride.periyaruniversity.ac.in/' },
  { name: 'Employee Portal', url: 'https://www.periyaruniversity.ac.in/login.php' }
];

const quickLinksCol1 = [
  { name: 'Examination Schedule', url: 'https://www.periyaruniversity.ac.in/COEExamSche.php' },
  { name: 'Facilities', url: 'https://www.periyaruniversity.ac.in/Facilities.php' },
  { name: 'Fees Structure', url: 'https://www.periyaruniversity.ac.in/fees.php' },
  { name: 'Login', url: 'https://www.periyaruniversity.ac.in/login.php' },
  { name: 'OBE Syllabus', url: 'https://www.periyaruniversity.ac.in/obe_syllabus.php' },
  { name: 'Placement', url: 'https://www.periyaruniversity.ac.in/Placement.php' },
  { name: 'Programmes offered', url: 'https://www.periyaruniversity.ac.in/Programmes_offered.php' }
];

const quickLinksCol2 = [
  { name: 'Publication', url: 'https://www.periyaruniversity.ac.in/publication.php' },
  { name: 'Research Projects', url: 'https://www.periyaruniversity.ac.in/ResearchProjects.php' },
  { name: 'Scholarship', url: 'https://www.periyaruniversity.ac.in/StudentCorner.php' },
  { name: 'Students Portal', url: 'https://www.periyaruniversity.ac.in/studentportal.php' },
  { name: 'Syllabus', url: 'https://www.periyaruniversity.ac.in/syllabus.php' },
  { name: 'UICP Institute List', url: 'https://www.periyaruniversity.ac.in/uicp.php' }
];

export default function Footer() {
  return (
    <footer className="w-full bg-white pb-10 font-sans">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
      
      <div className="container mx-auto max-w-[1140px] px-[15px]">
        {/* Main Blue Box (Shadowed and contained) */}
        <div className="shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden">
          
          {/* Dark Blue Section */}
          <div className="bg-[#0b0366] pt-10 pb-10 px-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Academic Section */}
              <div>
                <h5 className="text-[#ffd700] font-bold text-[20px] mb-6 uppercase tracking-wider">
                  Academic
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <ul className="list-none p-0 m-0 space-y-2">
                    {academicLinksCol1.map((link, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#e83e8c] mr-2 font-bold text-[14px] select-none">•</span>
                        <a href={link.url} className="text-white hover:text-[#ffd700] text-[14.5px] leading-snug font-normal transition-colors no-underline">
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <ul className="list-none p-0 m-0 space-y-2">
                    {academicLinksCol2.map((link, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#e83e8c] mr-2 font-bold text-[14px] select-none">•</span>
                        <a href={link.url} className="text-white hover:text-[#ffd700] text-[14.5px] leading-snug font-normal transition-colors no-underline">
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Links Section */}
              <div>
                <h5 className="text-[#ffd700] font-bold text-[20px] mb-6 uppercase tracking-wider">
                  Quick Links
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <ul className="list-none p-0 m-0 space-y-2">
                    {quickLinksCol1.map((link, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#e83e8c] mr-2 font-bold text-[14px] select-none">•</span>
                        <a href={link.url} className="text-white hover:text-[#ffd700] text-[14.5px] leading-snug font-normal transition-colors no-underline">
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <ul className="list-none p-0 m-0 space-y-2">
                    {quickLinksCol2.map((link, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#e83e8c] mr-2 font-bold text-[14px] select-none">•</span>
                        <a href={link.url} className="text-white hover:text-[#ffd700] text-[14.5px] leading-snug font-normal transition-colors no-underline">
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* Light Blue Horizontal Bar (Inside the shadowed box) */}
          <div className="bg-[#337cfd] py-4 px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3.5">
            <a href="https://www.periyaruniversity.ac.in/Dean.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Faculty Portal
            </a>
            <a href="https://www.periyaruniversity.ac.in/mail.php" className="text-white text-[15px] font-medium hover:underline flex items-center justify-center no-underline transition-colors">
              <i className="fa fa-envelope mr-1.5"></i> WebMail
            </a>
            <a href="https://www.periyaruniversity.ac.in/StudentCorner.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Student Corner
            </a>
            <a href="https://www.periyaruniversity.ac.in/rti.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              RTI
            </a>
            <a href="https://www.periyaruniversity.ac.in/gallery.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Gallery
            </a>
            <a href="https://www.periyaruniversity.ac.in/Policies.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Policies
            </a>
            <a href="https://www.periyaruniversity.ac.in/bestpractices.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Best Practices
            </a>
            <a href="https://www.periyaruniversity.ac.in/Contact.php" className="text-white bg-[#dc3545] hover:bg-[#c82333] text-[15px] font-bold px-3 py-1.5 rounded-sm no-underline transition-colors flex items-center justify-center shadow-sm">
              Helpdesk
            </a>
            <a href="https://www.periyaruniversity.ac.in/Download.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Downloads
            </a>
            <a href="https://www.periyaruniversity.ac.in/campusmap.php" className="text-white text-[15px] font-medium hover:underline no-underline transition-colors flex items-center justify-center">
              Campus Map
            </a>
          </div>
        </div>

        {/* Copyright Area (Outside the box) */}
        <div className="pt-6 text-center">
          <p className="text-[14.5px] font-bold text-[#444] m-0 mb-1">
            © Periyar University - 2022. All Rights Reserved.
          </p>
          <p className="text-[14px] text-[#666] m-0">
            Developed & Maintaining by <a href="https://www.periyaruniversity.ac.in/cc.php" className="text-[#337cfd] hover:underline font-semibold no-underline">Computer Centre</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
