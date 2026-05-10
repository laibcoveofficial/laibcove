"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

const AUTO_DISMISS_MS = 2400;

export function SaveSuccessModal({
  variant,
  productName,
}: {
  variant: "created" | "updated";
  productName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dismissedRef = useRef(false);

  // Open after mount so the entry animation plays
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Strip the query param from the URL so refreshing doesn't re-show the modal,
  // and auto-dismiss after a short delay.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setOpen(false);
    // Replace URL to drop ?saved=…&name=… so refresh doesn't re-trigger.
    router.replace(pathname, { scroll: false });
  };

  const title =
    variant === "created" ? "Product created!" : "Product updated!";
  const detail =
    variant === "created"
      ? "Your new product is now in the catalog."
      : "Your changes are live.";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={dismiss}
        className={`fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Centered card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-success-title"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-background shadow-2xl transition-all duration-300 ${
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-[var(--surface-soft)] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative bg-gradient-to-b from-[var(--brand-soft)] via-white to-white px-8 pb-7 pt-10 text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span
                aria-hidden
                className={`absolute inset-0 rounded-full bg-[var(--brand)]/15 transition-transform duration-500 ${
                  open ? "scale-100" : "scale-0"
                }`}
              />
              <span
                aria-hidden
                className={`absolute inset-2 rounded-full bg-[var(--brand)]/25 transition-transform duration-500 delay-75 ${
                  open ? "scale-100" : "scale-0"
                }`}
              />
              <span
                className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/40 transition-all duration-500 delay-100 ${
                  open ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
              >
                <CheckCircle2 strokeWidth={2.5} className="h-7 w-7" />
              </span>
            </div>

            <h2
              id="save-success-title"
              className="font-heading mt-5 text-2xl text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>

            {productName ? (
              <p className="mt-4 truncate rounded-full border border-[var(--brand)]/20 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground">
                {productName}
              </p>
            ) : null}

            <button
              type="button"
              onClick={dismiss}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
            >
              Back to products
            </button>

            {/* Progress bar showing auto-dismiss countdown */}
            <span
              aria-hidden
              className={`absolute bottom-0 left-0 h-1 bg-[var(--brand)] ${
                open ? "" : "w-0"
              }`}
              style={
                open
                  ? {
                      animation: `save-success-progress ${AUTO_DISMISS_MS}ms linear forwards`,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes save-success-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </>
  );
}
