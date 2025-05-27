// src/app/dashboard/layout.tsx
export const metadata = {
  title: 'Dashboard - DieKoffieBlik',
  description: 'Dashboard overview for managing DieKoffieBlik coffee shop',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Optional shared header, sidebar, etc. */}
      {children}
    </div>
  );
}