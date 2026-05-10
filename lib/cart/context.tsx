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
import type { CartItem, CartTotals } from "./types";
import {
  DEFAULT_DELIVERY_PKR,
  DEFAULT_FREE_DELIVERY_THRESHOLD_PKR,
} from "@/lib/orders/delivery";

const STORAGE_KEY = "laibcove_cart_v1";

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
    return parsed.filter(
      (x): x is CartItem =>
        x &&
        typeof x === "object" &&
        typeof x.productId === "string" &&
        typeof x.name === "string" &&
        typeof x.unitPrice === "number" &&
        typeof x.quantity === "number" &&
        x.quantity > 0,
    );
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const firstHydrate = useRef(true);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist on change (skip the very first effect run since we're loading)
  useEffect(() => {
    if (!hydrated) return;
    if (firstHydrate.current) {
      firstHydrate.current = false;
      return;
    }
    saveToStorage(items);
  }, [items, hydrated]);

  // Sync across tabs
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

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((p) => p.productId === item.productId);
        const max = item.maxStock > 0 ? item.maxStock : Infinity;
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, max, 99);
          return prev.map((p) =>
            p.productId === item.productId
              ? { ...p, quantity: nextQty, maxStock: item.maxStock }
              : p,
          );
        }
        const startQty = Math.min(Math.max(quantity, 1), max, 99);
        return [...prev, { ...item, quantity: startQty }];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((prev) => {
        const next = Math.max(0, Math.min(99, Math.floor(quantity)));
        if (next <= 0) return prev.filter((p) => p.productId !== productId);
        return prev.map((p) =>
          p.productId === productId
            ? {
                ...p,
                quantity:
                  p.maxStock > 0 ? Math.min(next, p.maxStock) : next,
              }
            : p,
        );
      });
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const totals: CartTotals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const delivery = calcDeliveryClient(subtotal);
    const discount = 0; // applied at checkout once coupon is validated
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
