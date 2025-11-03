import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                BC
              </div>
              <span className="font-bold text-xl">Business Conector</span>
            </a>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <a>Back to Home</a>
            </Link>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <section className="py-12 flex-1">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">
                <strong>Effective Date:</strong> November 3, 2025
              </p>
              <p className="text-muted-foreground">
                <strong>Last Updated:</strong> November 3, 2025
              </p>
            </div>

            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to Business Conector. These Terms of Service ("Terms") govern your access to and use of our 
                  lead generation and CRM services, including our website, software, and related services (collectively, 
                  the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
                </p>
                <p>
                  If you do not agree to these Terms, you may not access or use our Services.
                </p>
              </CardContent>
            </Card>

            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  By creating an account, subscribing to our Services, or otherwise accessing our platform, you acknowledge 
                  that you have read, understood, and agree to be bound by these Terms and our{" "}
                  <Link href="/privacy-policy">
                    <a className="text-primary hover:underline">Privacy Policy</a>
                  </Link>.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you are using our Services on behalf of a company or organization, you represent that you have the 
                  authority to bind that entity to these Terms.
                </p>
              </CardContent>
            </Card>

            {/* Services Description */}
            <Card>
              <CardHeader>
                <CardTitle>2. Services Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Business Conector provides real estate agents with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Exclusive buyer leads sourced from social media and public platforms</li>
                  <li>White-label CRM system for lead management and follow-up</li>
                  <li>Automated email and SMS campaigns</li>
                  <li>Lead monitoring and alert systems</li>
                  <li>Additional services as described in your subscription plan</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time, with or 
                  without notice.
                </p>
              </CardContent>
            </Card>

            {/* Account Registration */}
            <Card>
              <CardHeader>
                <CardTitle>3. Account Registration and Eligibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">3.1 Eligibility</h3>
                  <p className="text-sm text-muted-foreground">
                    You must be at least 18 years old and a licensed real estate professional to use our Services. By 
                    registering, you represent and warrant that you meet these requirements.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3.2 Account Security</h3>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account credentials and for all 
                    activities that occur under your account. You agree to notify us immediately of any unauthorized use 
                    of your account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3.3 Accurate Information</h3>
                  <p className="text-sm text-muted-foreground">
                    You agree to provide accurate, current, and complete information during registration and to update 
                    your information as necessary to keep it accurate and current.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Subscription and Payment */}
            <Card>
              <CardHeader>
                <CardTitle>4. Subscription and Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">4.1 Subscription Plans</h3>
                  <p className="text-sm text-muted-foreground">
                    Business Conector offers multiple subscription tiers with varying features and pricing. Your subscription 
                    begins upon payment of the applicable fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.2 Billing</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscriptions are billed monthly or annually, depending on your selected plan. You authorize us to charge 
                    your payment method on a recurring basis until you cancel your subscription.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.3 Setup Fees</h3>
                  <p className="text-sm text-muted-foreground">
                    A one-time setup fee may apply to new accounts. This fee covers account configuration, CRM setup, and 
                    initial onboarding.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.4 Price Changes</h3>
                  <p className="text-sm text-muted-foreground">
                    We reserve the right to modify our pricing at any time. Price changes will be communicated to you at 
                    least 30 days in advance and will take effect at the start of your next billing cycle.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.5 Refund Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Setup fees are non-refundable. Monthly subscription fees are non-refundable except as required by law. 
                    If you cancel your subscription, you will retain access to the Services until the end of your current 
                    billing period.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.6 Failed Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    If a payment fails, we may suspend your access to the Services until payment is received. Repeated 
                    payment failures may result in account termination.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lead Delivery and Quality */}
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle>5. Lead Delivery and Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">5.1 Lead Exclusivity</h3>
                  <p className="text-sm">
                    Leads provided to you are exclusive and will not be sold to other agents. However, we do not guarantee 
                    that leads will result in closed transactions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">5.2 Lead Volume</h3>
                  <p className="text-sm">
                    We aim to deliver the number of leads specified in your subscription plan each month. Lead volume may 
                    vary based on market conditions and availability.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">5.3 Lead Quality</h3>
                  <p className="text-sm">
                    While we strive to provide high-quality, pre-qualified leads, we cannot guarantee the accuracy or 
                    responsiveness of every lead. Real estate transactions depend on many factors beyond our control.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">5.4 Your Responsibility</h3>
                  <p className="text-sm">
                    You are responsible for following up with leads promptly and professionally. We are not responsible 
                    for lost opportunities due to delayed or inadequate follow-up.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle>6. Acceptable Use Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  You agree to use our Services only for lawful purposes and in compliance with all applicable laws and 
                  regulations. You agree NOT to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Violate any local, state, federal, or international law</li>
                  <li>Send spam, unsolicited messages, or violate anti-spam regulations (CAN-SPAM, TCPA, CTIA)</li>
                  <li>Engage in fraudulent, deceptive, or misleading practices</li>
                  <li>Harass, threaten, or abuse leads or other users</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Use automated tools (bots, scrapers) to access our Services without permission</li>
                  <li>Resell or redistribute leads to third parties</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from our software</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account.
                </p>
              </CardContent>
            </Card>

            {/* SMS and Communication Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>7. SMS and Communication Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">7.1 A2P 10DLC Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    Business Conector is registered with The Campaign Registry (TCR) and complies with all A2P 10DLC 
                    regulations. For more information, visit our{" "}
                    <Link href="/compliance">
                      <a className="text-primary hover:underline">A2P 10DLC Compliance page</a>
                    </Link>.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">7.2 Your Compliance Obligations</h3>
                  <p className="text-sm text-muted-foreground">
                    When using our SMS services, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                    <li>Obtain explicit written consent from leads before sending SMS messages</li>
                    <li>Honor all opt-out requests immediately</li>
                    <li>Comply with TCPA, CAN-SPAM, and CTIA guidelines</li>
                    <li>Include clear opt-out instructions in every message</li>
                    <li>Avoid sending prohibited content (e.g., illegal offers, phishing, adult content)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">7.3 Prohibited Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Sending prohibited content may result in Sev-0 fines ranging from $500 to $2,000 per violation, 
                    imposed by carriers. You are solely responsible for any fines or penalties resulting from your use 
                    of our SMS services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>8. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">8.1 Our Intellectual Property</h3>
                  <p className="text-sm text-muted-foreground">
                    All content, features, and functionality of the Services, including but not limited to text, graphics, 
                    logos, software, and design, are owned by Business Conector or our licensors and are protected by 
                    copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">8.2 Limited License</h3>
                  <p className="text-sm text-muted-foreground">
                    We grant you a limited, non-exclusive, non-transferable license to access and use the Services for 
                    your internal business purposes. This license does not include the right to resell, redistribute, or 
                    create derivative works.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">8.3 White-Label CRM</h3>
                  <p className="text-sm text-muted-foreground">
                    You may customize the CRM with your branding (logo, colors, etc.) for use with your clients. However, 
                    the underlying software and technology remain our property.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Ownership */}
            <Card>
              <CardHeader>
                <CardTitle>9. Data Ownership and Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">9.1 Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    You retain ownership of all data you upload to or create within the Services, including lead data, 
                    contact information, and communications.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">9.2 Our Use of Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    We may use aggregated, anonymized data for analytics, product improvement, and marketing purposes. 
                    For details on how we collect and use your data, please review our{" "}
                    <Link href="/privacy-policy">
                      <a className="text-primary hover:underline">Privacy Policy</a>
                    </Link>.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">9.3 Data Export</h3>
                  <p className="text-sm text-muted-foreground">
                    You may export your data at any time through the CRM interface. Upon account termination, you will 
                    have 30 days to export your data before it is permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>10. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">10.1 Termination by You</h3>
                  <p className="text-sm text-muted-foreground">
                    You may cancel your subscription at any time through your account settings or by contacting support. 
                    Cancellation will take effect at the end of your current billing period.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">10.2 Termination by Us</h3>
                  <p className="text-sm text-muted-foreground">
                    We may suspend or terminate your account immediately if you violate these Terms, fail to pay fees, 
                    or engage in fraudulent or illegal activity.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">10.3 Effect of Termination</h3>
                  <p className="text-sm text-muted-foreground">
                    Upon termination, your access to the Services will cease, and you will no longer receive leads. You 
                    will have 30 days to export your data before it is permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle>11. Disclaimers and Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">11.1 No Warranties</h3>
                  <p className="text-sm text-muted-foreground">
                    THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                    OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                    PURPOSE, OR NON-INFRINGEMENT.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">11.2 Limitation of Liability</h3>
                  <p className="text-sm text-muted-foreground">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUSINESS CONECTOR SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER 
                    INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES 
                    SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Indemnification */}
            <Card>
              <CardHeader>
                <CardTitle>12. Indemnification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You agree to indemnify, defend, and hold harmless Business Conector, its affiliates, and their respective 
                  officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses 
                  (including reasonable attorneys' fees) arising out of or related to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Your use of the Services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any law or regulation</li>
                  <li>Your violation of any third-party rights</li>
                </ul>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>13. Governing Law and Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">13.1 Governing Law</h3>
                  <p className="text-sm text-muted-foreground">
                    These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], 
                    without regard to its conflict of law provisions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">13.2 Dispute Resolution</h3>
                  <p className="text-sm text-muted-foreground">
                    Any disputes arising out of or related to these Terms or the Services shall be resolved through binding 
                    arbitration in accordance with the rules of the American Arbitration Association, except that either 
                    party may seek injunctive relief in court to protect intellectual property rights.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Miscellaneous */}
            <Card>
              <CardHeader>
                <CardTitle>14. Miscellaneous</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">14.1 Entire Agreement</h3>
                  <p className="text-sm text-muted-foreground">
                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and Business 
                    Conector regarding the Services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">14.2 Severability</h3>
                  <p className="text-sm text-muted-foreground">
                    If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall 
                    remain in full force and effect.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">14.3 Waiver</h3>
                  <p className="text-sm text-muted-foreground">
                    Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right 
                    or provision.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">14.4 Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    You may not assign or transfer these Terms or your account without our prior written consent. We may 
                    assign these Terms without restriction.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>15. Changes to These Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by email 
                  or through the Services at least 30 days before the changes take effect. Your continued use of the Services 
                  after the changes become effective constitutes your acceptance of the revised Terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>16. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  If you have questions or concerns about these Terms, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Business Conector</strong></p>
                  <p>Email: <a href="mailto:EFILE1234@INCFILE.COM" className="text-primary hover:underline">EFILE1234@INCFILE.COM</a></p>
                  <p>Phone: <a href="tel:+18884623453" className="text-primary hover:underline">(888) 462-3453</a></p>
                  <p>Address: 5830 E 2nd St, Ste 7000 #29249, Casper, WY 82609</p>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="flex justify-center pt-8">
              <Button size="lg" asChild>
                <Link href="/">
                  <a>Back to Home</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t mt-auto">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Business Conector. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
