import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function GetStarted() {
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    brokerage: string;
    yearsExperience: string;
    currentLeadSource: string;
    selectedPlan: "core" | "nurture" | "content";
    message: string;
    agreeToSMS: boolean;
    agreeToTerms: boolean;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    brokerage: "",
    yearsExperience: "",
    currentLeadSource: "",
    selectedPlan: "core",
    message: "",
    agreeToSMS: false,
    agreeToTerms: false,
  });

  const submitLead = trpc.leads.submit.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!", {
        description: "We'll contact you within 24 hours to schedule your onboarding.",
      });
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        brokerage: "",
        yearsExperience: "",
        currentLeadSource: "",
        selectedPlan: "core",
        message: "",
        agreeToSMS: false,
        agreeToTerms: false,
      });
    },
    onError: (error: any) => {
      toast.error("Submission failed", {
        description: error.message || "Please try again or contact support.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.agreeToSMS) {
      toast.error("Please consent to SMS communications");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    // Submit to backend
    submitLead.mutate(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

      {/* Form Section */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Start Getting Exclusive Buyer Leads
              </h1>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll contact you within 24 hours to get you set up.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                <CardDescription>
                  Tell us about yourself and your business so we can customize your setup.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          placeholder="John"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                          placeholder="Smith"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="brokerage">Current Brokerage</Label>
                      <Input
                        id="brokerage"
                        value={formData.brokerage}
                        onChange={(e) => handleChange("brokerage", e.target.value)}
                        placeholder="Keller Williams, RE/MAX, etc."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Select
                          value={formData.yearsExperience}
                          onValueChange={(value) => handleChange("yearsExperience", value)}
                        >
                          <SelectTrigger id="yearsExperience">
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">Less than 1 year</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentLeadSource">Current Lead Source</Label>
                        <Select
                          value={formData.currentLeadSource}
                          onValueChange={(value) => handleChange("currentLeadSource", value)}
                        >
                          <SelectTrigger id="currentLeadSource">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zillow">Zillow Premier Agent</SelectItem>
                            <SelectItem value="realtor">Realtor.com</SelectItem>
                            <SelectItem value="broker">Broker Leads</SelectItem>
                            <SelectItem value="referrals">Referrals Only</SelectItem>
                            <SelectItem value="facebook">Facebook Ads</SelectItem>
                            <SelectItem value="none">No Current Source</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Your Plan</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.selectedPlan === "core"
                            ? "border-primary ring-2 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleChange("selectedPlan", "core")}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">Core</CardTitle>
                          <CardDescription>$397/month</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-accent" />
                              <span>5-15 exclusive leads</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-accent" />
                              <span>White-label CRM</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.selectedPlan === "nurture"
                            ? "border-primary ring-2 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleChange("selectedPlan", "nurture")}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">Core + Nurture</CardTitle>
                          <CardDescription>$594/month</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-accent" />
                              <span>Everything in Core</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-accent" />
                              <span>+ New homeowners</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.selectedPlan === "content"
                            ? "border-primary ring-2 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleChange("selectedPlan", "content")}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">Core + Content</CardTitle>
                          <CardDescription>$891/month</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-accent" />
                              <span>Everything + Nurture</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-accent" />
                              <span>+ Content creation</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Tell us about your goals (optional)
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="What are you hoping to achieve with Business Conector?"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agreeToSMS"
                        checked={formData.agreeToSMS}
                        onCheckedChange={(checked) => handleChange("agreeToSMS", checked as boolean)}
                      />
                      <Label htmlFor="agreeToSMS" className="text-sm font-normal leading-relaxed cursor-pointer">
                        I consent to receive SMS messages from Business Conector regarding my account, 
                        leads, and service updates. Message and data rates may apply. Reply STOP to opt out. 
                        <span className="text-destructive">*</span>
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleChange("agreeToTerms", checked as boolean)}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                        . <span className="text-destructive">*</span>
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitLead.isPending}
                    >
                      {submitLead.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      We'll contact you within 24 hours to schedule your onboarding call.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">A2P 10DLC Compliant</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">$0</div>
                <p className="text-sm text-muted-foreground">Application Fee</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
