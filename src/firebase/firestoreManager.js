import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import app from './config';

const db = getFirestore(app);

// Salva um registro no Firestore
export const saveEntry = async (userId, entry) => {
  const ref = collection(db, 'users', userId, 'entries');
  await addDoc(ref, entry);
};

// Busca todos os registros do usuário
export const getEntries = async (userId) => {
  const ref = collection(db, 'users', userId, 'entries');
  const q = query(ref, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Migra dados do LocalStorage para o Firestore (roda só uma vez)
export const migrateFromLocalStorage = async (userId) => {
  const local = localStorage.getItem('moodTrackerEntries');
  if (!local) return;
  const entries = JSON.parse(local);
  for (const entry of entries) {
    await saveEntry(userId, entry);
  }
  localStorage.removeItem('moodTrackerEntries');
};