"use client";

import { Check, ShoppingBag, Truck, CreditCard, PartyPopper } from "lucide-react";

export type CheckoutStep = "cart" | "shipping" | "payment" | "confirmation";

const STEPS: {
  key: CheckoutStep;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "cart", label: "Cart", Icon: ShoppingBag },
  { key: "shipping", label: "Shipping", Icon: Truck },
  { key: "payment", label: "Payment", Icon: CreditCard },
  { key: "confirmation", label: "Confirmation", Icon: PartyPopper },
];

export function CheckoutSteps({ active }: { active: CheckoutStep }) {
  const activeIndex = STEPS.findIndex((s) => s.key === active);
  return (
    <ol className="flex w-full items-center justify-between gap-1.5 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        const { Icon } = s;
        return (
          <li
            key={s.key}
            className="flex flex-1 flex-col items-center gap-1.5 sm:flex-row sm:gap-3"
          >
            <div className="flex w-full flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
              <div className="flex items-center sm:contents">
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-9 sm:w-9 ${
                    done
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : current
                        ? "border-[var(--brand)] bg-white text-[var(--brand)] shadow-md shadow-[var(--brand)]/20"
                        : "border-border bg-white text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col text-center sm:text-left">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${
                    current
                      ? "text-[var(--brand)]"
                      : done
                        ? "text-foreground/85"
                        : "text-muted-foreground"
                  }`}
                >
                  Step {i + 1}
                </span>
                <span
                  className={`hidden text-sm font-semibold sm:block ${
                    current || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`text-[11px] font-medium sm:hidden ${
                    current || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={`hidden h-0.5 flex-1 rounded-full transition-colors sm:block ${
                    done ? "bg-[var(--brand)]" : "bg-border"
                  }`}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
