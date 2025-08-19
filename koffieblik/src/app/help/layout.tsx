// layout.tsx - Updated
import Navbar from "@/app/components/Navbar";

export const metadata = {

  title: 'Help - DieKoffieBlik',
  description: 'Dashboard overview for managing DieKoffieBlik coffee shop',

  icons: {
    icon: "/favicon.ico",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen flex flex-col">
      {/* Background image layer */}
      <div className="absolute inset-0 bg-[url('/assets/close-up-view-dark-fresh-roasted-coffee-beans-coffee-beans-background.jpg')] bg-cover bg-center bg-fixed bg-no-repeat -z-10" />

      {/* Optional overlay */}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* Foreground content */}
      <Navbar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
