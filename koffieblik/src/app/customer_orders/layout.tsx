import Navbar from '@/app/components/Navbar';

export const metadata = {
  title: 'Customer Orders - DieKoffieBlik',
  description: 'Manage and review customer orders at DieKoffieBlik',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function CustomerOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* <Navbar /> */}
      {children}
    </div>
  );
}
