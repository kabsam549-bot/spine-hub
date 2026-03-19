"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/prism", label: "PRISM" },
  { href: "/myelopathy", label: "Myelopathy" },
  { href: "/dose-budget", label: "Dose Budget" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
            S
          </div>
          <span className="text-lg font-semibold text-gray-900">SpineRT</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
