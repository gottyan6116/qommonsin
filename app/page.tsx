import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import { getAuthConfig, verifySession, SESSION_COOKIE } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  const config = getAuthConfig();
  const jar = await cookies();
  if (!config || !(await verifySession(jar.get(SESSION_COOKIE)?.value, config)))
    redirect("/login");
  return <AppShell />;
}
