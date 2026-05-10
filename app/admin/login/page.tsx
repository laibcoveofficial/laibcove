import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login — Laibcove",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-soft)] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="Laibcove"
            width={673}
            height={245}
            priority
            className="mx-auto h-10 w-auto object-contain"
          />
          <h1 className="font-heading mt-6 text-3xl text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage leads and custom orders.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Trouble signing in? Contact the studio admin.
        </p>
      </div>
    </main>
  );
}
