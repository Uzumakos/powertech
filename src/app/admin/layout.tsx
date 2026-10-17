import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "../globals.css";

const archivo = Archivo({
  // French accents are all in "latin"; "latin-ext" would double the font weight.
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin Powertech" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${archivo.variable} antialiased`}>
      <body className="min-h-dvh bg-mist">{children}</body>
    </html>
  );
}
