import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "./components/Nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpineRT | Spine Radiation Tools",
  description:
    "Clinical decision support for spine radiation therapy: multi-organ reirradiation dose planning, management pathways, PRISM, SINS, NOMS, and sourced MD Anderson experience.",
  keywords: [
    "spine SBRT",
    "PRISM",
    "myelopathy",
    "reirradiation",
    "spinal cord tolerance",
    "dose budget",
    "stereotactic radiosurgery",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "SpineRT | Spine Radiation Clinical Tools",
    description:
      "Spine radiation decision support with multi-organ dose planning, an MD Anderson management pathway, validated calculators, and sourced institutional experience.",
    type: "website",
    url: "https://spine-hub.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Nav />
        <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-8 sm:px-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white px-5 py-8 text-xs text-slate-500 sm:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
            <p>
              These calculators are provided for educational and clinical
              decision-support purposes only. They do not constitute medical
              advice. Treatment decisions should be made by the treating
              physician in the context of the individual patient.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
