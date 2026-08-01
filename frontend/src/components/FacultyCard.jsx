import React, { useState } from 'react';
import FacultyProfileModal from './FacultyProfileModal';


const FacultyCard = ({ faculty }) => {
  const { name, designation, email, specialization, image_url, profile_url } = faculty;

  // Handle image URL - if it's a relative path from the backend, prefix it
  const getImageUrl = (url) => {
    if (!url || url.trim() === '') return '/placeholder-faculty.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api/uploads')) {
      const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
      return `${backendBase}${url}`;
    }
    return url;
  };

  const fullImageUrl = getImageUrl(image_url);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6 hover:shadow-md transition-shadow duration-300">
        {/* Faculty Image */}
        <div className="w-full md:w-1/4 p-4 flex justify-center items-start">
          <div className="w-full max-w-[180px] aspect-[3/4] rounded-md border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
            <img 
              src={fullImageUrl} 
              alt={name} 
              className="w-full h-full object-cover"
              onError={(e) => { 
                if (e.target.src !== window.location.origin + '/placeholder-faculty.png') {
                  e.target.src = '/placeholder-faculty.png'; 
                }
              }}
            />
          </div>
        </div>

        {/* Faculty Details */}
        <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_20px_1fr] items-start border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Name</span>
              <span className="text-gray-400">:</span>
              <span className="text-[#333] font-bold text-[15px]">{name}</span>
            </div>

            <div className="grid grid-cols-[120px_20px_1fr] items-start border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Designation</span>
              <span className="text-gray-400">:</span>
              <span className="text-gray-600 font-medium text-[14px]">{designation || 'N/A'}</span>
            </div>

            <div className="grid grid-cols-[120px_20px_1fr] items-start border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Email</span>
              <span className="text-gray-400">:</span>
              <a href={`mailto:${email}`} className="text-[#990033] hover:underline font-medium text-[14px] break-all">
                {email || 'N/A'}
              </a>
            </div>

            <div className="grid grid-cols-[120px_20px_1fr] items-start border-b border-gray-50 pb-2">
              <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Area of Specialization</span>
              <span className="text-gray-400">:</span>
              <span className="text-gray-600 text-[14px] leading-relaxed">{specialization || 'N/A'}</span>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 mt-4 pt-3 border-t border-gray-150">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#990033] to-[#c2185b] hover:from-[#80002a] hover:to-[#ad1457] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md shadow-red-950/10 hover:shadow-lg hover:shadow-red-950/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border-none focus:outline-none"
            >
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.25} 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Resume
            </button>
            {profile_url && (
              <a 
                href={profile_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 border-2 border-[#000066] text-[#000066] hover:bg-[#000066] hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm hover:shadow-md hover:shadow-blue-950/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer no-underline"
              >
                View More
                <svg 
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.25} 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <FacultyProfileModal 
          faculty={faculty} 
          onClose={() => setIsModalOpen(false)} 
          initialTab="resume"
        />
      )}
    </>
  );
};

export default FacultyCard;

