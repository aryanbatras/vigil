export const clerkAppearance = {
  variables: {
    colorPrimary: "#06525c",
    colorBackground: "#f4f7f2",
    colorText: "#06343a",
    colorTextSecondary: "#4c7074",
    colorInputBackground: "#fbfdf9",
    colorInputText: "#06343a",
    colorDanger: "#b3261e",
    colorSuccess: "#0c6b5f",
    colorWarning: "#9a6517",
    colorNeutral: "#06343a",
    borderRadius: "0.25rem",
    fontFamily:
      "var(--font-public-sans), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-public-sans), ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.9375rem",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    header: "gap-2",
    headerTitle:
      "font-display text-[2.15rem] font-extrabold leading-[0.95] tracking-[-0.045em] text-foreground",
    headerSubtitle: "text-sm leading-relaxed text-muted-foreground",
    socialButtonsBlockButton:
      "h-10 rounded-md border-border bg-transparent text-foreground hover:bg-secondary",
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-border",
    dividerText:
      "font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground",
    formFieldLabel:
      "font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground",
    formFieldInput:
      "h-10 rounded-md border-border bg-card text-foreground placeholder:text-muted-foreground/70",
    formFieldInputShowPasswordButton: "text-muted-foreground",
    formButtonPrimary:
      "h-10 rounded-md bg-primary text-sm font-medium normal-case text-primary-foreground shadow-none hover:bg-primary/88",
    formButtonReset: "text-primary",
    footerActionText: "text-sm text-muted-foreground",
    footerActionLink: "text-sm font-medium text-primary hover:text-primary/80",
    identityPreviewText: "text-sm text-foreground",
    identityPreviewEditButton: "text-primary",
    formResendCodeLink: "text-primary",
    otpCodeFieldInput:
      "h-11 rounded-md border-border bg-card text-foreground",
    formFieldErrorText: "text-xs text-destructive",
    alertText: "text-sm text-destructive",
    alternativeMethodsBlockButton:
      "rounded-md border-border bg-transparent text-foreground hover:bg-secondary",
    modalBackdrop: "bg-teal-deep/70 backdrop-blur-[2px]",
    modalContent: "rounded-md border border-border bg-card shadow-2xl",
    userButtonPopoverCard:
      "rounded-md border border-border bg-card shadow-2xl text-card-foreground",
    userButtonPopoverActionButton:
      "text-card-foreground hover:bg-secondary",
    userButtonPopoverActionButtonText: "text-sm",
    userButtonPopoverFooter: "hidden",
  },
} as const;

export const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Vigil",
      subtitle: "One email code. One authenticator code. Nothing reused.",
    },
    emailCode: {
      title: "Check your inbox",
      subtitle: "Enter the six-digit code sent to your email address.",
    },
    totpMfa: {
      title: "Open your authenticator",
      subtitle: "Enter the rotating six-digit code for Vigil.",
    },
    backupCodeMfa: {
      title: "Use a backup code",
      subtitle: "Each recovery code works once. Generate a fresh set after use.",
    },
  },
  signUp: {
    start: {
      title: "Create your console",
      subtitle: "Start with a verified inbox. Add the second factor next.",
    },
    emailCode: {
      title: "Verify your email",
      subtitle: "Enter the six-digit code we sent to your inbox.",
    },
  },
} as const;
