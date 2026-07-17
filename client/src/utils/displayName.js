/**
 * Returns the best display name for a user or entry object.
 * Priority: displayName (explicit) → firstName + lastName → username
 */
export function getDisplayName(obj) {
  if (!obj) return "";
  const dn = obj.display_name || obj.displayName;
  if (dn) return dn;
  const first = obj.first_name || obj.firstName || "";
  const last  = obj.last_name  || obj.lastName  || "";
  const full  = `${first} ${last}`.trim();
  if (full) return full;
  return obj.username || "";
}
