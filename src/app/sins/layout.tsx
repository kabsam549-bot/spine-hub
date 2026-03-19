import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SINS Calculator | SpineRT",
  description:
    "Calculate the Spinal Instability Neoplastic Score (SINS). Six-variable assessment for spinal instability in neoplastic disease to guide surgical referral.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
