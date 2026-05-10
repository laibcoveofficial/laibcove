// Delivery charge calculation. Server + client safe (no env on the client —
// values come through props or are mirrored via NEXT_PUBLIC_* if needed).

export const DEFAULT_DELIVERY_PKR = 250;
export const DEFAULT_FREE_DELIVERY_THRESHOLD_PKR = 5000;

export function calcDelivery(subtotal: number): number {
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
