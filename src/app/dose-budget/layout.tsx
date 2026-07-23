import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cord Reirradiation Dose Budget | SpineRT",
  description:
    "Interactive spinal cord and thecal sac reirradiation calculator using cumulative EQD2, HyTEC new-course limits, and MD Anderson planning context without recovery credit.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
