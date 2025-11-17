import { ReactNode } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8 rounded" />
            <span className="font-semibold">{APP_TITLE}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/properties" className="text-gray-700 hover:text-blue-600">Buy</Link>
            <Link href="/rentals" className="text-gray-700 hover:text-blue-600">Rent</Link>
            <Link href="/sell" className="text-gray-700 hover:text-blue-600">Sell</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
