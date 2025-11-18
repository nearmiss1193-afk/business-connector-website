import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Success() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                CF
              </div>
              <span className="font-bold text-xl">Central Florida Homes</span>
            </a>
          </Link>
        </div>
      </nav>

      {/* Success Section */}
      <section className="py-20 flex-1 flex items-center">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-accent" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                Application Submitted Successfully!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your interest in Central Florida Homes. We've received your application 
                and will contact you within 24 hours to schedule your onboarding call.
              </p>
            </div>

            {/* What Happens Next */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-6">What Happens Next?</h2>
                <div className="space-y-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Check Your Email</h3>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a confirmation email with your application details and next steps.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">We'll Contact You</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team will reach out within 24 hours to schedule your personalized onboarding call.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Onboarding Call</h3>
                      <p className="text-sm text-muted-foreground">
                        During the call, we'll set up your white-label CRM, configure your lead monitoring, 
                        and answer any questions you have.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Start Receiving Leads</h3>
                      <p className="text-sm text-muted-foreground">
                        Once your account is set up, you'll start receiving exclusive buyer leads 
                        within 48-72 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/">
                  <a>Back to Home</a>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:support@centralfloridahomes.com">Contact Support</a>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Questions?</strong> Email us at{" "}
                <a href="mailto:support@centralfloridahomes.com" className="text-primary hover:underline">
                  support@centralfloridahomes.com
                </a>{" "}
                or call{" "}
                <a href="tel:+15551234567" className="text-primary hover:underline">
                  (555) 123-4567
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Central Florida Homes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
