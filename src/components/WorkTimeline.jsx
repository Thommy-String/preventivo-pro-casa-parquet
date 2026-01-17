import React, { useRef, useState } from 'react';
import { Truck, Hammer, DoorClosed, ChevronRight, ArrowRight } from "lucide-react"; // Usiamo ChevronRight multipli

export default function WorkTimeline({ sections }) {
  // Usiamo uno stato globale per semplicità: al primo scroll ovunque, l'hint sparisce
  const [showScrollHint, setShowScrollHint] = useState(true);

  if (!sections || !Array.isArray(sections)) return null;

  const startHour = 8;
  const endHour = 19;
  const hourWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 260 : 220;

  const getX = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return ((h - startHour) + (m / 60)) * hourWidth + 20;
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

  const handleScrollInteraction = () => {
    // Nasconde l'hint appena l'utente interagisce
    if (showScrollHint) setShowScrollHint(false);
  };

  return (
    <div className="py-8 ml-2 md:py-16 max-w-[1200px] mx-auto overflow-visible bg-white font-sans select-none">
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
          <div key={day} className="relative mb-40 md:mb-56 ml-4 md:ml-16 pl-1 md:pl-10 border-l-2 border-gray-100 last:mb-24">

            <div className="absolute left-[-10px] top-0 w-6 h-6 bg-white flex items-center justify-center text-[8px] font-black z-50  uppercase italic">
              Giorno:{day}
            </div>

            {/* --- ANIMAZIONE "CHEVRON WAVE" ELEGANTE --- */}
            <div
              className={`absolute right-4 top-[50px] md:top-[75px] z-50 pointer-events-none transition-all duration-1000 ease-in-out
                ${showScrollHint ? 'opacity-100 tnslate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              {/* Pillola Glassmorphism */}
              <div className="py-2 pl-2 pr-1  flex items-center justify-center">
                {/* Reduciamo lo spazio orizzontale per renderle più compatte */}
                <div className="flex items-center -space-x-1 relative overflow-hidden">
                  {/* Definizione Animazione Custom */}
                  <style>{`
    @keyframes slide-fade {
      0% {
        opacity: 0;
        transform: translateX(-4px);
      }
      50% {
        opacity: 1;
        transform: translateX(0);
      }
      100% {
        opacity: 0;
        transform: translateX(4px);
      }
    }
                  `}</style>

                  {/* Freccia 1 (Leader) */}
                  <ChevronRight
                    size={20}
                    strokeWidth={2.5}
                    className="text-gray-900"
                    style={{
                      animation: 'slide-fade 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                      animationDelay: '0ms'
                    }}
                  />

                  {/* Freccia 2 (Eco - segue la prima) */}
                  <ChevronRight
                    size={20}
                    strokeWidth={2.5}
                    className="text-gray-400/80"
                    style={{
                      animation: 'slide-fade 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                      animationDelay: '150ms' // Ritardo per creare l'effetto scia
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Scroll Container */}
            <div
              onScroll={handleScrollInteraction}
              className="overflow-x-auto scroll-smooth scrollbar-hide pt-28 md:pt-32 pb-4 px-2 md:px-10 relative"
            >
              <div className="relative pr-20" style={{ width: (endHour - startHour) * hourWidth + 40 }}>

                {/* 1. AREA OPERATIVA */}
                <div className="relative h-16 md:h-20 flex items-center mb-10 md:mb-14">

                  {/* PIN ARRIVO */}
                  <div className="absolute top-[-95px] md:top-[-105px] bottom-0 border-l-2 border-emerald-500/30 z-30" style={{ left: arrivalX }}>
                    <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
                      <div className="bg-emerald-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg mb-1 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-tight">
                        <Truck size={14} /> Arrivo {arrivalTimeStr}
                      </div>
                      <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white shadow-sm" />
                    </div>
                  </div>

                  {/* PIN INIZIO */}
                  <div className="absolute top-[-55px] md:top-[-60px] bottom-0 border-l-2 border-blue-600/30 z-30" style={{ left: startX }}>
                    <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
                      <div className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg mb-1 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-tight">
                        <Hammer size={14} /> Inizio {firstJobTime}
                      </div>
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                    </div>
                  </div>

                  {/* PIN FINE */}
                  <div className="absolute top-[-95px] md:top-[-105px] bottom-0 border-l-2 border-rose-800/30 z-30" style={{ left: lastActivityEndPos }}>
                    <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
                      <div className="bg-rose-800 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg mb-1 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-tight">
                        <DoorClosed size={14} /> Fine
                      </div>
                      <div className="w-2.5 h-2.5 bg-rose-800 rounded-full border-2 border-white shadow-sm" />
                    </div>
                  </div>

                  {/* SETUP CHIP */}
                  <div className="absolute h-full bg-gray-50/80 border border-dashed border-gray-200 rounded-xl flex items-center justify-center z-10"
                    style={{ left: arrivalX, width: startX - arrivalX }}>
                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase italic tracking-widest hidden md:block text-center transform -rotate-90 md:rotate-0">Setup</span>
                  </div>

                  {/* CHIPS LAVORAZIONI */}
                  {daySections.map((section, index) => {
                    const x = getX(section.startTime);
                    const width = parseFloat(section.durationHours) * hourWidth;
                    const color = pastelColors[index % pastelColors.length];
                    const isSmall = width <= 100;

                    return (
                      <div key={section.id} className="absolute h-full flex items-center px-[2px] z-20" style={{ left: x, width: width }}>
                        <div className={`h-full w-full ${color.bg} border ${color.border} rounded-xl flex flex-col justify-center px-3 md:px-4 shadow-sm overflow-hidden`}>
                          <span className={`font-bold ${color.text} uppercase tracking-tight leading-tight line-clamp-2 
                            ${isSmall ? 'text-[10px]' : 'text-xs md:text-sm'}`}>
                            {section.title}
                          </span>
                          <span className={`text-[10px] md:text-xs font-bold ${color.text} opacity-50 mt-1 text-right`}>
                            {formatDuration(section.durationHours)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. AREA ORE */}
                <div className="relative h-12 border-t border-gray-200 mt-4">
                  {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 w-0 h-full flex flex-col items-center overflow-visible"
                      style={{ left: i * hourWidth + 20 }}
                    >
                      <div className="w-[1px] h-3 bg-gray-300" />
                      <span className="text-xs font-bold text-gray-400 tabular-nums mt-2 whitespace-nowrap">
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