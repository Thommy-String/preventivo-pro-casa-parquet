import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { MapPin, Check, Users, User, Calendar } from 'lucide-react';

// Componenti Custom
import QuoteSections from '../components/QuoteSections';
import WorkTimeline from '../components/WorkTimeline';
import PaymentPlan from '../components/PaymentPlan';
import TeamSection from '../components/TeamSection';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

export default function QuotePage() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const docRef = doc(db, "preventivi", quoteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setQuote(docSnap.data());
      } catch (error) {
        console.error("Errore download:", error);
      } finally {
        setLoading(false);
      }
    };
    if (quoteId) fetchQuote();
  }, [quoteId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#86868b]">Caricamento...</div>;
  if (!quote) return <div className="min-h-screen flex items-center justify-center text-[#86868b]">Documento non trovato.</div>;

  const calculatedDays = quote.sections ? Math.ceil(
    quote.sections.reduce((acc, s) => acc + parseFloat(s.durationHours || 0), 0) / 8
  ) : 0;
  const displayDuration = quote.duration || (calculatedDays > 0 ? `${calculatedDays} Giorni` : "Da definire");

  return (
    <div className="min-h-screen font-sans selection:bg-[#cce9ff] pb-20 pt-6 md:pt-12">

      <main className="max-w-[960px] mx-auto bg-white min-h-[1000px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.06)] sm:rounded-[32px] overflow-hidden relative">


        {/* --- HEADER STILE LINEAR/NOTION --- */}
        <header className="px-10 py-12 md:px-24 md:pt-24 md:pb-16 bg-white">
          <div className="max-w-4xl">

            {/* 1. TITOLO PROGETTO */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-3 leading-[1.1]">
              {quote.projectName}
            </h1>

            {/* 2. META DATA */}
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-10 font-medium">
              <span>Creato il {quote.date}</span>
            </div>

            {/* 3. GRIGLIA PROPRIETÀ */}
            <div className="grid grid-cols-[140px_1fr] gap-y-5 items-center">

              {/* --- RIGA 1: CLIENTE (Nuova voce separata) --- */}
              <div className="flex items-center gap-2.5 text-gray-400">
                <User size={18} /> {/* Icona singola per il cliente */}
                <span className="text-[15px] font-medium">Cliente</span>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors cursor-default">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                    {quote.clientName ? quote.clientName.charAt(0) : 'C'}
                  </div>
                  <span className="text-[13px] font-medium text-gray-700">{quote.clientName}</span>
                </div>
              </div>

              {/* --- RIGA 2: TEAM (Solo Thomas e Andrea) --- */}
              <div className="flex items-center gap-2.5 text-gray-400">
                <Users size={18} />
                <span className="text-[15px] font-medium">Team</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Chip Thomas */}
                <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors cursor-default">
                  <img
                    src="https://ipizlwahdmkiweecetsx.supabase.co/storage/v1/object/public/demo/thommy-Giacca%20e%20cravatta.jpg"
                    alt="Thomas"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-[13px] font-medium text-gray-700">Thomas</span>
                </div>

                {/* Chip Andrea (Parquettista) */}
                <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors cursor-default">
                  <img
                    src="https://ipizlwahdmkiweecetsx.supabase.co/storage/v1/object/public/demo/Screenshot%202026-01-10%20alle%2011.38.59.png"
                    alt="Andrea"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-[13px] font-medium text-gray-700">Andrea</span>
                </div>
              </div>

              {/* RIGA 2: STATO (Dinamico) */}
      <div className="flex items-center gap-2.5 text-gray-400">
        <div className="w-[18px] flex justify-center"><div className="w-3.5 h-3.5 border-2 border-gray-300 border-dashed rounded-full" /></div>
        <span className="text-[15px] font-medium">Stato</span>
      </div>

      <div>
        {(() => {
           // Mappa i colori salvati con lo stile visivo
           const statusColors = {
             blue:   { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', border: 'border-blue-100' },
             green:  { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-100' },
             yellow: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-100' },
             gray:   { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
             purple: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500', border: 'border-purple-100' },
             red:    { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', border: 'border-red-100' },
           };
           
           // Recupera lo stile (usa blue come fallback)
           const style = statusColors[quote.statusColor] || statusColors.blue;
           
           return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${style.dot}`} />
              {quote.statusText || "In elaborazione"}
            </div>
           );
        })()}
      </div>

              {/* --- RIGA 4: DURATA (Pulita) --- */}
              <div className="flex items-center gap-2.5 text-gray-400">
                <Calendar size={18} />
                <span className="text-[15px] font-medium">Durata</span>
              </div>

              <div className="text-[15px] text-[#1d1d1f] font-medium">
                {displayDuration} di lavoro previsto
              </div>

              {/* --- RIGA 5: LUOGO --- */}
              <div className="flex items-center gap-2.5 text-gray-400">
                <MapPin size={18} />
                <span className="text-[15px] font-medium">Luogo</span>
              </div>

              <div className="text-[15px] text-[#1d1d1f] font-medium underline decoration-gray-300 decoration-1 underline-offset-2">
                {quote.address || "Milano, IT"}
              </div>

            </div>
          </div>
        </header>

        <hr className="border-[#f0f0f0] mx-10 md:mx-24 mb-16" />

        <div className="px-0 md:px-10 mb-12">
          {quote.sections && quote.sections.some(s => s.durationHours > 0) ? (
            <WorkTimeline sections={quote.sections} />
          ) : (
            <p className="px-10 md:px-24 text-[11px] text-[#86868b] italic">Cronoprogramma non disponibile.</p>
          )}
        </div>

        <QuoteSections sections={quote.sections} />

        {/* --- FOOTER: TOTALI, TEAM E AZIONI --- */}
        <footer className="border-t border-gray-100">

          <div className="px-10 md:px-24 py-20 bg-white">
            <div className="max-w-3xl mx-auto">

              {/* Riepilogo analitico delle sezioni */}
              <div className="space-y-4 mb-16">
                <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-8 text-center">
                  Lavorazioni
                </h3>
                {quote.sections.map((section) => (
                  <div key={section.id} className="flex justify-between items-baseline py-1">
                    <span className="text-[16px] text-[#424245] font-medium">{section.title}</span>
                    <div className="flex-1 border-b border-gray-100 mx-4 translate-y-[-4px]" />
                    <span className="text-[16px] text-[#1d1d1f] tabular-nums font-semibold">
                      {formatCurrency(section.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Box Totale monumentale (Solo Imponibile) */}
              <div className="text-center py-16 border-y border-gray-50 my-16 bg-[#FBFBFD] rounded-3xl">
                <p className="text-[13px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-4"> Totale Preventivo</p>
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-[#1d1d1f] tabular-nums leading-none mb-4">
                  {formatCurrency(quote.summary.subtotal)}
                </h2>
                <p className="text-[14px] text-[#86868b] font-medium italic">
                  *al netto di IVA.
                </p>
              </div>

              {/* --- PIANO PAGAMENTI --- */}
              {quote.paymentPlan && quote.paymentPlan.length > 0 && (
                <div className="mb-20">
                  <PaymentPlan payments={quote.paymentPlan} />
                </div>
              )}

              {/* --- TEAM --- */}
              {quote.teamMembers && quote.teamMembers.length > 0 && (
                <div className="mb-20">
                  <TeamSection teamMembers={quote.teamMembers} />
                </div>
              )}

              {/* 4. INFO AZIENDALI */}
              <div className="pt-12 border-t border-gray-100 flex flex-col items-center text-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-tight">
                    {quote.company?.name || "PRO CASA PARQUET - MILANO"}
                  </p>
                </div>

                <div className="text-[12px] text-[#86868b] leading-relaxed max-w-xs uppercase tracking-wider font-medium opacity-60">
                  P.IVA {quote.company?.vatId || "01914870330"} • Documento emesso il {quote.date} <br />
                  Valido per 30 giorni dalla data di emissione.
                </div>
              </div>

            </div>
          </div>
        </footer>

      </main>

      <div className="max-w-[960px] mx-auto mt-8 px-6 text-center">
        <p className="text-[12px] text-gray-400 font-medium tracking-tight">
          Documento creato con il sistema di gestione interno di Pro Casa Parquet - Milano. Sviluppato e mantenuto da Thomas.
        </p>
      </div>
    </div>
  );
}