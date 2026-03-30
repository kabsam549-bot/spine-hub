"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/prism", label: "PRISM" },
  { href: "/sins", label: "SINS" },
  { href: "/noms", label: "NOMS" },
  { href: "/myelopathy", label: "Myelopathy" },
  { href: "/dose-budget", label: "Dose Budget" },
  { href: "/lived-experience", label: "Our Data" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-200/60 bg-white/90 backdrop-blur-lg sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16 sm:px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white text-xs font-bold tracking-tight group-hover:bg-blue-600 transition-colors">
            SR
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">SpineRT</span>
            <span className="text-[10px] text-gray-400 leading-tight">Spine Radiation Tools</span>
          </div>
          <span className="sm:hidden text-sm font-bold text-gray-900">SpineRT</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-[13px]">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-900"
          aria-label="Toggle menu">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-gray-100 bg-white px-6 py-2 space-y-0.5">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
