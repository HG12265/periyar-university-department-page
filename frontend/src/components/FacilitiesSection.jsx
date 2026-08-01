import React from 'react';

const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="%239ca3af">No Image Available</text></svg>`;

const FacilitiesSection = ({ facilities }) => {
  // Handle image URL - if it's a relative path from the backend, prefix it
  const getImageUrl = (url) => {
    if (!url || url.trim() === '') return fallbackImage;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api/uploads')) {
      const backendBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace('/api', '');
      return `${backendBase}${url}`;
    }
    return url;
  };

  if (!facilities || facilities.length === 0) {
    return null;
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {facilities.map((f, idx) => {
          const imgUrl = getImageUrl(f.image_url);
          const hasLink = f.link_url && f.link_url.trim() !== '';

          const cardContent = (
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group h-full">
              {/* Title ABOVE the image */}
              <div className="p-5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-center min-h-[68px] text-center">
                <h4 className="m-0 text-[#990033] font-bold text-[15px] leading-snug uppercase tracking-wide group-hover:text-blue-900 transition-colors duration-300">
                  {f.title}
                </h4>
              </div>
              
              {/* Facility Image Container */}
              <div className="w-full aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center border-t border-gray-50">
                <img
                  src={imgUrl}
                  alt={f.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                  }}
                />
                
                {/* Click Overlay Indicator */}
                {hasLink && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white/95 text-[#990033] px-5 py-2.5 rounded-full text-xs font-black shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 tracking-wider uppercase">
                      🔗 Visit Link
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bottom Decorative Gold Border */}
              <div className="w-full h-1 bg-[#fbbd08] opacity-80" />
            </div>
          );

          if (hasLink) {
            return (
              <a
                key={f.id || idx}
                href={f.link_url.startsWith('http') ? f.link_url : `https://${f.link_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline block h-full cursor-pointer"
              >
                {cardContent}
              </a>
            );
          }

          return <div key={f.id || idx} className="h-full">{cardContent}</div>;
        })}
      </div>
    </div>
  );
};

export default FacilitiesSection;
