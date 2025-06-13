import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
  DocumentData,
  updateDoc,
  doc,
} from 'firebase/firestore';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  type: string;
  itemId: string;
  description: string;
changes: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reverted?: Record<string, unknown>;
} | null;
  revertible: boolean;
  createdAt: Date;
}

// Convert Firestore data to HistoryEntry type
const convertToHistoryEntry = (doc: DocumentData): HistoryEntry => {
  const data = doc.data();
  return {
    id: doc.id,
    timestamp: data.timestamp,
    user: data.user,
    action: data.action,
    type: data.type,
    itemId: data.itemId,
    description: data.description,
    changes: data.changes,
    revertible: data.revertible,
    createdAt: data.createdAt?.toDate(),
  };
};

// Get all history entries for a user
export async function getHistoryEntries(userId: string): Promise<HistoryEntry[]> {
  try {
    const historyRef = collection(db, 'users', userId, 'history');
    const q = query(
      historyRef,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToHistoryEntry);
  } catch (error) {
    console.error('Error getting history entries:', error);
    throw error;
  }
}

// Add a new history entry
export async function addHistoryEntry(
  userId: string,
  entry: Omit<HistoryEntry, 'id' | 'createdAt'>
): Promise<HistoryEntry> {
  try {
    const historyRef = collection(db, 'users', userId, 'history');
    const docRef = await addDoc(historyRef, {
      ...entry,
      createdAt: serverTimestamp(),
    });
    
    const newEntry = await getHistoryEntry(userId, docRef.id);
    if (!newEntry) throw new Error('Failed to create history entry: Document not found after creation');
    
    return newEntry;
  } catch (error) {
    console.error('Error creating history entry:', error);
    throw error;
  }
}

// Get a single history entry
export async function getHistoryEntry(userId: string, entryId: string): Promise<HistoryEntry | null> {
  try {
    // const docRef = doc(db, 'users', userId, 'history', entryId);
    const docSnap = await getDocs(query(collection(db, 'users', userId, 'history'), where('__name__', '==', entryId)));
    
    if (docSnap.empty) {
      return null;
    }
    
    return convertToHistoryEntry(docSnap.docs[0]);
  } catch (error) {
    console.error('Error getting history entry:', error);
    throw error;
  }
}

// Update a history entry (e.g., after reverting a change)
export async function updateHistoryEntry(
  userId: string,
  entryId: string,
  updates: Partial<HistoryEntry>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'history', entryId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating history entry:', error);
    throw error;
  }
} 