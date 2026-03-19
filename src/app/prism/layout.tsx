import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PRISM Calculator | SpineRT",
  description:
    "Calculate the Prognostic Index for Spinal Metastases (PRISM) score. A validated tool for stratifying survival in spine SBRT patients into four prognostic groups.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
