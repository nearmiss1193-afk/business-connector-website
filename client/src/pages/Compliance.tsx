import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Compliance() {
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

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">
              A2P 10DLC Compliance
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Business Conector is fully compliant with A2P 10DLC regulations, ensuring your SMS messages 
              are delivered reliably and legally.
            </p>
          </div>
        </div>
      </section>

      {/* What is A2P 10DLC */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  What is A2P 10DLC?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  A2P 10DLC stands for "Application-to-Person 10-Digit Long Code." It's a system in the United States 
                  that allows businesses to send Application-to-Person (A2P) type messaging via standard 10-digit long 
                  code (10DLC) phone numbers.
                </p>
                <p className="text-muted-foreground">
                  Major carriers (AT&T, T-Mobile, Verizon) require all businesses sending SMS messages to register their 
                  campaigns and brands through this system. This helps reduce spam, improves deliverability, and ensures 
                  compliance with telecommunications regulations.
                </p>
              </CardContent>
            </Card>

            {/* Why It Matters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Why A2P 10DLC Compliance Matters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Higher Deliverability</h3>
                      <p className="text-sm text-muted-foreground">
                        Registered campaigns have significantly higher message delivery rates compared to unregistered numbers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Avoid Carrier Blocks</h3>
                      <p className="text-sm text-muted-foreground">
                        Unregistered business messaging can be filtered or blocked entirely by carriers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Legal Compliance</h3>
                      <p className="text-sm text-muted-foreground">
                        Stay compliant with TCPA, CTIA guidelines, and carrier requirements.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Higher Throughput</h3>
                      <p className="text-sm text-muted-foreground">
                        Registered campaigns can send more messages per second than unregistered numbers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How Business Conector is Compliant */}
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  How Business Conector Ensures Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Brand Registration</h3>
                      <p className="text-sm text-muted-foreground">
                        Business Conector is registered as a verified brand with The Campaign Registry (TCR), 
                        the official A2P 10DLC registration platform.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Campaign Registration</h3>
                      <p className="text-sm text-muted-foreground">
                        All messaging campaigns are registered with detailed use-case descriptions and sample messages 
                        for carrier approval.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Explicit Consent</h3>
                      <p className="text-sm text-muted-foreground">
                        All users must provide explicit written consent before receiving SMS messages, 
                        as required by TCPA regulations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Opt-Out Mechanisms</h3>
                      <p className="text-sm text-muted-foreground">
                        Every SMS includes clear opt-out instructions (reply STOP), and opt-out requests are 
                        processed immediately and automatically.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Content Monitoring</h3>
                      <p className="text-sm text-muted-foreground">
                        All message templates are reviewed for compliance with carrier content policies and 
                        CTIA messaging principles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Consent Requirements</CardTitle>
                <CardDescription>
                  What you need to know about SMS consent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  When you sign up for Business Conector, you'll see a consent checkbox that states:
                </p>
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-sm">
                    "I consent to receive SMS messages from Business Conector regarding my account, leads, 
                    and service updates. Message and data rates may apply. Reply STOP to opt out."
                  </p>
                </div>
                <p className="text-muted-foreground">
                  This consent is:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Explicit:</strong> You must actively check the box to agree</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Written:</strong> Your consent is recorded and timestamped</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Revocable:</strong> You can opt out at any time by replying STOP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Specific:</strong> Clearly states what types of messages you'll receive</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1">Right to Opt Out</h3>
                    <p className="text-sm text-muted-foreground">
                      You can stop receiving SMS messages at any time by replying STOP to any message. 
                      Your opt-out will be processed immediately.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Right to Help</h3>
                    <p className="text-sm text-muted-foreground">
                      Reply HELP to any message to receive support information and contact details.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">No Hidden Fees</h3>
                    <p className="text-sm text-muted-foreground">
                      Business Conector does not charge for SMS messages. However, standard message and data 
                      rates from your mobile carrier may apply.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Privacy Protection</h3>
                    <p className="text-sm text-muted-foreground">
                      Your phone number and consent records are stored securely and never shared with third parties 
                      without your explicit permission.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Questions About Compliance?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about our A2P 10DLC compliance, SMS consent, or your rights, 
                  please contact our compliance team:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <a href="mailto:compliance@businessconector.com">Email Compliance Team</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/get-started">
                      <a>Get Started</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t mt-auto">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Business Conector. All rights reserved.</p>
            <p className="mt-2">
              <Link href="/">
                <a className="hover:text-foreground transition-colors">Home</a>
              </Link>
              {" • "}
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              {" • "}
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
