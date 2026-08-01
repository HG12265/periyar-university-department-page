import React from 'react';

const GuestFacultyCard = ({ faculty }) => {
  const { name, designation, email, specialization, image_url } = faculty;

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

  return (
    <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6 hover:shadow-md transition-shadow duration-300 font-sans">
      {/* Guest Faculty Image */}
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

      {/* Guest Faculty Details */}
      <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="grid grid-cols-[160px_20px_1fr] items-start border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Name</span>
            <span className="text-gray-400">:</span>
            <span className="text-[#333] font-bold text-[15px]">{name}</span>
          </div>

          <div className="grid grid-cols-[160px_20px_1fr] items-start border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">PG Specialization</span>
            <span className="text-gray-400">:</span>
            <span className="text-gray-600 font-medium text-[14px]">{designation || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-[160px_20px_1fr] items-start border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Area of Interest</span>
            <span className="text-gray-400">:</span>
            <span className="text-gray-600 text-[14px] leading-relaxed">{specialization || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-[160px_20px_1fr] items-start border-b border-gray-50 pb-2">
            <span className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">Email</span>
            <span className="text-gray-400">:</span>
            <a href={`mailto:${email}`} className="text-[#990033] hover:underline font-medium text-[14px] break-all">
              {email || 'N/A'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestFacultyCard;
