import { Link } from 'wouter';
import { APP_TITLE } from '@/const';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Real Estate */}
          <div>
            <h4 className="text-white font-semibold mb-4">Real Estate</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Homes for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?type=condo" className="hover:text-white transition-colors">
                  Condos for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?type=townhouse" className="hover:text-white transition-colors">
                  Townhomes for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?type=land" className="hover:text-white transition-colors">
                  Land for Sale
                </Link>
              </li>
              <li>
                <Link href="/zestimates" className="hover:text-white transition-colors">
                  Zestimates
                </Link>
              </li>
            </ul>
          </div>

          {/* Rentals */}
          <div>
            <h4 className="text-white font-semibold mb-4">Rentals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rentals" className="hover:text-white transition-colors">
                  Apartments for Rent
                </Link>
              </li>
              <li>
                <Link href="/rentals?type=house" className="hover:text-white transition-colors">
                  Houses for Rent
                </Link>
              </li>
              <li>
                <Link href="/rentals?type=condo" className="hover:text-white transition-colors">
                  Condos for Rent
                </Link>
              </li>
              <li>
                <Link href="/manage-rentals" className="hover:text-white transition-colors">
                  Manage Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Mortgage Rates */}
          <div>
            <h4 className="text-white font-semibold mb-4">Mortgage Rates</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mortgage/rates" className="hover:text-white transition-colors">
                  Current Rates
                </Link>
              </li>
              <li>
                <Link href="/mortgage/calculator" className="hover:text-white transition-colors">
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link href="/mortgage/prequalify" className="hover:text-white transition-colors">
                  Get Pre-qualified
                </Link>
              </li>
              <li>
                <Link href="/mortgage/refinance" className="hover:text-white transition-colors">
                  Refinance Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Browse Homes */}
          <div>
            <h4 className="text-white font-semibold mb-4">Browse Homes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties?city=Tampa" className="hover:text-white transition-colors">
                  Tampa, FL
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Orlando" className="hover:text-white transition-colors">
                  Orlando, FL
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Lakeland" className="hover:text-white transition-colors">
                  Lakeland, FL
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Clermont" className="hover:text-white transition-colors">
                  Clermont, FL
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-white transition-colors">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Notice
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p className="text-gray-400">
            © {currentYear} {APP_TITLE}. All rights reserved. A Division of WORLDUNITIES LLC (EIN: 39-4733281)
          </p>
          <p className="text-gray-500 mt-2 text-xs">
            By using this website, you consent to receive communications via phone (including autodialed/pre-recorded calls), 
            SMS, and email. Message frequency varies. Message and data rates may apply. Text STOP to opt out.
          </p>
        </div>
      </div>
    </footer>
  );
}
