import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Pause, Play, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentAds() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'active' | 'paused' | 'expired' | 'rejected'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: adsData, refetch } = trpc.adminAgentAds.listAds.useQuery({
    status: selectedStatus,
    limit: 50,
    offset: 0,
  });

  const { data: inquiriesData } = trpc.adminAgentAds.listInquiries.useQuery({
    status: 'all',
    limit: 50,
    offset: 0,
  });

  const { data: analytics } = trpc.adminAgentAds.getAnalytics.useQuery({});

  const updateAd = trpc.adminAgentAds.updateAd.useMutation({
    onSuccess: () => {
      toast.success('Ad updated successfully');
      refetch();
    },
    onError: () => {
      toast.error('Failed to update ad');
    },
  });

  const deleteAd = trpc.adminAgentAds.deleteAd.useMutation({
    onSuccess: () => {
      toast.success('Ad deleted successfully');
      refetch();
    },
    onError: () => {
      toast.error('Failed to delete ad');
    },
  });

  const handleStatusChange = (adId: number, status: 'active' | 'paused') => {
    updateAd.mutate({ id: adId, status });
  };

  const handleDelete = (adId: number) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAd.mutate({ id: adId });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      paused: 'outline',
      expired: 'destructive',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Agent Advertising</h1>
          <p className="text-muted-foreground">Manage banner ads and agent inquiries</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateAdForm onSuccess={() => {
              setShowCreateDialog(false);
              refetch();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.ctr.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adsData?.ads.filter(ad => ad.status === 'active').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ads">Banner Ads</TabsTrigger>
          <TabsTrigger value="inquiries">
            Agent Inquiries
            {inquiriesData && inquiriesData.inquiries.filter(i => i.status === 'new').length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {inquiriesData.inquiries.filter(i => i.status === 'new').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Banner Ads</CardTitle>
                  <CardDescription>Manage agent banner placements</CardDescription>
                </div>
                <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ads</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adsData?.ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ad.agentName}</div>
                          <div className="text-sm text-muted-foreground">{ad.companyName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{ad.placement}</TableCell>
                      <TableCell>{getStatusBadge(ad.status)}</TableCell>
                      <TableCell>{ad.impressions?.toLocaleString() || 0}</TableCell>
                      <TableCell>{ad.clicks?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {ad.impressions && ad.impressions > 0
                          ? ((ad.clicks || 0) / ad.impressions * 100).toFixed(2) + '%'
                          : '0%'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {ad.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(ad.id, 'paused')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(ad.id, 'active')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Inquiries</CardTitle>
              <CardDescription>Agents interested in advertising (Central Florida Homes leads)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Package Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiriesData?.inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.companyName || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{inquiry.email}</div>
                          <div className="text-muted-foreground">{inquiry.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {inquiry.interestedPackage ? (
                          <Badge variant="outline">{inquiry.interestedPackage}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>
                        {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateAdForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    agentName: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    bannerImageUrl: '',
    bannerTitle: '',
    bannerDescription: '',
    ctaText: 'Contact Agent',
    ctaUrl: '',
    placement: 'sidebar' as 'sidebar' | 'between_listings' | 'property_detail' | 'all',
    position: 0,
    status: 'pending' as 'pending' | 'active' | 'paused',
  });

  const createAd = trpc.adminAgentAds.createAd.useMutation({
    onSuccess: () => {
      toast.success('Ad created successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create ad');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAd.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Banner Ad</DialogTitle>
        <DialogDescription>Add a new agent banner advertisement</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agentName">Agent Name *</Label>
          <Input
            id="agentName"
            value={formData.agentName}
            onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="bannerImageUrl">Banner Image URL *</Label>
          <Input
            id="bannerImageUrl"
            type="url"
            value={formData.bannerImageUrl}
            onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
            placeholder="https://example.com/banner.jpg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placement">Placement *</Label>
          <Select
            value={formData.placement}
            onValueChange={(value: any) => setFormData({ ...formData, placement: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sidebar">Sidebar</SelectItem>
              <SelectItem value="between_listings">Between Listings</SelectItem>
              <SelectItem value="property_detail">Property Detail</SelectItem>
              <SelectItem value="all">All Placements</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={createAd.isPending}>
          {createAd.isPending ? 'Creating...' : 'Create Ad'}
        </Button>
      </div>
    </form>
  );
}
