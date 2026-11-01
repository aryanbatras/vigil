import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

import { AuthFrame } from "@/components/auth/auth-frame";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Vigil MFA console with an email code.",
};

export default function SignInPage() {
  return (
    <AuthFrame mode="in">
      <Suspense fallback={<AuthFormFallback />}>
        <SignIn
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
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
