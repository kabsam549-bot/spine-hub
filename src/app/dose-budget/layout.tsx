import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spine Reirradiation OAR Dose Workspace | Spine Hub",
  description:
    "Multi-organ prior-dose budgets, reverse physical-dose calculations, and MD Anderson spine regimen comparison without recovery credit.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
