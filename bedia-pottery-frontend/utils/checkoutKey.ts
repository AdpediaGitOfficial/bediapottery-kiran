/**
 * One checkout key per cart, kept for the whole checkout attempt.
 *
 * The key travels with the booking request. The server uses it to recognise a
 * repeat of the same checkout (a double click, Back from the payment page, a
 * retry after a slow response) and hands back the order it already made instead
 * of creating a second one.
 *
 * It is tied to the cart's contents: change the cart and a new key is issued, so
 * a different booking is never mistaken for a repeat. It is cleared once the
 * payment succeeds, so buying the same thing again later starts fresh.
 */
const STORAGE_KEY = "checkout_key";

interface StoredCheckoutKey {
  fingerprint: string;
  key: string;
}

function generateKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function getCheckoutKey(fingerprint: string): string {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<StoredCheckoutKey>;
      if (parsed.fingerprint === fingerprint && typeof parsed.key === "string" && parsed.key) {
        return parsed.key;
      }
    }
  } catch {
    // Storage can be unavailable (private mode); fall through to a fresh key.
  }

  const key = generateKey();

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ fingerprint, key }));
  } catch {
    // Without storage the key only lives for this submit, which still covers a double click.
  }

  return key;
}

export function clearCheckoutKey(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
