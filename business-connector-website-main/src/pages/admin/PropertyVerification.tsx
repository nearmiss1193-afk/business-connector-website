import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Flag, Trash2, XCircle } from "lucide-react";

type VerificationStatus = "active" | "off_market" | "flagged" | "reported" | "verified";

export default function PropertyVerification() {
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>("reported");
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const utils = trpc.useUtils();

  // Get verification stats
  const { data: stats } = trpc.admin.getVerificationStats.useQuery();

  // Get properties by status
  const { data: propertiesData, isLoading } = trpc.admin.getPropertiesByStatus.useQuery({
    status: selectedStatus,
    limit: 50,
    offset: 0,
  });

  // Mutations
  const flagProperty = trpc.admin.flagProperty.useMutation({
    onSuccess: () => {
      toast.success("Property flagged successfully");
      utils.admin.getPropertiesByStatus.invalidate();
      utils.admin.getVerificationStats.invalidate();
      setFlagDialogOpen(false);
      setFlagReason("");
    },
    onError: (error) => {
      toast.error(`Failed to flag property: ${error.message}`);
    },
  });

  const unflagProperty = trpc.admin.unflagProperty.useMutation({
    onSuccess: () => {
      toast.success("Property verified successfully");
      utils.admin.getPropertiesByStatus.invalidate();
      utils.admin.getVerificationStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to verify property: ${error.message}`);
    },
  });

  const deleteProperty = trpc.admin.deleteProperty.useMutation({
    onSuccess: () => {
      toast.success("Property deleted successfully");
      utils.admin.getPropertiesByStatus.invalidate();
      utils.admin.getVerificationStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete property: ${error.message}`);
    },
  });

  const handleFlag = (propertyId: number) => {
    setSelectedProperty(propertyId);
    setFlagDialogOpen(true);
  };

  const handleFlagSubmit = () => {
    if (!selectedProperty || !flagReason.trim()) {
      toast.error("Please provide a reason for flagging");
      return;
    }

    flagProperty.mutate({
      propertyId: selectedProperty,
      reason: flagReason,
    });
  };

  const handleUnflag = (propertyId: number) => {
    if (confirm("Mark this property as verified and active?")) {
      unflagProperty.mutate({ propertyId });
    }
  };

  const handleDelete = (propertyId: number, address: string) => {
    if (confirm(`Are you sure you want to delete "${address}"? This cannot be undone.`)) {
      deleteProperty.mutate({ propertyId });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: "default", icon: CheckCircle },
      off_market: { variant: "secondary", icon: XCircle },
      flagged: { variant: "destructive", icon: Flag },
      reported: { variant: "destructive", icon: AlertTriangle },
      verified: { variant: "outline", icon: CheckCircle },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Verification</h1>
        <p className="text-muted-foreground">
          Manage property listings, flag inaccurate data, and review user reports
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.properties.total.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.properties.active.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Off Market</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.properties.offMarket.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flagged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.properties.flagged.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reported</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.properties.reported.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.properties.verified.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Properties by Status</CardTitle>
          <CardDescription>Review and manage properties based on their verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as VerificationStatus)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="reported">Reported</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="off_market">Off Market</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading properties...</div>
              ) : !propertiesData || propertiesData.properties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No properties found</div>
              ) : (
                <div className="space-y-4">
                  {propertiesData.properties.map((property) => (
                    <Card key={property.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {property.primaryImage && (
                            <img
                              src={property.primaryImage}
                              alt={property.address}
                              className="w-32 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{property.address}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {property.city}, {property.state} {property.zipCode}
                                </p>
                                <p className="text-sm text-muted-foreground">MLS: {property.mlsId}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">${property.price?.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">
                                  {property.bedrooms} bd • {property.bathrooms} ba • {property.sqft?.toLocaleString()} sqft
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(property.verificationStatus)}
                              <span className="text-xs text-muted-foreground">
                                Last seen: {new Date(property.lastSeenAt).toLocaleDateString()}
                              </span>
                            </div>

                            {property.flaggedReason && (
                              <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
                                <p className="text-sm text-orange-800">
                                  <strong>Flagged:</strong> {property.flaggedReason}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {property.verificationStatus !== "verified" && (
                                <Button size="sm" variant="outline" onClick={() => handleUnflag(property.id)}>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {property.verificationStatus !== "flagged" && (
                                <Button size="sm" variant="outline" onClick={() => handleFlag(property.id)}>
                                  <Flag className="w-4 h-4 mr-1" />
                                  Flag
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(property.id, property.address)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Property</DialogTitle>
            <DialogDescription>Provide a reason for flagging this property as inaccurate</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Property has been sold, wrong price, incorrect details..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFlagSubmit} disabled={!flagReason.trim()}>
              Flag Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
