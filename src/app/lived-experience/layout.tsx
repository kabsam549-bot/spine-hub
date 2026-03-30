import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lived Experience | SpineRT",
  description:
    "MD Anderson CNS Division spine SBRT published data, dose constraints, and institutional experience.",
};

export default function LivedExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
