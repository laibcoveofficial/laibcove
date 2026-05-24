"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type CartItem, type CartTotals, buildLineKey } from "./types";
import { unitPriceForQuantity } from "@/lib/supabase/types";
import {
  DEFAULT_DELIVERY_PKR,
  DEFAULT_FREE_DELIVERY_THRESHOLD_PKR,
} from "@/lib/orders/delivery";

const STORAGE_KEY = "laibcove_cart_v1";

type AddItemInput = Omit<CartItem, "quantity" | "unitPrice" | "lineKey">;

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddItemInput, quantity?: number) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clear: () => void;
  totals: CartTotals;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is Partial<CartItem> =>
          x &&
          typeof x === "object" &&
          typeof (x as { productId?: unknown }).productId === "string" &&
          typeof (x as { name?: unknown }).name === "string" &&
          typeof (x as { unitPrice?: unknown }).unitPrice === "number" &&
          typeof (x as { quantity?: unknown }).quantity === "number" &&
          (x as { quantity: number }).quantity > 0,
      )
      .map((x): CartItem => {
        const productId = x.productId as string;
        const variantName =
          typeof x.variantName === "string" && x.variantName ? x.variantName : null;
        const basePrice =
          typeof x.basePrice === "number" ? x.basePrice : (x.unitPrice as number);
        return {
          lineKey:
            typeof x.lineKey === "string"
              ? x.lineKey
              : buildLineKey(productId, variantName),
          productId,
          slug: (x.slug as string | null) ?? null,
          name: x.name as string,
          image: (x.image as string | null) ?? null,
          unitPrice: x.unitPrice as number,
          quantity: x.quantity as number,
          maxStock: typeof x.maxStock === "number" ? x.maxStock : 0,
          basePrice,
          priceTiers: Array.isArray(x.priceTiers) ? x.priceTiers : null,
          variantName,
          variantImage: (x.variantImage as string | null) ?? null,
        };
      });
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota / disabled — ignore */
  }
}

function calcDeliveryClient(subtotal: number): number {
  const flat = Number(
    process.env.NEXT_PUBLIC_DELIVERY_PKR ?? DEFAULT_DELIVERY_PKR,
  );
  const threshold = Number(
    process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD_PKR ??
      DEFAULT_FREE_DELIVERY_THRESHOLD_PKR,
  );
  if (subtotal <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return flat;
}

// Recompute the effective unit price for a line given its new quantity.
function withQuantity(item: CartItem, quantity: number): CartItem {
  const unitPrice = unitPriceForQuantity(item.basePrice, item.priceTiers, quantity);
  return { ...item, quantity, unitPrice };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const firstHydrate = useRef(true);

  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (firstHydrate.current) {
      firstHydrate.current = false;
      return;
    }
    saveToStorage(items);
  }, [items, hydrated]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setItems(loadFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((input: AddItemInput, quantity = 1) => {
    setItems((prev) => {
      const lineKey = buildLineKey(input.productId, input.variantName);
      const existing = prev.find((p) => p.lineKey === lineKey);
      const max = input.maxStock > 0 ? input.maxStock : Infinity;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, max, 99);
        return prev.map((p) =>
          p.lineKey === lineKey
            ? withQuantity({ ...p, maxStock: input.maxStock }, nextQty)
            : p,
        );
      }

      const startQty = Math.min(Math.max(quantity, 1), max, 99);
      const seed: CartItem = {
        ...input,
        lineKey,
        quantity: startQty,
        unitPrice: input.basePrice,
      };
      return [...prev, withQuantity(seed, startQty)];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((lineKey: string) => {
    setItems((prev) => prev.filter((p) => p.lineKey !== lineKey));
  }, []);

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    setItems((prev) => {
      const next = Math.max(0, Math.min(99, Math.floor(quantity)));
      if (next <= 0) return prev.filter((p) => p.lineKey !== lineKey);
      return prev.map((p) => {
        if (p.lineKey !== lineKey) return p;
        const capped = p.maxStock > 0 ? Math.min(next, p.maxStock) : next;
        return withQuantity(p, capped);
      });
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals: CartTotals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const delivery = calcDeliveryClient(subtotal);
    const discount = 0;
    return {
      itemCount,
      subtotal,
      delivery,
      discount,
      total: subtotal + delivery - discount,
    };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      totals,
    }),
    [
      items,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      totals,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return ctx;
}
