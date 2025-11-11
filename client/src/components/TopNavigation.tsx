import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";

export default function TopNavigation() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: "Buy", href: "/properties", active: location === "/properties" },
    { label: "Rent", href: "#", active: false },
    { label: "Sell", href: "#", active: false },
    { label: "Get a mortgage", href: "#mortgage", active: false },
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
