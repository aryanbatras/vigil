export const AUDIT_EVENT_TYPES = [
  "posture_verified",
  "mfa_state_changed",
  "session_revoked",
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export type AuditSource = "server_sync" | "clerk_webhook" | "session_action";

export type SecurityEvent = {
  id: string;
  user_id: string;
  event_type: AuditEventType | string;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  two_factor_enabled: boolean;
  session_id: string | null;
  source: AuditSource | string;
  detail: Record<string, unknown>;
  clerk_event_id: string | null;
  created_at: string;
};

export type VerifiedMfaState = {
  userId: string;
  totpEnabled: boolean;
  backupCodeEnabled: boolean;
  twoFactorEnabled: boolean;
};

export type AuditEventInput = {
  userId: string;
  eventType: AuditEventType;
  source: AuditSource;
  state: {
    totpEnabled: boolean;
    backupCodeEnabled: boolean;
    twoFactorEnabled: boolean;
  };
  sessionId?: string | null;
  detail?: Record<string, unknown>;
  clerkEventId?: string | null;
};

export const AUDIT_EVENT_META: Record<
  string,
  { label: string; description: string }
> = {
  posture_verified: {
    label: "Posture verified",
    description:
      "The server re-read the Clerk user and confirmed the current MFA state.",
  },
  mfa_state_changed: {
    label: "MFA state changed",
    description:
      "Clerk reported a change to the user's second-factor configuration.",
  },
  session_revoked: {
    label: "Session revoked",
    description:
      "The server confirmed the session is no longer active for this account.",
  },
};

export function eventTypeLabel(type: string) {
  return AUDIT_EVENT_META[type]?.label ?? type.replaceAll("_", " ");
}
