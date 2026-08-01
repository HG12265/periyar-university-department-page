import React from 'react';

const PlacementTableSection = ({ placementTable }) => {
  const rows = placementTable?.rows || [];
  let items = [];

  // Determine if rows array is stored in the new sequential block format
  const isNewFormat = rows.some(row => row.type && (row.type === 'student' || row.type === 'year_header' || row.type === 'image'));

  if (isNewFormat) {
    items = rows;
  } else if (rows.length > 0) {
    // Legacy migration on-the-fly for compatibility
    const migrated = [];
    const oldYear = placementTable?.meeting_title || "Placement Details";
    migrated.push({ type: "year_header", text: oldYear });
    
    rows.forEach((row, idx) => {
      migrated.push({
        type: "student",
        sno: row["S.No"]?.replace('.', '') || String(idx + 1),
        photo: row["Photo"] || row["Image"] || row["pic"] || "",
        name: row["Name of the Student"] || row["Name"] || "",
        designation: row["Present designation"] || row["Designation"] || "",
        place: row["Place of work"] || row["Company"] || row["Place"] || "",
        programme: row["Programme Studied"] || row["Programme"] || "",
        year: row["Year Passed"] || row["Year"] || ""
      });
    });

    const events = placementTable?.meeting_images || [];
    if (events.length > 0) {
      events.forEach(evt => {
        if (evt.images && evt.images.length > 0) {
          evt.images.forEach(imgUrl => {
            migrated.push({ type: "image", image_url: imgUrl });
          });
        }
      });
    }
    items = migrated;
  }

  if (items.length === 0) {
    return null;
  }

  // Get dynamic backend URL for images
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const backendBaseUrl = apiUrl.replace('/api', '');
    return `${backendBaseUrl}${path}`;
  };

  // Group sequential students into single table blocks
  const segments = [];
  let currentTable = null;

  items.forEach(item => {
    if (item.type === 'student') {
      if (!currentTable) {
        currentTable = { type: 'table', students: [] };
        segments.push(currentTable);
      }
      currentTable.students.push(item);
    } else {
      currentTable = null;
      segments.push(item);
    }
  });

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      {segments.map((seg, idx) => {
        if (seg.type === 'year_header') {
          return (
            <div 
              key={idx} 
              className="w-full bg-[#ebf3fc] py-4 px-6 rounded-t-xl text-center border border-[#B9D5EC] border-b-0 shadow-sm mt-8 first:mt-0"
            >
              <h3 className="text-[16px] font-bold text-[#1E3A8A] uppercase tracking-wider m-0 font-sans">
                {seg.text}
              </h3>
            </div>
          );
        }

        if (seg.type === 'image') {
          return (
            <div 
              key={idx} 
              className="w-full rounded-2xl overflow-hidden shadow-md border border-gray-150 bg-gray-50 flex items-center justify-center p-1 hover:shadow-lg transition-shadow duration-300 my-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={getImageUrl(seg.image_url)} 
                alt="Placement Drive / Event" 
                className="w-full h-auto object-cover max-h-[550px] rounded-xl border border-gray-100" 
              />
            </div>
          );
        }

        if (seg.type === 'table') {
          const hasPrevHeader = idx > 0 && segments[idx - 1].type === 'year_header';
          return (
            <div 
              key={idx} 
              className={`w-full overflow-hidden bg-white border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg mb-8 ${
                hasPrevHeader ? 'border-t-0 rounded-b-xl' : 'rounded-xl'
              }`}
            >
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#FFF9E6] border-b border-[#F5E6C4]">
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] w-20 font-sans">S.No</th>
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] w-28 font-sans">Photo</th>
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] font-sans">Name of the Student</th>
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] font-sans">Present Designation</th>
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] font-sans">Place of Work</th>
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] font-sans">Programme Studied</th>
                      <th className="px-6 py-4 text-[13px] font-extrabold text-[#8A6D3B] uppercase tracking-wider font-sans">Year Passed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {seg.students.map((stud, sIdx) => (
                      <tr 
                        key={sIdx} 
                        className="hover:bg-[#FCFBF7] transition-colors duration-150 align-middle"
                      >
                        <td className="px-6 py-5 text-[14px] text-gray-700 font-bold border-r border-gray-100 font-sans">{stud.sno}</td>
                        <td className="px-6 py-4 border-r border-gray-100 font-sans">
                          <div className="relative w-20 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50 flex items-center justify-center">
                            {stud.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={getImageUrl(stud.photo)} 
                                alt={stud.name} 
                                className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gray-100 hidden items-center justify-center">
                              <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[14px] text-gray-900 font-bold border-r border-gray-100 font-sans">{stud.name}</td>
                        <td className="px-6 py-5 text-[14px] text-gray-600 border-r border-gray-100 font-sans">{stud.designation || '—'}</td>
                        <td className="px-6 py-5 text-[14px] text-[#1E3A8A] font-semibold border-r border-gray-100 font-sans">{stud.place || '—'}</td>
                        <td className="px-6 py-5 text-[14px] text-gray-600 border-r border-gray-100 font-sans">{stud.programme || '—'}</td>
                        <td className="px-6 py-5 text-[14px] text-gray-700 font-semibold font-sans">{stud.year || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default PlacementTableSection;
