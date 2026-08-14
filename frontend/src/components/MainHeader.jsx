'use client';

import React from 'react';

export default function MainHeader() {
  return (
    <div className="bg-white w-full py-4 md:py-6">
      <div className="container mx-auto max-w-[1140px] px-[15px]">
        <div className="flex flex-wrap -mx-[15px] items-start">
          
          {/* Logo and Title Section */}
          <div className="w-full md:w-2/3 px-[15px]">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              
              {/* Logo - Centered on mobile, left-aligned on desktop */}
              <div className="w-full md:w-auto flex justify-center md:justify-start flex-shrink-0">
                <a href="https://www.periyaruniversity.ac.in/">
                  <img src="/dept/logo.JPG" alt="Logo" className="w-[130px] md:w-[150px] h-auto" />
                </a>
              </div>

              {/* Text Content - Left-aligned on mobile and desktop */}
              <div className="w-full text-left px-2 md:px-0">
                <h3 className="text-[#990033] text-[26px] md:text-[29px] font-bold font-tamil mt-0 mb-1 leading-snug">
                  பெரியார் <br className="block md:hidden" /> பல்கலைக்கழகம்
                </h3>
                <h5 className="text-[#003399] text-[15px] md:text-[17px] font-bold font-tamil mb-2 leading-snug">
                  அரசு பல்கலைக்கழகம், <br className="block md:hidden" /> சேலம்.
                </h5>
                <h2 className="text-[#004080] text-[28px] md:text-[36px] font-bold uppercase mb-2 tracking-tight leading-none font-sans">
                  PERIYAR <br className="block md:hidden" /> UNIVERSITY
                </h2>
                
                {/* Subtext info */}
                <div className="space-y-1 mt-2">
                  <p className="text-black text-[13px] md:text-[15px] font-semibold m-0 leading-normal">
                    State University - NAAC &apos;A++&apos; Grade - NIRF <br className="block md:hidden" /> Rank 94
                  </p>
                  <p className="text-black text-[13px] md:text-[15px] font-semibold m-0 leading-normal">
                    State Public University Rank 40 - SDG <br className="block md:hidden" /> Institutions Rank Band: 11-50
                  </p>
                  <p className="text-black text-[13px] md:text-[15px] font-semibold m-0 leading-normal font-sans">
                    Salem - 636 011, Tamil Nadu, India.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Payment Portal */}
          <div className="w-full md:w-1/6 px-[15px] mt-4 md:mt-0 flex justify-center md:items-end pt-2 md:pt-10">
            <a href="https://www.periyaruniversity.ac.in/onlinepayment/" className="block hover:scale-105 transition-transform">
              <img src="/dept/PAYMENT.jpg" alt="PAYMENT" width="150" height="75" className="h-auto" />
            </a>
          </div>

          {/* Portrait */}
          <div className="w-full md:w-1/6 px-[15px] mt-4 md:mt-0 text-center md:text-right">
            <img src="/dept/periyar.jpg" height="200" width="180" className="inline-block h-auto rounded shadow-sm border border-gray-100" alt="Thanthai Periyar" />
          </div>

        </div>
      </div>
    </div>
  );
}
