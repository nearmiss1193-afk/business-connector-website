import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, MapPin, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

export default function LeadsMarketplace() {
  const { user, loading: authLoading } = useAuth();
  const [selectedLeadType, setSelectedLeadType] = useState<"buyer" | "seller" | "mortgage">("buyer");
  const [searchCity, setSearchCity] = useState("");

  // Fetch available leads
  const { data: leads, isLoading: leadsLoading } = trpc.leadsMarketplace.getAvailableLeads.useQuery(
    { leadType: selectedLeadType, limit: 50 },
    { enabled: !!user }
  );

  // Search leads
  const { data: searchResults, isLoading: searchLoading } = trpc.leadsMarketplace.searchLeads.useQuery(
    {
      leadType: selectedLeadType,
      city: searchCity || undefined,
      limit: 50,
    },
    { enabled: !!user && searchCity.length > 0 }
  );

  // Purchase lead mutation
  const purchaseLead = trpc.payments.purchaseLead.useMutation({
    onSuccess: (data) => {
      toast.success("Lead purchased! Processing payment...");
      // Redirect to payment page
      if (data.clientSecret) {
        window.location.href = `/checkout?clientSecret=${data.clientSecret}`;
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the leads marketplace</p>
      </div>
    );
  }

  const displayLeads = searchCity.length > 0 ? searchResults : leads;
  const isLoading = searchCity.length > 0 ? searchLoading : leadsLoading;

  const getQualityColor = (score: string) => {
    switch (score) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLeadPrice = (type: string) => {
    switch (type) {
      case "buyer":
        return 10;
      case "seller":
        return 15;
      case "mortgage":
        return 12;
      default:
        return 10;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leads Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and purchase high-quality leads for your real estate business
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lead Type Tabs */}
            <Tabs value={selectedLeadType} onValueChange={(v) => setSelectedLeadType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="buyer">Buyer Leads</TabsTrigger>
                <TabsTrigger value="seller">Seller Leads</TabsTrigger>
                <TabsTrigger value="mortgage">Mortgage Leads</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Price per lead:</strong> ${getLeadPrice(selectedLeadType)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leads Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : displayLeads && displayLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {lead.firstName} {lead.lastName}
                        </CardTitle>
                        <CardDescription>{lead.email}</CardDescription>
                      </div>
                      <Badge className={getQualityColor(lead.qualityScore)} variant="outline">
                        {lead.qualityScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Lead Details */}
                    <div className="space-y-2 text-sm">
                      {lead.phone && (
                        <p>
                          <strong>Phone:</strong> {lead.phone}
                        </p>
                      )}
                      {lead.city && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {lead.city}, {lead.state} {lead.zipCode}
                        </p>
                      )}

                      {/* Buyer-specific */}
                      {lead.budgetMax && (
                        <p className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Budget: ${lead.budgetMin?.toString() || "0"} - $
                          {lead.budgetMax.toString()}
                        </p>
                      )}

                      {/* Timeline */}
                      {lead.timelineMonths && (
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timeline: {lead.timelineMonths} months
                        </p>
                      )}

                      {/* Quality Reason */}
                      {lead.qualityReason && (
                        <p className="text-muted-foreground italic">
                          <strong>Notes:</strong> {lead.qualityReason}
                        </p>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <Button
                      className="w-full"
                      onClick={() => purchaseLead.mutate({ leadId: lead.id })}
                      disabled={purchaseLead.isPending}
                    >
                      {purchaseLead.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Purchase - ${getLeadPrice(selectedLeadType)}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchCity.length > 0
                    ? "No leads found in that city"
                    : "No available leads at the moment"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
