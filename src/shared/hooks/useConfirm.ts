import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  /** Already translated. */
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` styles the confirm button as destructive. */
  tone?: 'default' | 'danger';
}

/** Resolves `true` when the user confirms, `false` when they cancel or dismiss. */
export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

/** Provided once by `shared/ui/ConfirmDialog`'s `ConfirmProvider`. */
export const ConfirmContext = createContext<ConfirmFunction | null>(null);

/**
 * Promise-returning confirmation — no per-component dialog state:
 * `if (!(await confirm({ ... }))) return;`
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider');
  return confirm;
}
