import { BottomNav } from "./BottomNav";

interface AppShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-light flex flex-col">
      {/* Top header */}
      <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="text-xl font-display font-bold text-terracotta">GrowTo</span>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-sm font-semibold text-terracotta">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <BottomNav />
    </div>
  );
}
