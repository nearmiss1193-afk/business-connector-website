import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last Updated: November 11, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when using Central Florida Homes, including:
            </p>
            <ul>
              <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
              <li><strong>Property Preferences:</strong> Search criteria, saved properties, favorite listings</li>
              <li><strong>Financial Information:</strong> Mortgage calculator inputs, pre-approval inquiries</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent on pages</li>
              <li><strong>Communication Records:</strong> Messages sent through our contact forms or chat features</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Connect you with real estate professionals and mortgage lenders</li>
              <li>Send you property alerts, market updates, and promotional communications</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns and improve user experience</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li><strong>Real Estate Professionals:</strong> Licensed agents and brokers who can assist with your property search</li>
              <li><strong>Mortgage Lenders:</strong> Financial institutions for pre-approval and loan processing</li>
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (email delivery, analytics, etc.)</li>
              <li><strong>Business Partners:</strong> Companies that provide complementary services (home insurance, moving services, etc.)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            </ul>

            <h2>4. SMS/Text Message Communications</h2>
            <p>
              By providing your mobile phone number, you expressly consent to receive automated text messages from Business Conector 
              and affiliated real estate professionals regarding:
            </p>
            <ul>
              <li>Property alerts and new listings matching your criteria</li>
              <li>Appointment reminders and showing confirmations</li>
              <li>Market updates and promotional offers</li>
              <li>Service-related notifications</li>
            </ul>
            <p>
              <strong>Opt-Out:</strong> You may opt out of SMS communications at any time by texting STOP to any message you receive from us. 
              Message and data rates may apply. Message frequency varies based on your preferences and activity.
            </p>

            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies, web beacons, and similar technologies to:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Track your property views for lead capture (3-click system)</li>
              <li>Analyze site traffic and user behavior</li>
              <li>Deliver targeted advertising</li>
            </ul>
            <p>
              You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, 
              and destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2>7. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have the following rights:
            </p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a machine-readable format</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided below.
            </p>

            <h2>8. California Privacy Rights (CCPA)</h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul>
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information held by businesses</li>
              <li>Right to opt-out of sale of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children 
              under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of these 
              external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy 
              on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance 
              of the updated policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li><strong>Company:</strong> WORLDUNITIES LLC dba Business Conector</li>
              <li><strong>Address:</strong> 15840 State Road 50, Clermont, FL 34711</li>
              <li><strong>Email:</strong> danielcoffman@businessconector.com</li>
              <li><strong>Phone:</strong> (863) 320-3921</li>
            </ul>

            <h2>13. Do Not Track Signals</h2>
            <p>
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, 
              there is no industry standard for how to respond to DNT signals. We do not currently respond to DNT signals.
            </p>

            <h2>14. International Users</h2>
            <p>
              If you are accessing our services from outside the United States, please be aware that your information may be transferred to, 
              stored, and processed in the United States. By using our services, you consent to this transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
