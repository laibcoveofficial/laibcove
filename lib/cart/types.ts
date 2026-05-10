export type CartItem = {
  productId: string;
  slug: string | null;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
};
