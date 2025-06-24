import Navbar from '@/app/components/Navbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      {children}
    </div>
  );
}
