'use client';

import React from 'react';

const schoolData = [
  {
    "school": "School of Biosciences",
    "departments": ["Biochemistry", "Biotechnology", "Microbiology"]
  },
  {
    "school": "School of Mathematics",
    "departments": ["Computer Science", "Library and Information Science", "Mathematics", "Statistics"]
  },
  {
    "school": "School of Physical Sciences",
    "departments": ["Physics", "Chemistry", "Geology"]
  },
  {
    "school": "School of Business Studies",
    "departments": ["Commerce", "Economics", "Management Studies"]
  },
  {
    "school": "School of Languages",
    "departments": ["English", "Tamil"]
  },
  {
    "school": "School of Professional Studies",
    "departments": ["Education", "Food Science and Nutrition", "Textiles and Apparel Design"]
  },
  {
    "school": "School of Social Sciences",
    "departments": ["Sociology", "Psychology", "Journalism and Mass Communication", "History"]
  },
  {
    "school": "School of Life Sciences",
    "departments": ["Botany", "Zoology", "Nutrition and Dietetics"]
  },
  {
    "school": "School of Energy & Environmental Sciences",
    "departments": ["Energy Science and Technology", "Environmental Science"]
  }
];

export default function SchoolsAndDepartments() {
  const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1140px] mx-auto">
        <h2 className="text-[#007bff] text-[34px] font-bold text-center uppercase mb-12 tracking-wide font-sans">
          SCHOOLS AND DEPARTMENTS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schoolData.map((school, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-[#a52a2a] text-[20px] font-bold mb-4 font-sans">
                {school.school}
              </h3>
              <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-sm shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#dee2e6] m-0 p-0 list-none">
                  {school.departments.map((dept, deptIndex) => (
                    <li key={deptIndex} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                      <a 
                        href={`/dept/${slugify(dept)}`} 
                        className="text-[#007bff] text-[15px] font-medium hover:underline block"
                      >
                        {dept}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
