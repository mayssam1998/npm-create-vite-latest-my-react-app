import { cva } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react';
import { Toast } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import { useToastStore, type ToastMessage, type ToastTone } from '@/shared/lib/toast';

const TOAST_DURATION_MS = 5_000;

const toastIconVariants = cva('mt-0.5 size-4 shrink-0', {
  variants: {
    tone: {
      success: 'text-success',
      error: 'text-danger',
      info: 'text-accent-blue',
    },
  },
});

const TOAST_ICON: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

/** Renders the toast queue. Mounted once at the app root; toasts are fired with `toast` from shared/lib. */
export function Toaster() {
  const { t } = useTranslation('common');
  const toasts = useToastStore((state) => state.toasts);

  return (
    // Swiping down rather than sideways, so the gesture is the same in LTR and RTL.
    <Toast.Provider swipeDirection="down" duration={TOAST_DURATION_MS} label={t('toast.label')}>
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
      <Toast.Viewport className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 outline-none sm:start-auto sm:w-96" />
    </Toast.Provider>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
}

function ToastItem({ toast }: ToastItemProps) {
  const { t } = useTranslation('common');
  const dismiss = useToastStore((state) => state.dismiss);
  const Icon = TOAST_ICON[toast.tone];

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) dismiss(toast.id);
  }

  return (
    <Toast.Root
      // Errors interrupt the screen reader; success and info wait their turn.
      type={toast.tone === 'error' ? 'foreground' : 'background'}
      onOpenChange={handleOpenChange}
      className="flex items-start gap-3 rounded-lg border border-border bg-surface-raised p-3 text-content shadow-lg"
    >
      <Icon aria-hidden className={toastIconVariants({ tone: toast.tone })} />
      <div className="min-w-0 flex-1">
        <Toast.Title className="text-sm font-medium">{toast.title}</Toast.Title>
        {toast.description && (
          <Toast.Description className="mt-0.5 text-sm text-content-muted">{toast.description}</Toast.Description>
        )}
      </div>
      <Toast.Close
        aria-label={t('toast.dismiss')}
        className="rounded p-0.5 text-content-subtle hover:bg-surface-hover hover:text-content"
      >
        <X aria-hidden className="size-4" />
      </Toast.Close>
    </Toast.Root>
  );
}
