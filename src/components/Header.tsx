import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="border-b border-black/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[4.5rem] md:px-8">
          <BrandLogo variant="dark" size="sm" />

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex">
            <Link href="/logistics" className="hover:text-brand">
              Book
            </Link>
            <Link href="/track" className="hover:text-brand">
              Track
            </Link>
            <a href="#services" className="hover:text-brand">
              Services
            </a>
            <a href="#solutions" className="hover:text-brand">
              Solutions
            </a>
            <a href="#support" className="hover:text-brand">
              Support
            </a>
            <a href="#contact" className="hover:text-brand">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-neutral-800 hover:text-brand sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
