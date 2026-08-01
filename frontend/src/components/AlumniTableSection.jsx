import React from 'react';

const AlumniTableSection = ({ alumniTable }) => {
  // Handle backwards compatibility for meeting events
  let events = [];
  if (alumniTable && alumniTable.meeting_images && alumniTable.meeting_images.length > 0) {
    if (typeof alumniTable.meeting_images[0] === 'string') {
      events = [{
        title: alumniTable.meeting_title || 'Past Alumni Meeting',
        images: alumniTable.meeting_images
      }];
    } else {
      events = alumniTable.meeting_images;
    }
  } else if (alumniTable && alumniTable.meeting_title) {
    events = [{ title: alumniTable.meeting_title, images: [] }];
  }

  const columns = alumniTable?.columns || [];
  const rows = alumniTable?.rows || [];

  const hasNoRows = rows.length === 0;
  const hasNoEvents = events.length === 0;

  if (hasNoRows && hasNoEvents) {
    return null;
  }

  // Check if cell is an image
  const isImage = (val, colName) => {
    if (!val) return false;
    const lowerCol = colName.toLowerCase();
    if (lowerCol.includes('photo') || lowerCol.includes('image') || lowerCol.includes('pic')) {
      return true;
    }
    return typeof val === 'string' && (
      val.startsWith('/api/uploads') || 
      val.startsWith('http://') || 
      val.startsWith('https://') ||
      /\.(jpeg|jpg|gif|png|webp)/i.test(val)
    );
  };

  return (
    <div className="space-y-8 w-full">
      {!hasNoRows && columns.length > 0 && (
        <div className="w-full overflow-hidden bg-white border border-gray-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#FFF9E6] border-b border-[#F5E6C4]">
                  {columns.map((col, idx) => (
                    <th 
                      key={idx} 
                      className="px-6 py-5 text-[14px] font-bold text-[#8A6D3B] uppercase tracking-wider border-r border-[#F3E2BD] last:border-r-0"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {rows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    className="hover:bg-[#FCFBF7] transition-colors duration-150 last:border-b-0"
                  >
                    {columns.map((col, colIdx) => {
                      const cellVal = row[col] || '';
                      const isImg = isImage(cellVal, col);
                      
                      // Format image URL
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                      const backendBaseUrl = apiUrl.replace('/api', '');
                      const fullImgUrl = cellVal && cellVal.startsWith('/api/') 
                        ? `${backendBaseUrl}${cellVal}` 
                        : cellVal;

                      return (
                        <td 
                          key={colIdx} 
                          className="px-6 py-5 text-[15px] text-[#444] font-medium border-r border-gray-100 last:border-r-0 align-middle"
                        >
                          {isImg ? (
                            cellVal ? (
                              <div className="relative w-20 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={fullImgUrl} 
                                  alt={row['Name of the Student'] || 'Alumni'}
                                  className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-200"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gray-100 hidden items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <div className="w-20 h-24 bg-gray-150 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-bold text-[10px]">
                                NO PHOTO
                              </div>
                            )
                          ) : (
                            <span className="whitespace-pre-line leading-relaxed font-sans">{cellVal}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alumni Meeting Section */}
      {events.length > 0 && (
        <div className="space-y-10">
          {events.map((evt, evtIdx) => (
            <div key={evtIdx} className="w-full overflow-hidden bg-white border border-gray-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              {/* Header Bar: Bright yellow/gold background with centered text exactly like reference image */}
              <div className="bg-[#FFB81C] px-6 py-4 border-b border-[#E5A717] text-center shadow-sm">
                <h3 className="text-[17px] font-bold text-[#3F2B04] tracking-wide m-0 font-sans">
                  {evt.title || 'Alumni Meeting'}
                </h3>
              </div>
              
              {/* Meeting Gallery Grid */}
              {evt.images && evt.images.length > 0 ? (
                <div className="p-6 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {evt.images.map((imgUrl, idx) => {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                      const backendBaseUrl = apiUrl.replace('/api', '');
                      const fullImgUrl = imgUrl && imgUrl.startsWith('/api/') 
                        ? `${backendBaseUrl}${imgUrl}` 
                        : imgUrl;

                      return (
                        <div 
                          key={idx} 
                          className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={fullImgUrl} 
                            alt={`Alumni Meeting Image ${idx + 1}`} 
                            className="w-full aspect-[4/3] object-cover rounded-lg border border-gray-100 shadow-inner"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50/20 text-gray-400 font-medium">
                  No photographs uploaded for this meeting.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniTableSection;
