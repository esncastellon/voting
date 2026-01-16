// app/page.tsx
import { redirect } from "next/navigation";
import getServerSession from "next-auth";
import { authConfig } from "@/auth.config";

export default async function Page() {
  const session = getServerSession(authConfig);

  redirect(session ? "/dashboard" : "/login");
}
