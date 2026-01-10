import React from 'react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

export default function QuoteSections({ sections }) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="bg-gray-50 px-10 py-10 md:px-24 space-y-24 pb-20">
            {sections.map((section, index) => (
                <section key={section.id || index}>

                    {/* Intestazione Sezione */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8 items-baseline">
                        {/* Numero Sezione (Piccolo e grigio) */}
                        <div className="md:w-[60px] shrink-0">
                            <span className="text-[15px] font-bold text-[#86868b] opacity-50">0{index + 1}</span>
                        </div>

                        {/* Contenuto Sezione */}
                        <div className="w-full">
                            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-3 tracking-tight">
                                {section.title}
                            </h2>

                            {section.description && (
                                <p className="text-[17px] leading-relaxed text-[#424245] opacity-90 max-w-2xl">
                                    {section.description}
                                </p>
                            )}

                            {/* Foto (Se presenti) */}
                            {section.photos && section.photos.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
                                    {section.photos.map((photo, i) => (
                                        <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f9f9f9] border border-black/5">
                                            <img
                                                src={photo.url}
                                                alt={`Work detail ${i}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                            />
                                            {photo.type && (
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-[#1d1d1f] shadow-sm">
                                                    {photo.type === 'before' ? 'Attuale' : 'Previsto'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Lista Voci - Stile "Minimalist Gallery" */}
                            <div className="mt-8 space-y-4">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start gap-12 group">

                                        {/* Sinistra: Solo il testo */}
                                        <div className="flex-1">
                                            <p className="text-[15px] leading-relaxed text-[#424245]">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Destra: I numeri come se fossero annotazioni a margine */}
                                        <div className="flex flex-col items-end shrink-0 pt-0.5">
                                            <span className="text-[15px] font-medium text-[#1d1d1f] tabular-nums">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                            <span className="text-[11px] text-[#a1a1a6] font-medium uppercase tracking-tighter tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.quantity} {item.unit} @ {item.price}€
                                            </span>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}