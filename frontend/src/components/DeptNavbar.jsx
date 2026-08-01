'use client';
import React from 'react';

export default function DeptNavbar({ links, activeTab }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40 print:hidden">
      <div className="container mx-auto max-w-[1140px] px-[15px]">
        <ul className="flex flex-wrap list-none p-0 m-0">
          {links.map((link, idx) => {
            // Check if activeTab matches the link's slug (which is what we use in page.js)
            const isActive = activeTab === link.slug;

            return (
              <li key={idx} className="relative">
                <a
                  href={link.url}
                  className={`block py-4 px-4 text-[13px] uppercase tracking-[0.02em] font-bold transition-all whitespace-nowrap leading-none no-underline border-t-2 border-b border-l border-r
                    ${isActive 
                      ? 'text-[#990033] bg-white border-t-[#990033] border-b-transparent border-l-gray-200 border-r-gray-200' 
                      : 'text-[#7f2233] bg-transparent border-transparent border-b-transparent hover:text-[#990033]'
                    }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
