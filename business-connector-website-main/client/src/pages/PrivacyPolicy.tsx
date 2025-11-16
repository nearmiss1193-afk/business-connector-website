import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
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
                  Business Conector ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our lead generation 
                  and CRM services, including our website and related services (collectively, the "Services").
                </p>
                <p>
                  By using our Services, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with our policies and practices, please do not use our Services.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1.1 Personal Information You Provide</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    We collect information that you voluntarily provide to us when you:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Register for an account</li>
                    <li>Fill out a contact form or request a demo</li>
                    <li>Subscribe to our services</li>
                    <li>Communicate with us via email, phone, or SMS</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    This information may include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Name (first and last)</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Company name and real estate license information</li>
                    <li>Brokerage affiliation</li>
                    <li>Business address</li>
                    <li>Payment information (processed securely by third-party payment processors)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">1.2 Automatically Collected Information</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    When you access our Services, we automatically collect certain information, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">1.3 Lead Data</h3>
                  <p className="text-sm text-muted-foreground">
                    As part of our lead generation services, we collect and process information about potential homebuyers 
                    on your behalf, including names, contact information, property preferences, budgets, and timelines. 
                    This data is collected from public sources and social media platforms in compliance with applicable laws.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>To provide our Services:</strong> Deliver exclusive buyer leads, manage your CRM, and facilitate automated follow-up campaigns.</li>
                  <li><strong>To communicate with you:</strong> Send service updates, lead notifications, billing information, and respond to your inquiries.</li>
                  <li><strong>To process payments:</strong> Facilitate subscription billing and payment processing through secure third-party processors.</li>
                  <li><strong>To improve our Services:</strong> Analyze usage patterns, troubleshoot technical issues, and enhance user experience.</li>
                  <li><strong>To comply with legal obligations:</strong> Meet regulatory requirements, including A2P 10DLC compliance and anti-spam regulations.</li>
                  <li><strong>To send marketing communications:</strong> Provide promotional offers and updates (you may opt out at any time).</li>
                </ul>
              </CardContent>
            </Card>

            {/* SMS and Communication Consent */}
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle>3. SMS and Communication Consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  By providing your phone number and consenting to receive SMS messages, you agree to receive text messages 
                  from Business Conector regarding:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Account notifications and service updates</li>
                  <li>New lead alerts</li>
                  <li>Billing reminders</li>
                  <li>System status updates</li>
                </ul>
                <p className="text-sm">
                  <strong>Message Frequency:</strong> Message frequency varies based on your account activity and service usage.
                </p>
                <p className="text-sm">
                  <strong>Message and Data Rates:</strong> Standard message and data rates from your mobile carrier may apply.
                </p>
                <p className="text-sm">
                  <strong>Opt-Out:</strong> You may opt out of SMS messages at any time by replying STOP to any message. 
                  You will receive a confirmation message confirming your opt-out.
                </p>
                <p className="text-sm">
                  <strong>Help:</strong> For help, reply HELP to any message or contact us at support@businessconector.com.
                </p>
                <p className="text-sm">
                  <strong>A2P 10DLC Compliance:</strong> Business Conector is registered with The Campaign Registry (TCR) 
                  and complies with all A2P 10DLC regulations. For more information, visit our{" "}
                  <Link href="/compliance">
                    <a className="text-primary hover:underline">A2P 10DLC Compliance page</a>
                  </Link>.
                </p>
              </CardContent>
            </Card>

            {/* How We Share Your Information */}
            <Card>
              <CardHeader>
                <CardTitle>4. How We Share Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  We do not sell, rent, or trade your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>Service Providers:</strong> Third-party vendors who assist us in providing our Services (e.g., payment processors, CRM platforms, SMS providers). These providers are contractually obligated to protect your information.</li>
                  <li><strong>Legal Requirements:</strong> When required by law, subpoena, or court order, or to protect our rights and safety.</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</li>
                  <li><strong>With Your Consent:</strong> We may share your information with third parties when you explicitly consent to such sharing.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle>5. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication requirements</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
                  to protect your information, we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights and Choices */}
            <Card>
              <CardHeader>
                <CardTitle>6. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                  <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete information.</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements).</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails or SMS messages at any time.</li>
                  <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  To exercise these rights, contact us at privacy@businessconector.com.
                </p>
              </CardContent>
            </Card>

            {/* Cookies and Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are 
                  small data files stored on your device that help us remember your preferences and analyze site usage.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can control cookies through your browser settings. However, disabling cookies may limit your ability 
                  to use certain features of our Services.
                </p>
              </CardContent>
            </Card>

            {/* Third-Party Links */}
            <Card>
              <CardHeader>
                <CardTitle>8. Third-Party Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our Services may contain links to third-party websites. We are not responsible for the privacy practices 
                  or content of these external sites. We encourage you to review the privacy policies of any third-party 
                  sites you visit.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>9. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                  information from children. If we become aware that we have collected information from a child, we will 
                  take steps to delete it promptly.
                </p>
              </CardContent>
            </Card>

            {/* Changes to This Policy */}
            <Card>
              <CardHeader>
                <CardTitle>10. Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page with an 
                  updated "Last Updated" date. We encourage you to review this policy periodically to stay informed about 
                  how we protect your information.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>11. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
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
