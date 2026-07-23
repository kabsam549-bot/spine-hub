"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  { href: "/dose-budget", label: "Plan dose" },
  { href: "/management-algorithm", label: "Management pathway" },
  { href: "/lived-experience", label: "Regimens & constraints" },
];

const assessmentLinks = [
  {
    href: "/prism",
    label: "PRISM",
    description: "Prognosis after spine SBRT",
  },
  {
    href: "/sins",
    label: "SINS",
    description: "Mechanical stability",
  },
  {
    href: "/noms",
    label: "NOMS",
    description: "Treatment framework",
  },
  {
    href: "/myelopathy",
    label: "Legacy myelopathy model",
    description: "Historical Nieder reference",
  },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const assessmentActive = assessmentLinks.some((link) =>
    pathname.startsWith(link.href),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
            SR
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight text-slate-950">
              Spine Hub
            </span>
            <span className="hidden text-[10px] leading-tight text-slate-400 sm:block">
              Spine radiation decision support
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen((current) => !current)}
              aria-expanded={toolsOpen}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                assessmentActive
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              Assessment tools <span aria-hidden="true">⌄</span>
            </button>
            {toolsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {assessmentLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setToolsOpen(false)}
                    className="block rounded-lg p-3 hover:bg-slate-50"
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {link.description}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Clinical workflow
          </p>
          <div className="mt-2">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Assessment tools
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {assessmentLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
