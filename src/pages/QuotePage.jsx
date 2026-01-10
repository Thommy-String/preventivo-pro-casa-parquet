import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowRight, Download, MapPin, Clock, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F5F7] font-sans selection:bg-[#cce9ff] pb-20 pt-6 md:pt-12">

      <main className="max-w-[960px] mx-auto bg-white min-h-[1000px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.06)] sm:rounded-[32px] overflow-hidden relative">

        {/* --- HEADER STILE NOTION --- */}
        <header className="px-10 py-12 md:px-24 md:pt-20 md:pb-14 bg-white">
          <div className="max-w-[1100px]">
            <div className="flex items-center gap-2 mb-10 opacity-40">
              <FileText size={16} strokeWidth={2.5} className="text-[#1d1d1f]" />
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#1d1d1f]">
                Preventivo • {quote.date}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#1d1d1f] mb-10 leading-[0.95]">
              {quote.projectName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-5 text-[16px] md:text-[18px] text-[#86868b] tracking-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-400">Per</span>
                <span className="text-xl text-[#1d1d1f] font-bold">{quote.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} strokeWidth={2} className="text-gray-300" />
                <span className="font-medium">{quote.address || "Milano, IT"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={18} strokeWidth={2} className="text-gray-300" />
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-[#1d1d1f] font-bold">{displayDuration}</span>
                  <span className="text-gray-200">•</span>
                  <span>Inizio {quote.estimatedStart || "da definire"}</span>
                </div>
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