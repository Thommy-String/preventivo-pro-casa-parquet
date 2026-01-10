import { Clock, Timer, ArrowUp, ArrowDown, LayoutGrid } from "lucide-react";

export default function TimelineEditor({ sections, setEditingQuote }) {
  
  const move = (index, direction) => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setEditingQuote(prev => ({ ...prev, sections: newSections }));
  };

  const update = (index, field, value) => {
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  if (!sections) return null;

  return (
    <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutGrid size={20}/></div>
        <h2 className="text-2xl font-bold text-[#1d1d1f]">Programma Cronologico</h2>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={section.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
            
            {/* Riordinamento */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => move(index, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowUp size={14}/></button>
              <button onClick={() => move(index, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowDown size={14}/></button>
            </div>

            <div className="flex-1 font-bold text-[#1d1d1f] text-sm truncate">{section.title}</div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase">Giorno</span>
                <input 
                  type="number" 
                  value={section.startDay || 1} 
                  onChange={(e) => update(index, 'startDay', parseInt(e.target.value))}
                  className="w-6 text-sm font-bold outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                <Clock size={14} className="text-gray-400" />
                <input 
                  type="text" 
                  value={section.startTime || "08:00"} 
                  onChange={(e) => update(index, 'startTime', e.target.value)}
                  placeholder="08:00"
                  className="w-12 text-sm font-bold outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                <Timer size={14} className="text-gray-400" />
                <input 
                  type="number" 
                  step="0.5"
                  value={section.durationHours || 1} 
                  onChange={(e) => update(index, 'durationHours', parseFloat(e.target.value))}
                  className="w-8 text-sm font-bold outline-none"
                />
                <span className="text-[10px] font-bold text-gray-400">h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}