import "server-only";
import type { PaymentMethod } from "@/lib/supabase/types";

export type PaymentAccount = {
  method: PaymentMethod;
  label: string;
  accountNumber: string;
  accountTitle: string;
  instructions: string;
};

// Pulled from env so credentials/account numbers never live in the codebase.
export function getPaymentAccounts(): PaymentAccount[] {
  return [
    {
      method: "jazzcash",
      label: "JazzCash",
      accountNumber: process.env.JAZZCASH_ACCOUNT_NUMBER || "",
      accountTitle: process.env.JAZZCASH_ACCOUNT_NAME || "Laibcove",
      instructions:
        "Open the JazzCash app → Send Money → enter the number above → send the order total. Then paste your transaction ID below.",
    },
    {
      method: "easypaisa",
      label: "EasyPaisa",
      accountNumber: process.env.EASYPAISA_ACCOUNT_NUMBER || "",
      accountTitle: process.env.EASYPAISA_ACCOUNT_NAME || "Laibcove",
      instructions:
        "Open the EasyPaisa app → Send Money → enter the number above → send the order total. Then paste your transaction ID below.",
    },
  ];
}

export function getAccountFor(method: PaymentMethod): PaymentAccount | null {
  return getPaymentAccounts().find((a) => a.method === method) ?? null;
}
