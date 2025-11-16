import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-600 mt-2">Last Updated: November 11, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Central Florida Homes (the "Website"), operated by WORLDUNITIES LLC dba Business Conector, 
              you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, 
              please do not use this Website.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials (information or software) on Central Florida Homes' Website 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and 
              under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>

            <h2>3. Property Listings</h2>
            <p>
              All property listings displayed on this Website are provided for informational purposes only. While we strive to 
              maintain accurate and up-to-date information, we make no representations or warranties regarding the accuracy, 
              completeness, or availability of any property listing. Properties may be sold, withdrawn, or changed without notice.
            </p>

            <h2>4. Lead Generation & Contact</h2>
            <p>
              By submitting your contact information through any form on this Website, you expressly consent to receive 
              communications from us, our partners, and real estate professionals via:
            </p>
            <ul>
              <li>Telephone calls (including autodialed and pre-recorded calls)</li>
              <li>Text messages (SMS/MMS)</li>
              <li>Email communications</li>
            </ul>
            <p>
              You understand that your consent is not required as a condition of purchasing any property, goods, or services. 
              You may opt out of communications at any time by following the unsubscribe instructions in our messages or by 
              contacting us directly.
            </p>

            <h2>5. SMS/Text Message Terms</h2>
            <p>
              By providing your mobile phone number, you agree to receive automated text messages from Business Conector and 
              affiliated real estate professionals. Message frequency varies. Message and data rates may apply. Text STOP to 
              opt out or HELP for assistance. Carriers are not liable for delayed or undelivered messages.
            </p>

            <h2>6. Third-Party Services</h2>
            <p>
              This Website may contain links to third-party websites or services that are not owned or controlled by Business Conector. 
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party 
              websites or services.
            </p>

            <h2>7. Disclaimer</h2>
            <p>
              The materials on Central Florida Homes' Website are provided on an 'as is' basis. Business Conector makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties 
              or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>

            <h2>8. Limitations</h2>
            <p>
              In no event shall Business Conector or its suppliers be liable for any damages (including, without limitation, damages for 
              loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on 
              Central Florida Homes' Website.
            </p>

            <h2>9. Accuracy of Materials</h2>
            <p>
              The materials appearing on Central Florida Homes' Website could include technical, typographical, or photographic errors. 
              Business Conector does not warrant that any of the materials on its Website are accurate, complete, or current.
            </p>

            <h2>10. Modifications</h2>
            <p>
              Business Conector may revise these terms of service for its Website at any time without notice. By using this Website, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Florida, United States, and you 
              irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <ul>
              <li><strong>Company:</strong> WORLDUNITIES LLC dba Business Conector</li>
              <li><strong>Address:</strong> 15840 State Road 50, Clermont, FL 34711</li>
              <li><strong>Email:</strong> danielcoffman@businessconector.com</li>
              <li><strong>Phone:</strong> (863) 320-3921</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
