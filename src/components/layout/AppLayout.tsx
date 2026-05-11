import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";
import { auth } from "@/auth";

export async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar user={session?.user} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
