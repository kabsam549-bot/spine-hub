import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Myelopathy Risk Calculator | SpineRT",
  description:
    "Estimate spinal cord myelopathy risk for reirradiation using the Nieder et al. model. Calculates cumulative BED, interval penalties, and risk stratification.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
