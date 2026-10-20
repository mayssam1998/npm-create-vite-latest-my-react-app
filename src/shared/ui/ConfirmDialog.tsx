import { useCallback, useState, type ReactNode } from 'react';
import { AlertDialog } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { ConfirmContext, type ConfirmFunction, type ConfirmOptions } from '@/shared/hooks/useConfirm';
import { Button } from './Button';

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (isConfirmed: boolean) => void;
}

interface ConfirmProviderProps {
  children: ReactNode;
}

/**
 * Mounted once at the app root. Owns the single confirmation dialog behind `useConfirm()`,
 * so features never hold per-component dialog state for a yes/no question.
 */
export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  // A context value — one of the sanctioned hand-written memoisations (performance.md).
  const confirm = useCallback<ConfirmFunction>(
    (options) => new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  function settle(isConfirmed: boolean) {
    pending?.resolve(isConfirmed);
    setPending(null);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) settle(false);
  }

  function handleConfirm() {
    settle(true);
  }

  return (
    <ConfirmContext value={confirm}>
      {children}
      <AlertDialog.Root open={pending !== null} onOpenChange={handleOpenChange}>
        {pending && <ConfirmDialogContent options={pending.options} onConfirm={handleConfirm} />}
      </AlertDialog.Root>
    </ConfirmContext>
  );
}

interface ConfirmDialogContentProps {
  options: ConfirmOptions;
  onConfirm: () => void;
}

function ConfirmDialogContent({ options, onConfirm }: ConfirmDialogContentProps) {
  const { t } = useTranslation('common');
  const confirmVariant = options.tone === 'danger' ? 'danger' : 'primary';

  return (
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-50 bg-background/80" />
      <AlertDialog.Content className="fixed inset-4 z-50 m-auto h-fit max-w-md rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
        <AlertDialog.Title className="text-base font-semibold">{options.title}</AlertDialog.Title>
        {options.description && (
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {options.description}
          </AlertDialog.Description>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <AlertDialog.Cancel asChild>
            <Button>{options.cancelLabel ?? t('confirm.cancel')}</Button>
          </AlertDialog.Cancel>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {options.confirmLabel}
          </Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}
