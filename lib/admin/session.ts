// Signed admin session token (no dependency): an HMAC-SHA256 over a base64url
// JSON payload `{exp}`, signed with ADMIN_SESSION_SECRET. This is NOT a
// spoofable `isAdmin=true` flag — without the secret the signature can't be
// forged, and crypto.subtle.verify compares in constant time. Uses the Web
// Crypto API so it runs in both the Node and Edge runtimes (needed by proxy.ts).

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// A Uint8Array is a BufferSource at runtime; the cast sidesteps the TS 5.7
// ArrayBufferLike/ArrayBuffer generic friction with the Web Crypto lib types.
const src = (u: Uint8Array): BufferSource => u as BufferSource;

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    src(enc.encode(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  ttlSeconds: number = ADMIN_SESSION_TTL_SECONDS,
): Promise<string> {
  const payload = toB64Url(enc.encode(JSON.stringify({ exp: Date.now() + ttlSeconds * 1000 })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), src(enc.encode(payload)));
  return `${payload}.${toB64Url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      src(fromB64Url(sig)),
      src(enc.encode(payload)),
    );
    if (!valid) return false;
    const { exp } = JSON.parse(dec.decode(fromB64Url(payload))) as { exp: number };
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}
