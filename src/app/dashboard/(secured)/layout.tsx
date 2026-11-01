import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SecuredDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.totpEnabled) {
    redirect("/dashboard/security");
  }

  return children;
}
