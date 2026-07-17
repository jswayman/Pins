/**
 * Formats a raw string into (NXX) NXX-XXXX as the user types.
 * Strips non-digits, caps at 10 digits, returns partial format for shorter inputs.
 */
export function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
