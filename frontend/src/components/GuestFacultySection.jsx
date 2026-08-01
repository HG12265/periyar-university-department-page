import React from 'react';
import GuestFacultyCard from './GuestFacultyCard';

const GuestFacultySection = ({ faculties }) => {
  const guestFaculty = (faculties?.filter(f => f.is_former === 2) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  if (guestFaculty.length === 0) {
    return null;
  }

  return (
    <div className="w-full font-sans">
      {/* Tab Banner */}
      <div className="flex bg-[#fbbd08] rounded-t-lg overflow-hidden mb-6">
        <div className="px-8 py-3 text-[14px] font-bold uppercase bg-white text-[#990033] shadow-[0_-4px_0_inset_#990033]">
          Guest Faculty
        </div>
      </div>

      {/* Guest Faculty List */}
      <div className="space-y-6 animate-in fade-in duration-500">
        {guestFaculty.map((f, idx) => (
          <GuestFacultyCard key={f.id || idx} faculty={f} />
        ))}
      </div>
    </div>
  );
};

export default GuestFacultySection;
