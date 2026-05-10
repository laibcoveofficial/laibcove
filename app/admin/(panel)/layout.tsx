import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminUIProvider } from "@/lib/admin/ui-context";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already protects this, but defense-in-depth.
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminUIProvider>
      <div className="flex min-h-screen bg-[var(--surface-soft)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AdminUIProvider>
  );
}
