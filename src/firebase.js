import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- Importiamo il Database

// La tua configurazione specifica (quella che mi hai incollato)
const firebaseConfig = {
  apiKey: "AIzaSyA7-RSCBvod8q7q-r3sZ_YFBIKS9U1Rpnk",
  authDomain: "preventivi-pro.firebaseapp.com",
  projectId: "preventivi-pro",
  storageBucket: "preventivi-pro.firebasestorage.app",
  messagingSenderId: "126759736124",
  appId: "1:126759736124:web:37f72f03789dca72698439"
};

// 1. Inizializza l'app Firebase
const app = initializeApp(firebaseConfig);

// 2. Inizializza e ESPORTA il Database (così possiamo usarlo nelle altre pagine)
export const db = getFirestore(app);