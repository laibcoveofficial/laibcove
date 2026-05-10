// Generates a short, readable, URL-safe order number like "LCV-A8K2D9".
// Crockford-base32 alphabet (no I/L/O/U) so customers can't misread it.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateOrderNumber(): string {
  let s = "";
  // 6 chars of randomness ≈ 32^6 = ~1B combinations
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    s += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `LCV-${s}`;
}
