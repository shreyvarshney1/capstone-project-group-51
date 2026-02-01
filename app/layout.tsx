import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import { WebSocketProvider } from "@/lib/hooks/use-websocket";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivicConnect - Unified Grievance Management Platform",
  description:
    "A unified digital platform for hierarchical civil grievance management and community-driven issue resolution in India",
  keywords:
    "grievance, complaints, civic issues, India, government, transparency",
  authors: [{ name: "VIT Bhopal" }],
  openGraph: {
    title: "CivicConnect - Unified Grievance Management",
    description:
      "Empowering citizens with transparent, efficient grievance resolution",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <WebSocketProvider>
            <Navbar />
            <main className="min-h-screen w-full overflow-x-hidden relative">
              {children}
            </main>
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </WebSocketProvider>
        </Providers>
      </body>
    </html>
  );
}
