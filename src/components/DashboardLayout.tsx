import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-primary">IA SST Inspections</h1>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}