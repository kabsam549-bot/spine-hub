import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OAR Dose Budget | SpineRT",
  description:
    "Interactive dose budget calculator for spine radiation OARs. Enter prior doses per organ, account for tissue recovery, and see remaining tolerance for re-irradiation planning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
