import { Metadata } from "next";
import { isAuthenticated } from "@/lib/auth-jwt";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VAULT — Management",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function ChiragAdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
