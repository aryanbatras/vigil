export const site = {
  name: "Vigil",
  tagline: "The second factor, on the record.",
  description:
    "A passwordless MFA console built with Clerk and Supabase. Email code in, authenticator out, every verified state change written to an append-only ledger.",
  author: "Indeep Kaur",
  builder: "IBM Bob",
  github: "https://github.com/aryanbatras/vigil",
  links: {
    clerk: "https://clerk.com",
    supabase: "https://supabase.com",
    pexels: "https://www.pexels.com",
    bob: "https://www.ibm.com/bob",
    priorBuild: "https://github.com/aryanbatras/MFA-system",
    privacy: "https://clerk.com/legal/privacy",
  },
} as const;

export const mediaCredits = [
  {
    file: "/media/identity-scan.jpg",
    alt: "A modern fingerprint scanner for secure access control",
    photographer: "panumas nikhomkhai",
    url: "https://www.pexels.com/photo/modern-fingerprint-access-control-system-37538043/",
  },
] as const;
