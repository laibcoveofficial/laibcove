"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";

export function SuccessAnimation() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
      {/* Outer ring */}
      <span
        aria-hidden
        className={`absolute inset-0 rounded-full bg-[var(--brand)]/15 transition-transform duration-700 ${
          show ? "scale-100" : "scale-0"
        }`}
      />
      <span
        aria-hidden
        className={`absolute inset-3 rounded-full bg-[var(--brand)]/20 transition-transform duration-700 delay-75 ${
          show ? "scale-100" : "scale-0"
        }`}
      />
      <span
        aria-hidden
        className={`absolute inset-6 rounded-full bg-[var(--brand)]/30 transition-transform duration-700 delay-100 ${
          show ? "scale-100" : "scale-0"
        }`}
      />
      {/* Inner check disc */}
      <span
        aria-hidden
        className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/40 transition-all duration-500 delay-150 sm:h-24 sm:w-24 ${
          show ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <Check
          strokeWidth={3.5}
          className={`h-10 w-10 transition-all duration-500 delay-300 sm:h-12 sm:w-12 ${
            show ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        />
      </span>
      {/* Sparkles */}
      <Sparkle className="-top-2 -right-2 delay-200" show={show} />
      <Sparkle className="-bottom-1 -left-3 delay-300" show={show} />
      <Sparkle className="bottom-2 -right-4 delay-400" show={show} />
    </div>
  );
}

function Sparkle({ className, show }: { className?: string; show: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute text-[var(--brand)] transition-all duration-500 ${
        show ? "scale-100 opacity-100" : "scale-0 opacity-0"
      } ${className ?? ""}`}
    >
      <Sparkles className="h-5 w-5 animate-pulse" />
    </span>
  );
}
