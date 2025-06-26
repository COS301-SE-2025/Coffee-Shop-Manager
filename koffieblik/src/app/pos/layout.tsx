import Navbar from '@/app/components/Navbar';

export const metadata = {
  title: 'Dashboard - DieKoffieBlik',
  description: 'Dashboard overview for managing DieKoffieBlik coffee shop',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--primary-4)' }}
    >

      <Navbar />
      {children}
    </div>
  );
}
