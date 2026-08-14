import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black px-5 py-12 text-white md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo variant="light" size="sm" showPoweredBy />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Delivery unlimited — express courier for merchants across Kerala and
            India.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Ship
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li><a href="#track" className="hover:text-white">Track</a></li>
            <li><a href="#contact" className="hover:text-white">Send</a></li>
            <li><a href="#rates" className="hover:text-white">Rates</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Services
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li><a href="#services" className="hover:text-white">Express</a></li>
            <li><a href="#services" className="hover:text-white">E-commerce</a></li>
            <li><a href="#services" className="hover:text-white">Logistics</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Account
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-white">Register</Link></li>
            <li>
              <a href="mailto:support@quickfynd.com" className="hover:text-white">
                support@quickfynd.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/35">
        © {new Date().getFullYear()} QuickFynd Express — Powered by Nilaas
      </div>
    </footer>
  );
}
