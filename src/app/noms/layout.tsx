import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NOMS Framework | SpineRT",
  description:
    "MSKCC NOMS decision framework for spine metastases. Integrates Neurologic, Oncologic, Mechanical, and Systemic assessments to guide treatment selection.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
