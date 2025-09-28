import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Inventory - DieKoffieBlik",
  description: "Manage the inventory system of a coffee shop",
  icons: {
    icon: "/icon.svg",
  },
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
