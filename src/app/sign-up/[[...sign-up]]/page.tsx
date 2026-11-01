import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

import { AuthFrame } from "@/components/auth/auth-frame";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a Vigil console account, verify your email, then enroll an authenticator.",
};

export default function SignUpPage() {
  return (
    <AuthFrame mode="up">
      <Suspense fallback={<AuthFormFallback />}>
        <SignUp
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard/security"
        />
      </Suspense>
    </AuthFrame>
  );
}

function AuthFormFallback() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-5 w-28 animate-pulse rounded-sm bg-secondary" />
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
    </div>
  );
}
