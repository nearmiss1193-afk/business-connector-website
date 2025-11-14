import { useEffect, useState } from "react";
import { useSearchParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const clientSecret = searchParams.get("clientSecret");
  const [status, setStatus] = useState<"processing" | "success" | "error" | "idle">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!clientSecret) {
      setStatus("error");
      setMessage("No payment information provided");
      return;
    }

    // Initialize Stripe and confirm payment
    const confirmPayment = async () => {
      try {
        setStatus("processing");
        
        // In a real implementation, you would use Stripe.js here
        // For now, we'll simulate the payment confirmation
        const response = await fetch("/api/trpc/payments.confirmPayment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientSecret,
          }),
        });

        if (!response.ok) {
          throw new Error("Payment confirmation failed");
        }

        const data = await response.json();
        
        if (data.success) {
          setStatus("success");
          setMessage("Payment successful! Your lead purchase is being processed.");
          toast.success("Payment completed successfully!");
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            window.location.href = "/agent-dashboard";
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment failed");
          toast.error("Payment failed: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Payment processing failed");
        toast.error("Error processing payment");
      }
    };

    confirmPayment();
  }, [clientSecret]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please log in to complete your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Processing</CardTitle>
          <CardDescription>
            {status === "processing" && "Processing your payment..."}
            {status === "success" && "Payment Successful"}
            {status === "error" && "Payment Failed"}
            {status === "idle" && "Initializing payment..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === "processing" && (
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          {/* Message */}
          <p className="text-center text-sm text-muted-foreground">{message}</p>

          {/* Action Buttons */}
          {status === "success" && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Redirecting to your dashboard...
              </p>
              <Button
                className="w-full"
                onClick={() => (window.location.href = "/agent-dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
              <Button
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                Return Home
              </Button>
            </div>
          )}

          {/* Payment Details */}
          {(status === "processing" || status === "idle") && (
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              <p>
                <strong>User:</strong> {user.name || user.email}
              </p>
              <p>
                <strong>Status:</strong> {status === "processing" ? "Processing" : "Initializing"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
