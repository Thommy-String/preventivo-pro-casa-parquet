import React, { useEffect, useRef } from 'react';
import { Truck, Hammer, DoorClosed, Calendar, Clock, ShieldCheck } from "lucide-react";

export default function WorkTimeline({ sections }) {
  const scrollContainerRef = useRef(null);

  if (!sections || !Array.isArray(sections)) return null;

  const startHour = 8; 
  const endHour = 19;
// Prima era 140, ora lo portiamo a 200 per dare più respiro ai testi
const hourWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 220;  
  const getX = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return ((h - startHour) + (m / 60)) * hourWidth;
  };

  const formatDuration = (hours) => {
    const h = parseFloat(hours);
    if (h === 0.25) return "15m";
    if (h === 0.5) return "30m";
    return Number.isInteger(h) ? `${h}h` : `${h.toString().replace(".", ",")}h`;
  };

  const pastelColors = [
    { bg: 'bg-[#F0F4FF]', border: 'border-[#D9E2FF]', text: 'text-[#55679C]' },
    { bg: 'bg-[#FDF2F8]', border: 'border-[#FBCFE8]', text: 'text-[#9D174D]' },
    { bg: 'bg-[#FDF5E6]', border: 'border-[#F9EBD0]', text: 'text-[#8B7355]' },
    { bg: 'bg-[#F5F3FF]', border: 'border-[#EDE9FE]', text: 'text-[#6D6392]' },
  ];

  const daysMap = sections.reduce((acc, section) => {
    const day = section.startDay || 1;
    if (parseFloat(section.durationHours || 0) > 0 && section.startTime) {
      if (!acc[day]) acc[day] = [];
      acc[day].push(section);
    }
    return acc;
  }, {});

  const sortedDays = Object.keys(daysMap).sort((a, b) => Number(a) - Number(b));

  // --- CALCOLO TOTALI PER IL RIEPILOGO ---
  const totalHours = sections.reduce((acc, s) => acc + parseFloat(s.durationHours || 0), 0);
  const totalSetupHours = sortedDays.length * 0.25; // 15m per ogni giorno
  const grandTotalHours = totalHours + totalSetupHours;



  return (
    <div className="py-6 md:py-12 max-w-[1200px] mx-auto overflow-visible bg-white font-sans select-none ">
      {sortedDays.map((day) => {
        const daySections = [...daysMap[day]].sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        const firstJobTime = daySections[0].startTime;
        const [h, m] = firstJobTime.split(":").map(Number);
        const startX = getX(firstJobTime);
        
        const arrivalTotalMin = (h * 60 + m) - 15;
        const arrivalTimeStr = `${Math.floor(arrivalTotalMin / 60).toString().padStart(2, '0')}:${(arrivalTotalMin % 60).toString().padStart(2, '0')}`;
        const arrivalX = getX(arrivalTotalMin / 60 === 0 ? "00:00" : arrivalTimeStr);

        const lastActivityEndPos = daySections.reduce((max, s) => {
          const endPos = getX(s.startTime) + (parseFloat(s.durationHours) * hourWidth);
          return Math.max(max, endPos);
        }, 0);

        return (
          <div key={day} className="relative mb-32 md:mb-48 ml-8 md:ml-16 pl-6 md:pl-10 border-l border-gray-100 last:mb-20">
            <div className="absolute left-[-11px] top-0 w-5 h-5 bg-white border border-gray-900 rounded-full flex items-center justify-center text-[9px] font-black z-50 shadow-sm uppercase italic">
              G{day}
            </div>

            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scroll-smooth scrollbar-hide pt-20 md:pt-24 pb-4 px-4 md:px-10"
            > 
              <div className="relative" style={{ width: (endHour - startHour) * hourWidth }}>
                
                {/* 1. AREA OPERATIVA */}
                <div className="relative h-12 md:h-14 flex items-center mb-8 md:mb-12">
                   {/* PIN ARRIVO */}
                   <div className="absolute top-[-75px] md:top-[-85px] bottom-0 border-l-2 border-emerald-500/30 z-30" style={{ left: arrivalX }}>
                     <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
                       <div className="bg-emerald-600 text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-2.5 md:py-1.5 rounded shadow-lg mb-1 whitespace-nowrap flex items-center gap-1 uppercase tracking-tighter">
                         <Truck size={10}/> Arrivo {arrivalTimeStr}
                       </div>
                       <div className="w-2 h-2 bg-emerald-600 rounded-full border-2 border-white shadow-sm" />
                     </div>
                   </div>

                   {/* PIN INIZIO */}
                   <div className="absolute top-[-40px] md:top-[-45px] bottom-0 border-l-2 border-blue-600/30 z-30" style={{ left: startX }}>
                     <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
                       <div className="bg-blue-600 text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-2.5 md:py-1.5 rounded shadow-lg mb-1 whitespace-nowrap flex items-center gap-1 uppercase tracking-tighter">
                         <Hammer size={10} /> Inizio {firstJobTime}
                       </div>
                       <div className="w-2 h-2 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                     </div>
                   </div>

                   {/* PIN FINE */}
                   <div className="absolute top-[-75px] md:top-[-85px] bottom-0 border-l-2 border-rose-800/30 z-30" style={{ left: lastActivityEndPos }}>
                     <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
                       <div className="bg-rose-800 text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-2.5 md:py-1.5 rounded shadow-lg mb-1 whitespace-nowrap flex items-center gap-1 uppercase tracking-tighter">
                         <DoorClosed size={10} /> Fine
                       </div>
                       <div className="w-2 h-2 bg-rose-800 rounded-full border-2 border-white shadow-sm" />
                     </div>
                   </div>

                   {/* SETUP CHIP */}
                   <div className="absolute h-full bg-gray-50/80 border border-dashed border-gray-200 rounded-xl flex items-center justify-center z-10" 
                        style={{ left: arrivalX, width: startX - arrivalX }}>
                      <span className="text-[7px] font-black text-gray-300 uppercase italic tracking-widest hidden md:block text-center">Setup 15m</span>
                   </div>

                   {/* CHIPS LAVORAZIONI */}
                   {daySections.map((section, index) => {
                    const x = getX(section.startTime);
                    const width = parseFloat(section.durationHours) * hourWidth;
                    const color = pastelColors[index % pastelColors.length];
                    const isSmall = width <= 80;

                    return (
                      <div key={section.id} className="absolute h-full flex items-center px-[1px] z-20" style={{ left: x, width: width }}>
                        <div className={`h-full w-full ${color.bg} border ${color.border} rounded-xl flex flex-col justify-center px-2 md:px-3 shadow-sm overflow-hidden`}>
                          <span className={`font-bold ${color.text} uppercase tracking-tighter leading-[1.1] line-clamp-2 
                            ${isSmall ? 'text-[7px]' : 'text-[9px] md:text-[10px]'}`}>
                            {section.title}
                          </span>
                          <span className={`text-[7px] md:text-[8px] font-black ${color.text} opacity-30 mt-0.5 text-right`}>
                            {formatDuration(section.durationHours)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. AREA ORE */}
                <div className="relative h-10 border-t border-gray-100 mt-6">
                  {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 w-0 h-full flex flex-col items-center overflow-visible" 
                      style={{ left: i * hourWidth }}
                    >
                      <div className="w-[1px] h-3 bg-gray-300" />
                      <span className="text-[10px] font-black text-gray-400 tabular-nums mt-1.5 whitespace-nowrap">
                        {(startHour + i).toString().padStart(2, "0")}:00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      
    </div>
  );
}