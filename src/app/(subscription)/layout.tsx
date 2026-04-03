export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-light">
      <header className="bg-white border-b border-border px-4 py-3 text-center">
        <span className="text-xl font-display font-bold text-terracotta">GrowTo</span>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
