import { Link } from 'wouter';
import { APP_TITLE } from '@/const';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{APP_TITLE}</h3>
            <p className="text-sm text-gray-400">
              Central Florida's premier real estate platform connecting buyers with their dream homes.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              A Division of WORLDUNITIES LLC
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-white transition-colors">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <a href="tel:+18633203921" className="hover:text-white transition-colors">
                  (863) 320-3921
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-white transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">
                15840 State Road 50<br />
                Clermont, FL 34711
              </li>
              <li>
                <a href="mailto:danielcoffman@businessconector.com" className="hover:text-white transition-colors">
                  danielcoffman@businessconector.com
                </a>
              </li>
              <li>
                <a href="tel:+13529368152" className="hover:text-white transition-colors">
                  +1 (352) 936-8152
                </a>
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
