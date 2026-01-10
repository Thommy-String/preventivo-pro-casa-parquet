import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, } from 'react-router-dom';
import { doc, getDoc, setDoc } from "firebase/firestore"; // <--- NUOVI IMPORT FIREBASE
import { db } from "../firebase"; // <--- IL TUO FILE DI COLLEGAMENTO
import {
  LinkIcon, Save, Trash2, Plus, Copy, ArrowUp, ArrowDown, X, Image as ImageIcon, Calculator
} from 'lucide-react';

import { DEFAULT_TEAM } from '../config/defaultTeam';

import TimelineEditor from '../components/TimelineEditor';
import PaymentPlan from '../components/PaymentPlan';
import TeamEditor from '../components/TeamEditor';

// --- Componenti UI Helpers ---
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
    {children}
  </label>
);

const StyledInput = (props) => (
  <input
    {...props}
    className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-gray-400"
  />
);

const StyledTextArea = (props) => (
  <textarea
    {...props}
    className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm placeholder:text-gray-400 min-h-[80px]"
  />
);

const IconButton = ({ onClick, icon: Icon, color = "text-gray-400 hover:text-gray-600", title }) => (
  <button onClick={onClick} className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${color}`} title={title}>
    <Icon size={18} />
  </button>
);

// Funzione per generare ID univoci davvero (Timestamp + Numero Casuale)
const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function EditQuotePage() { // Non servono più props qui
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Stato iniziale vuoto (lo riempiremo da Firebase)
  const [editingQuote, setEditingQuote] = useState({
    projectName: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    sections: [],
    teamMembers: DEFAULT_TEAM,
  });

  // --- 1. CARICAMENTO DATI DA FIREBASE ---
  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId || quoteId === 'new') {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "preventivi", quoteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEditingQuote(docSnap.data());
        } else {
          console.log("Nessun preventivo trovato, ne creiamo uno nuovo.");
        }
      } catch (error) {
        console.error("Errore caricamento:", error);
        alert("Errore di connessione al database.");
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId]);


  // --- Logica Calcoli Live ---
  const liveSummary = useMemo(() => {
    if (!editingQuote) return { subtotal: 0, total: 0 };
    let subtotal = 0;
    editingQuote.sections.forEach(section => {
      section.items.forEach(item => {
        subtotal += (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
      });
    });
    // Il totale ora coincide con l'imponibile
    return { subtotal, total: subtotal };
  }, [editingQuote]);

  // --- Handlers (Uguali a prima) ---
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setEditingQuote(prev => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index, e) => {
    const { name, value } = e.target;
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      newSections[index] = { ...newSections[index], [name]: value };
      return { ...prev, sections: newSections };
    });
  };

  const addSection = () => {
    const newSection = {
      id: generateUniqueId('sect'), // Usa il nuovo generatore
      title: 'Nuova Sezione',
      description: '',
      photos: [],
      items: [],
    };
    setEditingQuote(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const duplicateSection = (index) => {
    const sectionToCopy = editingQuote.sections[index];

    // Creiamo una COPIA profonda e rigeneriamo gli ID di ogni singola voce
    const newSection = {
      ...sectionToCopy,
      id: generateUniqueId('sect'), // Nuovo ID per la sezione
      title: `${sectionToCopy.title} (Copia)`,
      items: sectionToCopy.items.map(item => ({
        ...item,
        id: generateUniqueId('item') // CRUCIALE: Nuovo ID per ogni voce duplicata
      })),
      // Rigeneriamo anche gli ID delle foto se necessario, o le lasciamo così (ma le foto non hanno ID nel nostro codice, solo url)
      photos: [...(sectionToCopy.photos || [])]
    };

    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      newSections.splice(index + 1, 0, newSection);
      return { ...prev, sections: newSections };
    });
  };

  const moveSection = (index, direction) => {
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      if (direction === 'up' && index > 0) {
        [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      return { ...prev, sections: newSections };
    });
  };

  const deleteSection = (index) => {
    if (confirm('Eliminare questa sezione?')) {
      setEditingQuote(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  const handleItemChange = (sectionIndex, itemIndex, e) => {
    const { name, value } = e.target;
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      const newItems = [...newSections[sectionIndex].items];
      newItems[itemIndex] = { ...newItems[itemIndex], [name]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  const addItem = (sectionIndex) => {
    const newItem = {
      id: generateUniqueId('item'), // Usa il nuovo generatore
      description: '',
      quantity: 1,
      unit: 'pz',
      price: 0
    };
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      // Assicuriamoci che l'array items esista
      if (!newSections[sectionIndex].items) {
        newSections[sectionIndex].items = [];
      }
      newSections[sectionIndex].items.push(newItem);
      return { ...prev, sections: newSections };
    });
  };

  const deleteItem = (sectionIndex, itemIndex) => {
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].items.splice(itemIndex, 1);
      return { ...prev, sections: newSections };
    });
  };

  const handlePhotoChange = (sectionIndex, photoIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 1. Configurazione Canvas per ridimensionamento
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Qualità superiore rispetto al team, ma comunque leggera
        const scaleSize = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 2. Esportazione compressa (JPEG qualità 0.7)
        // Questo riduce una foto da 5MB a circa 150KB
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // 3. Salvataggio nello stato
        setEditingQuote(prev => {
          const newSections = [...prev.sections];
          const newPhotos = [...(newSections[sectionIndex].photos || [])];
          newPhotos[photoIndex] = {
            type: photoIndex === 0 ? 'before' : 'after',
            url: compressedDataUrl
          };
          newSections[sectionIndex].photos = newPhotos;
          return { ...prev, sections: newSections };
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (sectionIndex, photoIndex) => {
    setEditingQuote(prev => {
      const newSections = [...prev.sections];
      const newPhotos = [...(newSections[sectionIndex].photos || [])];
      newPhotos[photoIndex] = null;
      newSections[sectionIndex].photos = newPhotos.filter(Boolean);
      return { ...prev, sections: newSections };
    });
  };



  // Aggiungi questo handler dentro EditQuotePage
  const setPaymentStrategy = (type, value = 0) => {
    const total = liveSummary.total;
    let plan = [];

    if (type === 'PERCENTAGE') {
      const deposit = (total * value) / 100;
      plan = [
        { label: "Acconto Iniziale", amount: deposit, percentage: value, dueDate: "All'accettazione del preventivo", description: "Necessario per l'approvvigionamento materiali e pianificazione cantiere.", isPaid: false },
        { label: "Saldo Finale", amount: total - deposit, percentage: 100 - value, dueDate: "A fine lavori", description: "Da versare a seguito del collaudo finale.", isPaid: false }
      ];
    } else if (type === 'FIXED') {
      plan = [
        { label: "Acconto Iniziale", amount: value, dueDate: "All'accettazione", description: "Quota fissa di prenotazione.", isPaid: false },
        { label: "Saldo Finale", amount: total - value, dueDate: "A fine lavori", isPaid: false }
      ];
    } else {
      plan = [
        { label: "Soluzione Unica", amount: total, dueDate: "A fine lavori", description: "Nessun acconto richiesto. Pagamento integrale al termine della posa. Nessun acconto necessario.", isPaid: false }
      ];
    }

    setEditingQuote(prev => ({ ...prev, paymentPlan: plan, paymentType: type, paymentValue: value }));
  };

  // --- 2. SALVATAGGIO SU FIREBASE (Versione Debug) ---
  const handleSave = async () => {
    if (!db) {
      alert("ERRORE GRAVE: Il database non è collegato.");
      return;
    }

    try {
      // Salviamo solo l'imponibile come totale
      const finalSummary = {
        subtotal: liveSummary.subtotal,
        total: liveSummary.subtotal,
        vatPercentage: 0 // Impostiamo a 0 o rimuoviamo
      };

      const quoteToSave = {
        ...editingQuote,
        summary: finalSummary,
        lastUpdated: new Date().toISOString()
      };

      const docId = (quoteId && quoteId !== 'new') ? quoteId : `prev-${Date.now()}`;
      quoteToSave.id = docId;

      await setDoc(doc(db, "preventivi", docId), quoteToSave);
      alert("✅ Preventivo salvato correttamente!");

      if (!quoteId || quoteId === 'new') navigate(`/edit/${docId}`, { replace: true });
      else navigate('/admin');

    } catch (error) {
      alert("ERRORE FIREBASE:\n" + error.message);
    }
  };


 const shareQuote = () => {
  // window.location.origin restituisce "https://preventivo-pro-casa-parquet.vercel.app"
  // quando sei sul sito principale.
  const shareUrl = `${window.location.origin}/quote/${quoteId}`;
  
  navigator.clipboard.writeText(shareUrl)
    .then(() => alert("Link copiato! Ora puoi inviarlo al cliente."));
};

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Caricamento dal Cloud...</div>;

  return (
    <div className="bg-[#F5F5F7] min-h-screen font-sans pb-32">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Tasto Condividi: appare solo se il preventivo è già stato salvato (ha un ID) */}
          {quoteId && quoteId !== 'new' && (
            <button
              onClick={shareQuote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all border border-blue-100"
            >
              <LinkIcon size={16} />
              <span className="hidden sm:inline">Copia Link Cliente</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Save size={16} /> Salva Online
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonna Sinistra */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span> Dettagli Progetto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label>Nome Progetto</Label>
                <StyledInput name="projectName" value={editingQuote.projectName} onChange={handleDetailsChange} placeholder="Es. Ristrutturazione Bagno" />
              </div>
              <div>
                <Label>Cliente</Label>
                <StyledInput name="clientName" value={editingQuote.clientName} onChange={handleDetailsChange} placeholder="Nome Cliente" />
              </div>
              <div>
                <Label>Data</Label>
                <StyledInput name="date" type="date" value={editingQuote.date} onChange={handleDetailsChange} />
              </div>
              <div className="md:col-span-2">
                <Label>Note Interne</Label>
                <StyledTextArea name="notes" value={editingQuote.notes} onChange={handleDetailsChange} placeholder="Note..." />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Sezioni ({editingQuote.sections.length})</h2>
              <button onClick={addSection} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                + Nuova Sezione
              </button>
            </div>

            {editingQuote.sections.map((section, sIndex) => (
              <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden group">
                <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                      {sIndex + 1}
                    </div>
                    <input
                      name="title"
                      value={section.title}
                      onChange={(e) => handleSectionChange(sIndex, e)}
                      className="bg-transparent font-bold text-gray-900 focus:bg-white focus:ring-2 ring-blue-500/20 rounded px-2 py-1 outline-none w-full max-w-md transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton onClick={() => moveSection(sIndex, 'up')} icon={ArrowUp} title="Sposta su" />
                    <IconButton onClick={() => moveSection(sIndex, 'down')} icon={ArrowDown} title="Sposta giù" />
                    <IconButton onClick={() => duplicateSection(sIndex)} icon={Copy} title="Duplica" />
                    <IconButton onClick={() => deleteSection(sIndex)} icon={Trash2} color="text-red-400 hover:text-red-600 hover:bg-red-50" title="Elimina" />
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <Label>Descrizione</Label>
                    <StyledTextArea name="description" value={section.description} onChange={(e) => handleSectionChange(sIndex, e)} placeholder="Descrivi i lavori..." />
                  </div>

                  <div>
                    <Label>Foto</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[0, 1].map(photoIdx => {
                        const photo = section.photos?.[photoIdx];
                        return (
                          <div key={photoIdx} className="relative group/photo border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px] bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer">
                            {photo?.url ? (
                              <>
                                <img src={photo.url} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                <button onClick={(e) => { e.stopPropagation(); removePhoto(sIndex, photoIdx); }} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors"><X size={14} /></button>
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">{photoIdx === 0 ? 'Prima' : 'Dopo'}</div>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium">{photoIdx === 0 ? 'Foto Prima' : 'Foto Dopo'}</span>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handlePhotoChange(sIndex, photoIdx, e)} />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <Label>Voci di Spesa</Label>
                      <div className="text-xs text-gray-400 font-mono">
                        Totale Sezione: {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(section.items.reduce((a, b) => a + (b.price * b.quantity), 0))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {section.items.map((item, iIndex) => (
                        <div key={item.id} className="flex gap-3 items-start">
                          <div className="flex-1"><StyledInput name="description" value={item.description} onChange={(e) => handleItemChange(sIndex, iIndex, e)} placeholder="Descrizione voce" /></div>
                          <div className="w-20"><StyledInput name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(sIndex, iIndex, e)} placeholder="Qtà" /></div>
                          <div className="w-20"><StyledInput name="unit" value={item.unit} onChange={(e) => handleItemChange(sIndex, iIndex, e)} placeholder="UdM" /></div>
                          <div className="w-28"><StyledInput name="price" type="number" value={item.price} onChange={(e) => handleItemChange(sIndex, iIndex, e)} placeholder="€" /></div>
                          <button onClick={() => deleteItem(sIndex, iIndex)} className="mt-2 text-gray-300 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addItem(sIndex)} className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"><Plus size={16} /> Aggiungi Voce</button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addSection} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"><Plus size={20} /> Aggiungi sezione</button>
          </div>

          {/* Renderizza l'editor solo se i dati sono stati caricati e le sezioni esistono */}
          {editingQuote && editingQuote.sections && (
            <TimelineEditor
              sections={editingQuote.sections}
              onSectionChange={handleSectionChange}
              setEditingQuote={setEditingQuote}
            />
          )}

          {/* ANTEPRIMA REALE (Quello che vedrà il cliente) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-8">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Anteprima per il cliente</span>
            </div>
            <div className="scale-95 origin-top -mt-10"> {/* Leggera riduzione per farlo stare bene nell'editor */}
              <PaymentPlan payments={editingQuote.paymentPlan} />
            </div>


          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 mb-8">
            <Label>Strategia Pagamenti</Label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'SINGLE', label: 'Saldo Unico' },
                { id: 'PERCENTAGE', label: 'Acconto %' },
                { id: 'FIXED', label: 'Acconto Fisso' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setPaymentStrategy(type.id, type.id === 'PERCENTAGE' ? 30 : 500)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${editingQuote.paymentType === type.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {editingQuote.paymentType === 'PERCENTAGE' && (
              <div className="mb-4">
                <Label>Percentuale Acconto (%)</Label>
                <StyledInput
                  type="number"
                  value={editingQuote.paymentValue}
                  onChange={(e) => setPaymentStrategy('PERCENTAGE', e.target.value)}
                />
              </div>
            )}

            {editingQuote.paymentType === 'FIXED' && (
              <div className="mb-4">
                <Label>Importo Acconto (€)</Label>
                <StyledInput
                  type="number"
                  value={editingQuote.paymentValue}
                  onChange={(e) => setPaymentStrategy('FIXED', e.target.value)}
                />
              </div>
            )}

            <p className="text-[10px] text-gray-400 italic">
              Il calcolo viene aggiornato automaticamente in base al totale del preventivo.
            </p>
          </div>

          <TeamEditor
            teamMembers={editingQuote.teamMembers}
            setEditingQuote={setEditingQuote}
          />
        </div>






        {/* Colonna Destra Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-black text-white rounded-2xl p-6 shadow-xl ring-1 ring-white/10">
              <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest">
                <Calculator size={14} /> Totale Lavori
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-400 font-medium italic">
                  <span>* Prezzi al netto di IVA</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-800 pt-6">
                <span className="text-sm font-bold text-gray-400">IMPONIBILE</span>
                <span className="text-3xl font-bold tracking-tight">
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(liveSummary.subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}