import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, TrendingUp, Users, Zap, Shield, BarChart3, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              BC
            </div>
            <span className="font-bold text-xl">Business Conector</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="#sign-in">Sign In</a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/get-started">
                <a>Get Started</a>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="mx-auto" variant="secondary">
              Stop Competing for Shared Zillow Leads
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Get <span className="text-primary">Exclusive Buyer Leads</span> That Only You Can Close
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              30-50 exclusive buyer leads per month + white-label CRM that builds YOUR brand, not your broker's. 
              Works with any brokerage. From $397/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/get-started">
                  <a>Start Getting Leads</a>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                <span>100% Exclusive Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                <span>White-Label CRM</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                <span>60-80% Cheaper Than Zillow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              The Problem With Broker Leads
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5 text-destructive" />
                    Shared Broker Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Shared with 10+ agents who all compete</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Branded with broker's name, not yours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>New agents get ZERO leads</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>Lose everything if you switch brokers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>$500-2,000/month for Zillow leads</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/50 bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent" />
                    Business Conector
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>100% exclusive to you (not shared)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>White-labeled with YOUR brand</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Perfect for new and independent agents</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Keep your CRM and database forever</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>Only $397/month (60-80% cheaper)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Not just leads—a complete system to find, nurture, and close more deals
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Exclusive Buyer Leads</CardTitle>
                  <CardDescription>
                    5-15 high-quality buyer intent signals per month from Reddit and Facebook. Not shared with anyone else.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>White-Label CRM</CardTitle>
                  <CardDescription>
                    Powerful white-label CRM branded with YOUR name and logo. Unlimited contacts and automation.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Automated Follow-Up</CardTitle>
                  <CardDescription>
                    Pre-built email and SMS sequences that nurture leads automatically while you focus on closing.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>New Homeowner Database</CardTitle>
                  <CardDescription>
                    50-100 new homeowners per month. Build your sphere of influence for future seller pipeline.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>AI Content Creation</CardTitle>
                  <CardDescription>
                    20 social media posts and 4 videos per month. Stay top-of-mind without spending hours creating content.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>A2P 10DLC Compliant</CardTitle>
                  <CardDescription>
                    Fully compliant SMS messaging system. No risk of carrier blocks or compliance issues.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include exclusive leads and white-label CRM.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Core Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Core</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$397</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">+ $1,500 setup (one-time)</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">5-15 exclusive buyer leads/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Reddit + Facebook monitoring</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">White-label CRM included</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Unlimited contacts & automation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Email & SMS campaigns</span>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/get-started">
                      <a>Get Started</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Nurture Plan */}
              <Card className="border-primary shadow-lg scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Core + Nurture</CardTitle>
                  <CardDescription>Build long-term pipeline</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$594</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">+ $1,500 setup (one-time)</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">Everything in Core, plus:</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">50-100 new homeowners/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Automated welcome campaigns</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">5-7 year nurture sequence</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Future seller pipeline</span>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/get-started">
                      <a>Get Started</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Content Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Core + Content</CardTitle>
                  <CardDescription>Complete marketing system</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$891</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">+ $1,500 setup (one-time)</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">Everything in Core + Nurture, plus:</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">20 AI-generated posts/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">4 professional videos/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Automated social media posting</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Stay top-of-mind effortlessly</span>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/get-started">
                      <a>Get Started</a>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              All plans include A2P 10DLC compliant SMS, unlimited contacts, and full CRM automation.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">We Monitor for Buyer Intent</h3>
                  <p className="text-muted-foreground">
                    Our system continuously monitors Reddit and Facebook for people actively looking to buy homes in your area. 
                    We filter out noise and identify genuine buyer intent signals.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">You Receive Exclusive Leads</h3>
                  <p className="text-muted-foreground">
                    When we find a qualified buyer, you're the ONLY agent who gets that lead. No competition, no sharing. 
                    We provide outreach templates to help you capture their contact information.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">CRM Automates Follow-Up</h3>
                  <p className="text-muted-foreground">
                    Once you capture a lead, our white-label CRM takes over with automated email and SMS sequences. 
                    Leads are nurtured automatically while you focus on showing homes and closing deals.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">You Close More Deals</h3>
                  <p className="text-muted-foreground">
                    With exclusive leads, automated follow-up, and long-term nurture campaigns, you close more deals 
                    and build a sustainable pipeline for years to come.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How is this different from my broker's Zillow leads?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your broker's leads are shared with 10+ agents who all compete for the same prospects. 
                    Our leads are 100% exclusive to you—no competition. Plus, our CRM is white-labeled with YOUR brand, 
                    not your broker's.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How many leads will I actually get?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Realistically, 5-15 buyer intent signals per month. With a 20-40% response rate, that's 2-6 engaged 
                    leads with contact information. Quality over quantity—these are exclusive leads, not shared with 10+ agents.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I switch brokerages?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You keep everything! Your CRM, your database, your automation—it all stays with you. 
                    Unlike broker-provided tools, Business Conector is YOUR system that you own and control.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is this compliant with SMS regulations?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! We're fully A2P 10DLC compliant. Our SMS system follows all carrier regulations and best practices 
                    to ensure your messages are delivered without risk of blocks or compliance issues.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, there are no long-term contracts. You can cancel anytime. However, the $1,500 setup fee is non-refundable 
                    as it covers the initial CRM configuration and integration work.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Stop Competing for Shared Leads?
            </h2>
            <p className="text-xl opacity-90">
              Join Business Conector today and start receiving exclusive buyer leads that only you can close.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/get-started">
                  <a>Schedule a Demo</a>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/get-started">
                  <a>Start Free Trial</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  BC
                </div>
                <span className="font-bold">Business Conector</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Exclusive buyer leads and white-label CRM for real estate agents.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy-policy"><a className="hover:text-foreground transition-colors">Privacy Policy</a></Link></li>
                <li><Link href="/terms-of-service"><a className="hover:text-foreground transition-colors">Terms of Service</a></Link></li>
                <li><Link href="/compliance"><a className="hover:text-foreground transition-colors">A2P 10DLC Compliance</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Business Conector. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
