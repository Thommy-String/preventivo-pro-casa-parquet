import React from 'react';
import { Users, Quote } from 'lucide-react';

export default function TeamSection({ teamMembers }) {
  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <div className="py-20 bg-white">
      {/* Header minimale */}
      <div className="px-10 md:px-24 mb-10">
        <div className="flex items-center gap-2 opacity-40 mb-1">
          <Users size={14} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#1d1d1f]">
            Seguiranno questo lavoro
          </span>
        </div>
      </div>

      {/* Grid scrollabile con card compatte */}
      <div className="px-10 md:px-24 overflow-x-auto custom-scrollbar-hide">
        <div className="flex gap-4 pb-4">
          {teamMembers.map((member, idx) => (
            <div 
              key={idx} 
              className="flex-none w-[280px] bg-[#F5F5F7] rounded-2xl p-5 border border-transparent hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Foto Molto Piccola - No Hover Zoom */}
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-200">
                  <img 
                    src={member.photoUrl || "https://via.placeholder.com/150"} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Nome/Ruolo */}
                <div className="overflow-hidden">
                  <h3 className="text-[16px] font-bold text-[#1d1d1f] truncate">
                    {member.name}
                  </h3>
                  <p className="text-[13px] font-medium text-[#86868b] truncate">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Curiosità - Stile Testo Semplice */}
              {member.quirk && (
                <div className="pt-4 border-t border-gray-200/50">
                  <div className="flex gap-2">
                    <Quote size={12} className="text-gray-300 shrink-0 mt-1" />
                    <p className="text-[12px] leading-relaxed text-[#424245] italic">
                      {member.quirk}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Padding finale per lo scroll */}
          <div className="flex-none w-10" />
        </div>
      </div>
    </div>
  );
}