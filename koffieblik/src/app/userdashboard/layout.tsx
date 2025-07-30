// layout.tsx - Updated
import Navbar from '@/app/components/Navbar';

export const metadata = {
  title: 'Dashboard - DieKoffieBlik',
  description: 'Dashboard overview for managing DieKoffieBlik coffee shop',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-amber-50 flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}