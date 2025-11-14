import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, DollarSign, Users, TrendingUp, Activity } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  // Check if user is admin
  if (!authLoading && (!user || user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch platform statistics
  const { data: stats, isLoading: statsLoading } = trpc.system.getPlatformStats.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Sample data for charts
  const revenueData = [
    { month: "Jan", revenue: 4000, leads: 240 },
    { month: "Feb", revenue: 3000, leads: 221 },
    { month: "Mar", revenue: 2000, leads: 229 },
    { month: "Apr", revenue: 2780, leads: 200 },
    { month: "May", revenue: 1890, leads: 229 },
    { month: "Jun", revenue: 2390, leads: 200 },
  ];

  const subscriptionData = [
    { name: "Starter", value: 45 },
    { name: "Professional", value: 32 },
    { name: "Premium", value: 18 },
  ];

  const leadTypeData = [
    { name: "Buyer", value: 450 },
    { name: "Seller", value: 320 },
    { name: "Mortgage", value: 280 },
  ];

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform analytics and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Revenue
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From successful transactions
              </p>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Active Subscriptions
                <Users className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeSubscriptions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active agent subscriptions
              </p>
            </CardContent>
          </Card>

          {/* Total Leads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Leads
                <Activity className="h-4 w-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.totalLeads || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In the marketplace
              </p>
            </CardContent>
          </Card>

          {/* Total Purchases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Lead Purchases
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.totalPurchases || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="leads">Lead Types</TabsTrigger>
          </TabsList>

          {/* Revenue Chart */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Lead Volume Trends</CardTitle>
                <CardDescription>
                  Monthly revenue and lead purchase trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      name="Revenue ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="leads"
                      stroke="#10b981"
                      name="Leads Purchased"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Distribution */}
          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                  <CardDescription>
                    Agent subscriptions by plan type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Breakdown by plan type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscriptionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value} agents</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lead Types */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Lead Type Distribution</CardTitle>
                <CardDescription>
                  Available leads by type in the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Number of Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Admin Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>
              Platform management and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              View All Agents
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Manage Lead Quality Rules
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View Payment Transactions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
