import { clerkClient } from "@clerk/nextjs/server";

/**
 * The app never trusts a client claim about MFA state. Every ledger write
 * starts by re-reading the user from Clerk's Backend API.
 */
export async function readVerifiedUser(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return {
    userId: user.id,
    totpEnabled: Boolean(user.totpEnabled),
    backupCodeEnabled: Boolean(user.backupCodeEnabled),
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
  };
}

export async function readVerifiedSession(sessionId: string) {
  const client = await clerkClient();
  return client.sessions.getSession(sessionId);
}
