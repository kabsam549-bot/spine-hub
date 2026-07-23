import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spine Management Algorithm | SpineRT",
  description:
    "Interactive MD Anderson spine metastasis management framework integrating prognosis, neurologic status, stability, indication for local treatment, prior radiation, histology, and epidural disease.",
};

export default function ManagementAlgorithmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
