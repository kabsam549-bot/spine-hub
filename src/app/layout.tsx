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
    "Clinical calculators for spine radiation therapy: PRISM prognostic index, myelopathy risk assessment (Nieder), and spinal cord dose budget.",
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
      "Validated calculators for spine radiation: PRISM prognosis, myelopathy risk, and OAR dose budget with tissue recovery modeling.",
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
        <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8 sm:px-10">
          {children}
        </main>
        <footer className="border-t border-gray-100 bg-gray-50 px-6 py-8 text-xs text-gray-400 sm:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
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
