import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { create } from 'zustand';
import { auth, db } from '../firebaseConfig';

export interface Milestone {
  id: string;
  month: string;
  target: string;
  completed: boolean;
  snark?: string;
}

export interface ScheduleItem {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  time: string; // HH:mm
  task: string;
  activeDays: number[]; // 0-6 (Sun-Sat)
}

export interface InterviewData {
  questions: { question: string; answer: string }[];
  summary: string;
}

export interface VisionItem {
  id: string;
  text: string;
  imageUri: string;
  createdAt: number;
  milestones: Milestone[];
  userId?: string;
  
  // New Dynamic Fields
  interviewData?: InterviewData;
  schedule?: ScheduleItem[];
  motivations?: string[];
}

interface VisionState {
  items: VisionItem[];
  isLoading: boolean;
  isRefreshing: boolean; // For pull-to-refresh
  error: string | null;
  
  // Actions
  subscribe: () => () => void;
  refresh: () => Promise<void>; // Mock refresh
  addItem: (item: Omit<VisionItem, 'id' | 'createdAt' | 'milestones'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<VisionItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleMilestone: (itemId: string, milestoneId: string) => Promise<void>;
}

export const useVisionStore = create<VisionState>((set, get) => ({
  items: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  subscribe: () => {
    set({ isLoading: true });
    
    // In a real app, query by user. For now, we'll fetch all or just user's if logged in.
    // robust fallback: if no user, maybe we should just query everything or block?
    // Let's query everything to make the mock "Speed Run" easier to test.
    const q = query(
      collection(db, 'vision_items'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // handle serverTimestamp being null initially locally
          createdAt: doc.data().createdAt?.toMillis?.() || Date.now(), 
        })) as VisionItem[];
        
        set({ items, isLoading: false, error: null });
      },
      (error) => {
        console.error("Firestore subscription error:", error);
        set({ error: error.message, isLoading: false });
      }
    );

    return unsubscribe;
  },

  refresh: async () => {
    set({ isRefreshing: true });
    // Since we have a real-time listener, data is already fresh.
    // We just wait a bit to satisfy the user's need for control.
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ isRefreshing: false });
  },

  addItem: async (newItem) => {
    try {
      // Optimistic updatess are handled by the listener, 
      // but we could set loading state if we want to show a spinner for the "Add" action specifically.
      await addDoc(collection(db, 'vision_items'), {
        ...newItem,
        createdAt: serverTimestamp(), // Use server timestamp
        milestones: [],
        userId: auth.currentUser?.uid || 'anonymous',
      });
    } catch (e: any) {
      console.error("Add item error:", e);
      set({ error: e.message });
      throw e;
    }
  },

  updateItem: async (id, updates) => {
    try {
      const docRef = doc(db, 'vision_items', id);
      await updateDoc(docRef, updates);
    } catch (e: any) {
      console.error("Update item error:", e);
      set({ error: e.message });
    }
  },

  deleteItem: async (id) => {
    try {
      const docRef = doc(db, 'vision_items', id);
      await deleteDoc(docRef);
    } catch (e: any) {
      console.error("Delete item error:", e);
      set({ error: e.message });
    }
  },

  toggleMilestone: async (itemId, milestoneId) => {
    try {
      const item = get().items.find(i => i.id === itemId);
      if (!item) return;

      const updatedMilestones = item.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );

      const docRef = doc(db, 'vision_items', itemId);
      await updateDoc(docRef, { milestones: updatedMilestones });
    } catch (e: any) {
      console.error("Toggle milestone error:", e);
      set({ error: e.message });
    }
  }
}));
