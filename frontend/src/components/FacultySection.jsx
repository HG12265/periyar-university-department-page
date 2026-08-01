import React, { useState } from 'react';
import FacultyCard from './FacultyCard';

const FacultySection = ({ faculties }) => {
  const [subTab, setSubTab] = useState('current'); // 'current' or 'former'

  const currentFaculty = (faculties?.filter(f => f.is_former === 0) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const formerFaculty = (faculties?.filter(f => f.is_former === 1) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return (
    <div className="w-full">
      {/* Sub-tabs for Faculty */}
      <div className="flex bg-[#fbbd08] rounded-t-lg overflow-hidden mb-6">
        <button
          onClick={() => setSubTab('current')}
          className={`px-8 py-3 text-[14px] font-bold uppercase transition-all
            ${subTab === 'current' 
              ? 'bg-white text-[#990033] shadow-[0_-4px_0_inset_#990033]' 
              : 'text-white hover:bg-white/10'
            }`}
        >
          Faculty
        </button>
        <button
          onClick={() => setSubTab('former')}
          className={`px-8 py-3 text-[14px] font-bold uppercase transition-all
            ${subTab === 'former' 
              ? 'bg-white text-[#990033] shadow-[0_-4px_0_inset_#990033]' 
              : 'text-white hover:bg-white/10'
            }`}
        >
          Former Faculty
        </button>
      </div>

      {/* Faculty List */}
      <div className="space-y-6 animate-in fade-in duration-500">
        {subTab === 'current' ? (
          currentFaculty.length > 0 ? (
            currentFaculty.map((f, idx) => <FacultyCard key={f.id || idx} faculty={f} />)
          ) : null
        ) : (
          formerFaculty.length > 0 ? (
            formerFaculty.map((f, idx) => <FacultyCard key={f.id || idx} faculty={f} />)
          ) : null
        )}
      </div>
    </div>
  );
};

export default FacultySection;
