import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { Loader2, CreditCard, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AgentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch agent stats
  const { data: stats, isLoading: statsLoading } = trpc.payments.getAgentStats.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch subscription
  const { data: subscription } = trpc.payments.getSubscription.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch lead purchases
  const { data: leadPurchases } = trpc.payments.getLeadPurchases.useQuery(
    { limit: 10 },
    { enabled: !!user }
  );

  // Fetch payment history
  const { data: paymentHistory } = trpc.payments.getPaymentHistory.useQuery(
    { limit: 10 },
    { enabled: !!user }
  );

  // Fetch agent profile
  const { data: profile } = trpc.leadsMarketplace.getAgentProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const createSubscriptionMutation = trpc.payments.createSubscription.useMutation({
    onSuccess: (data) => {
      toast.success("Subscription created! Redirecting to payment...");
      // Handle payment confirmation
      if (data.clientSecret) {
        // Redirect to Stripe payment page
        window.location.href = `/checkout?clientSecret=${data.clientSecret}`;
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const cancelSubscriptionMutation = trpc.payments.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription cancelled");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (authLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the dashboard</p>
      </div>
    );
  }

  const isLoading = statsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {user.name}!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leads Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.leadsPurchased || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalSpent || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription ? (
                  <Badge variant="default" className="capitalize">
                    {subscription.planType}
                  </Badge>
                ) : (
                  <Badge variant="outline">None</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current plan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.status === "active" ? (
                  <Badge variant="default" className="bg-green-600">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Account status</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Purchases */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Lead Purchases</CardTitle>
                  <CardDescription>Your latest lead purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : leadPurchases && leadPurchases.length > 0 ? (
                    <div className="space-y-4">
                      {leadPurchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                          <div>
                            <p className="font-medium capitalize">{purchase.leadType} Lead</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${purchase.price}</p>
                            <Badge
                              variant={
                                purchase.paymentStatus === "succeeded" ? "default" : "secondary"
                              }
                              className="text-xs capitalize"
                            >
                              {purchase.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No lead purchases yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : paymentHistory && paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                          <div>
                            <p className="font-medium capitalize">{payment.paymentType}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${payment.amount}</p>
                            <Badge
                              variant={payment.status === "succeeded" ? "default" : "secondary"}
                              className="text-xs capitalize"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No payment history</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Plan</p>
                        <p className="text-lg font-bold capitalize">{subscription.planType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Price</p>
                        <p className="text-lg font-bold">${subscription.monthlyPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="default" className="capitalize">
                          {subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Renewal Date</p>
                        <p className="text-lg font-bold">
                          {subscription.renewalDate
                            ? new Date(subscription.renewalDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="destructive"
                        onClick={() => cancelSubscriptionMutation.mutate()}
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        {cancelSubscriptionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      You don't have an active subscription. Choose a plan to get started.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { type: "starter", price: 199, features: ["50 leads/month", "Basic analytics"] },
                        {
                          type: "professional",
                          price: 299,
                          features: ["200 leads/month", "Advanced analytics", "Priority support"],
                        },
                        {
                          type: "premium",
                          price: 449,
                          features: ["Unlimited leads", "Full analytics", "Dedicated support"],
                        },
                      ].map((plan) => (
                        <Card key={plan.type} className="border-2">
                          <CardHeader>
                            <CardTitle className="capitalize">{plan.type}</CardTitle>
                            <CardDescription>${plan.price}/month</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <ul className="space-y-2">
                              {plan.features.map((feature) => (
                                <li key={feature} className="text-sm flex items-center">
                                  <span className="mr-2">✓</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Button
                              className="w-full"
                              onClick={() =>
                                createSubscriptionMutation.mutate({
                                  planType: plan.type as any,
                                })
                              }
                              disabled={createSubscriptionMutation.isPending}
                            >
                              {createSubscriptionMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Choose Plan"
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Browse Available Leads</CardTitle>
                <CardDescription>Purchase high-quality leads for your business</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/leads-marketplace">Go to Leads Marketplace</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Profile</CardTitle>
                <CardDescription>Manage your professional profile</CardDescription>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{profile.companyName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">License</p>
                        <p className="font-medium">{profile.licenseNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{profile.yearsExperience || "N/A"} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile.phone || "N/A"}</p>
                      </div>
                    </div>
                    <Button asChild>
                      <a href="/edit-profile">Edit Profile</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Set up your professional profile to attract more leads.
                    </p>
                    <Button asChild>
                      <a href="/setup-profile">Setup Profile</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
