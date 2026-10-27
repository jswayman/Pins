/**
 * Formats a raw string into (NXX) NXX-XXXX as the user types.
 * Strips non-digits. An 11-digit value starting with 1 is a country code,
 * not part of the number — keep the last 10. Slicing the first 10 would
 * save (160) 237-3396 from 1-602-373-3966 and drop the real last digit.
 */
export function formatPhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("11")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  else digits = digits.slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
