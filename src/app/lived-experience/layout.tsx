import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MD Anderson Spine Experience | SpineRT",
  description:
    "Sourced MD Anderson spine SBRT regimens, institutional reirradiation practice, outcomes, neural dose limits, and OAR planning goals.",
};

export default function LivedExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
