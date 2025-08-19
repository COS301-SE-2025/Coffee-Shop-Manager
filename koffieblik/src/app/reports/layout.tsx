import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Dashboard - DieKoffieBlik",
  description: "Dashboard overview for managing DieKoffieBlik coffee shop",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function REPORTSLayout({
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
