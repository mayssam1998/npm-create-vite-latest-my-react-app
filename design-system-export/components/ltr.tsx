import * as React from "react";
import { cn } from "@/lib/utils";

/** Numeric / identifier text that must stay LTR inside RTL copy.
 *  `mono` controls the Analyst theme's mono metadata layer (see css/extras.css):
 *  LTR-forcing and "this is machine data" are different things, and prose that
 *  needs the former — a person's name in RTL copy — does not want the latter.
 *  No effect in the default theme.
 *
 *  Copied verbatim from src/components/cases/atoms.tsx of the source app. */
export function Ltr({
  children,
  className,
  mono = true,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  // A logical margin or padding (ms-/me-/ps-/pe-) on a dir="ltr" element
  // resolves against that element's own direction, so under RTL it lands on
  // the wrong side. Those classes go on an outer span that follows the page.
  const parts = (className ?? "").split(/\s+/).filter(Boolean);
  const logical = parts.filter((c) => /^-?(ms|me|ps|pe)-/.test(c.slice(c.lastIndexOf(":") + 1)));
  const inner = (
    <span
      dir="ltr"
      data-ltr={mono ? "" : undefined}
      className={cn(
        "inline-block",
        logical.length ? parts.filter((c) => !logical.includes(c)) : className,
      )}
    >
      {children}
    </span>
  );
  if (!logical.length) return inner;
  return <span className={cn("inline-block", logical)}>{inner}</span>;
}
