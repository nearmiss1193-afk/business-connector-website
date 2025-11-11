import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TopNavigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [showMortgageDropdown, setShowMortgageDropdown] = useState(false);

  const navItems = [
    { label: "Buy", href: "/properties", active: location === "/properties" },
    { label: "Rent", href: "#", active: false },
    { label: "Sell", href: "#", active: false },
    { label: "Get a mortgage", href: "#mortgage", active: false, hasDropdown: true },
    { label: "Find an agent", href: "#", active: false },
    { label: "Manage rentals", href: "#", active: false },
    { label: "Advertise", href: "/advertise", active: location === "/advertise" },
    { label: "Get help", href: "#", active: false },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <img src={APP_LOGO} alt="Logo" className="h-8 w-auto" />
            </a>
          </Link>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setShowMortgageDropdown(true)}
                  onMouseLeave={() => setShowMortgageDropdown(false)}
                >
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-1 ${
                      item.active
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMortgageDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Your mortgage</h3>
                            <Link href="#">
                              <a className="block text-sm text-blue-600 hover:underline mb-2">Discover Zillow Home Loans</a>
                            </Link>
                            <Link href="#">
                              <a className="block text-sm text-blue-600 hover:underline mb-2">Calculate your BuyAbility</a>
                            </Link>
                            <Link href="#">
                              <a className="block text-sm text-blue-600 hover:underline">Get pre-qualified</a>
                            </Link>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Mortgage tools</h3>
                            <Link href="#">
                              <a className="block text-sm text-blue-600 hover:underline mb-2">Estimate your mortgage payment</a>
                            </Link>
                            <Link href="#">
                              <a className="block text-sm text-blue-600 hover:underline mb-2">See current mortgage rates</a>
                            </Link>
                            <Link href="#">
                              <a className="block text-sm text-blue-600 hover:underline">Learn about financing a home</a>
                            </Link>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-600">Started a loan application?</p>
                          <Link href="#">
                            <a className="text-sm text-blue-600 hover:underline">Home Loans dashboard</a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.label} href={item.href}>
                  <a
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                      item.active
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              )
            ))}
          </div>

          {/* Sign In Button */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user?.name || user?.email}
                </span>
                {user?.role === "admin" && (
                  <Link href="/admin/properties">
                    <a className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                      Admin
                    </a>
                  </Link>
                )}
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Sign in
              </a>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-3 flex flex-wrap gap-2">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.label} href={item.href}>
              <a
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  item.active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
