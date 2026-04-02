export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-terracotta">GrowTo</h1>
          <p className="text-sm text-muted-foreground mt-1">Practice. Grow. Show up ready.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
