import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, setDoc, collection, getDocs } from "firebase/firestore"; // Import Firebase
import { db } from "../firebase"; // Il tuo file di configurazione
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Loader2, Plus, FileText, Edit, Eye } from 'lucide-react'; // Icone carine

export default function AdminDashboard() {
  // Non usiamo più props, gestiamo tutto qui per semplicità
  const [quotes, setQuotes] = useState([]);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 1. CARICAMENTO LISTA PREVENTIVI DA FIREBASE
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "preventivi"));
        const quotesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Ordina per data (opzionale, qui li mettiamo semplicemente in ordine)
        setQuotes(quotesList);
      } catch (error) {
        console.error("Errore nel caricamento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  // 2. CREAZIONE E SALVATAGGIO SU FIREBASE
  const handleCreateQuote = async (e) => {
    e.preventDefault();
    if (!clientName || !projectName) {
      alert('Per favore, compila entrambi i campi.');
      return;
    }

    setCreating(true);

    // Creiamo un ID univoco basato sul timestamp
    const newId = `prev-${Date.now()}`;
    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    const newQuote = {
      id: newId,
      clientName,
      projectName,
      date: today,
      sections: [], // Inizia vuoto
      summary: { subtotal: 0, vatPercentage: 22, vat: 0, total: 0 },
      notes: 'Preventivo generato automaticamente.',
      createdAt: new Date().toISOString() // Utile per ordinare
    };

    try {
      // SALVATAGGIO REALE SU DB
      await setDoc(doc(db, "preventivi", newId), newQuote);

      // Aggiorna la lista locale subito per vederlo apparire
      setQuotes([newQuote, ...quotes]);
      
      // Pulisci i campi
      setClientName('');
      setProjectName('');
      
    } catch (error) {
      console.error("Errore creazione:", error);
      alert("Errore nel salvataggio su database.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen font-sans pb-20">
      
      {/* Header Dashboard */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Dashboard</h1>
            <div className="text-sm text-gray-500 font-medium">
                {quotes.length} Preventivi totali
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-12">
        
        {/* SEZIONE 1: CREA NUOVO */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Plus size={18} />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Nuovo Progetto</h2>
          </div>
          
          <Card className="!p-6 !rounded-2xl shadow-sm border border-gray-200/60">
            <form onSubmit={handleCreateQuote} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              <div className="md:col-span-3">
                <label htmlFor="clientName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Nome Cliente
                </label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="!rounded-xl !border-gray-200 !bg-gray-50 focus:!bg-white !py-3"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="projectName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Nome Progetto
                </label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Es. Ristrutturazione Bagno"
                  className="!rounded-xl !border-gray-200 !bg-gray-50 focus:!bg-white !py-3"
                />
              </div>
              <div className="md:col-span-1">
                <Button type="submit" disabled={creating} className="w-full !rounded-xl !py-3 !bg-black hover:!bg-gray-800 flex justify-center">
                  {creating ? <Loader2 className="animate-spin" size={20}/> : 'Crea'}
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* SEZIONE 2: LISTA PREVENTIVI */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <FileText size={18} />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Archivio Preventivi</h2>
          </div>

          {loading ? (
             <div className="text-center py-10 text-gray-400">Caricamento archivio...</div>
          ) : quotes.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                Nessun preventivo presente. Creane uno sopra!
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {quotes.map(quote => (
                <div key={quote.id} className="group bg-white p-5 rounded-2xl border border-gray-200/60 hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Info Preventivo */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1d1d1f] group-hover:text-blue-600 transition-colors">
                        {quote.projectName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="font-medium">{quote.clientName}</span>
                        <span>•</span>
                        <span>{quote.date}</span>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link to={`/admin/quote/${quote.id}/edit`} className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Edit size={16} /> Modifica
                      </button>
                    </Link>
                    <Link to={`/quote/${quote.id}`} className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] shadow-sm transition-colors">
                        <Eye size={16} /> Vedi
                      </button>
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}