import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ExchangeRateProvider } from "@/context/ExchangeRateContext";

export const metadata: Metadata = {
  title: "Nexus ML | Command Center de Inventario & Mercado Libre",
  description: "Plataforma inteligente de control de inventario físico vs publicado, sobreventa y comisiones de Mercado Libre.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexus ML",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <ExchangeRateProvider>
          {children}
        </ExchangeRateProvider>
      </body>
    </html>
  );
}
