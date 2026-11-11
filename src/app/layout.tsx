import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/gallery/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "VAULT — Works by Chirag S.",
  description:
    "A curated gallery of websites, digital experiences, and web applications designed and built by Chirag S.",
  metadataBase: new URL("https://vault-showbook.vercel.app"),
  openGraph: {
    title: "VAULT — Works by Chirag S.",
    description:
      "A curated gallery of websites, digital experiences, and web applications designed and built by Chirag S.",
    url: "https://vault-showbook.vercel.app",
    siteName: "VAULT",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VAULT — Works by Chirag S.",
    description:
      "A curated gallery of websites, digital experiences, and web applications designed and built by Chirag S.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark", backgroundColor: "#000000" }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("dark");`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#000000] text-white transition-colors antialiased selection:bg-[#2997ff] selection:text-black font-sans">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
