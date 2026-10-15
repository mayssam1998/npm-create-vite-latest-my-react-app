import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  /** Already translated. */
  title: string;
  description?: string;
}

interface ToastState {
  toasts: ToastMessage[];
  show: (toast: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

const MAX_VISIBLE_TOASTS = 3;

/** The queue rendered by `shared/ui/Toaster`. A module-level store so mutation callbacks can toast outside React. */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }].slice(-MAX_VISIBLE_TOASTS),
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/**
 * Fire a toast. Call it from mutation callbacks (`onSuccess` / `onError`), never from a
 * component — see .claude/rules/overlays.md.
 */
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().show({ tone: 'success', title, description }),
  error: (title: string, description?: string) => useToastStore.getState().show({ tone: 'error', title, description }),
  info: (title: string, description?: string) => useToastStore.getState().show({ tone: 'info', title, description }),
};
