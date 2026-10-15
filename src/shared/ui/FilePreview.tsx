import { FileText } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface FilePreviewProps {
  file: File;
  /** Accessible name of the preview, e.g. the file name. */
  title: string;
  /** Shown for file types the browser cannot preview inline. */
  unsupportedText: string;
  className?: string;
}

/**
 * Ref callback that points an element at an object URL for `file` and revokes the URL when
 * the element unmounts or the file changes (React 19 ref cleanup) — no effect, no state.
 */
function bindObjectUrl(file: File) {
  return (element: HTMLImageElement | HTMLIFrameElement | null) => {
    if (!element) return;
    const url = URL.createObjectURL(file);
    element.src = url;
    return () => URL.revokeObjectURL(url);
  };
}

/** Inline preview of a local image or PDF; anything else shows a placeholder. */
export function FilePreview({ file, title, unsupportedText, className }: FilePreviewProps) {
  const objectUrlRef = bindObjectUrl(file);

  if (file.type.startsWith('image/')) {
    return (
      <div className={cn('flex items-start justify-center overflow-auto rounded-md bg-surface-muted', className)}>
        <img ref={objectUrlRef} alt={title} className="max-w-full object-contain" />
      </div>
    );
  }

  if (file.type === 'application/pdf') {
    return <iframe ref={objectUrlRef} title={title} className={cn('rounded-md border border-border bg-surface-muted', className)} />;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 rounded-md bg-surface-muted p-6 text-center', className)}>
      <FileText aria-hidden className="size-8 text-content-subtle" />
      <p className="text-sm text-content-muted">{unsupportedText}</p>
    </div>
  );
}
