import crypto from "node:crypto";

/**
 * Verify a Clerk webhook signature without pulling in the Svix SDK.
 * Clerk sends Svix-compatible headers and a `whsec_` base64 secret.
 */
export function verifyClerkWebhook({
  body,
  id,
  timestamp,
  signature,
  secret,
}: {
  body: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  secret: string;
}) {
  if (!id || !timestamp || !signature) {
    return { ok: false as const, reason: "missing_headers" };
  }

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) {
    return { ok: false as const, reason: "invalid_timestamp" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNumber) > 60 * 5) {
    return { ok: false as const, reason: "stale_timestamp" };
  }

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${body}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const candidates = signature
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [version, value] = part.split(",");
      return version === "v1" ? value : null;
    })
    .filter((value): value is string => Boolean(value));

  const expectedBuffer = Buffer.from(expected);
  const valid = candidates.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate);
    if (candidateBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
  });

  return valid
    ? { ok: true as const, reason: null }
    : { ok: false as const, reason: "bad_signature" };
}
