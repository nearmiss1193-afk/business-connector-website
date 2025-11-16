/**
 * Lead Scoring Dashboard
 * Comprehensive analytics dashboard for tracking property performance and lead metrics
 */

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Home, Users, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  hot: '#ef4444',
  warm: '#f97316',
  cold: '#3b82f6',
  very_hot: '#dc2626',
};

export default function LeadScoringDashboard() {
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Fetch dashboard data
  const { data: summary, isLoading: summaryLoading } = trpc.analytics.getDashboardSummary.useQuery();
  const { data: topProperties, isLoading: topLoading } = trpc.analytics.getTopProperties.useQuery({
    limit: 10,
    city: selectedCity || undefined,
  });
  const { data: importRates } = trpc.analytics.getImportSuccessRates.useQuery({ days: timeRange });
  const { data: hotMarkets } = trpc.analytics.getHotMarkets.useQuery({ limit: 10 });
  const { data: dailyMetrics } = trpc.analytics.getDailyMetricsSummary.useQuery({ days: timeRange });
  const { data: qualityDistribution } = trpc.analytics.getLeadQualityDistribution.useQuery({ days: timeRange });
  const { data: conversionFunnel } = trpc.analytics.getConversionFunnel.useQuery({ days: timeRange });
  const { data: alerts } = trpc.analytics.getAlerts.useQuery({ limit: 10 });

  // Transform data for charts
  const dailyMetricsChart = useMemo(() => {
    return dailyMetrics?.map((metric: any) => ({
      date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leads: metric.totalLeads,
      conversions: metric.totalConversions,
      imported: metric.propertiesImported,
    })) || [];
  }, [dailyMetrics]);

  const qualityChart = useMemo(() => {
    return qualityDistribution?.map((item: any) => ({
      name: item.quality.charAt(0).toUpperCase() + item.quality.slice(1),
      value: item.count,
      avgScore: item.avgScore,
    })) || [];
  }, [qualityDistribution]);

  const conversionChart = useMemo(() => {
    return conversionFunnel?.map((item: any) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      percentage: item.percentage,
    })) || [];
  }, [conversionFunnel]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Lead Scoring Dashboard</h1>
            <p className="text-muted-foreground">Track property performance and monitor lead metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[30, 60, 90].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(days as 30 | 60 | 90)}
            >
              {days} Days
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        {summaryLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.today?.totalLeads || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Real-time lead count</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.today?.totalConversions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Qualified leads</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Imports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{summary?.today?.propertiesImported || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Properties added</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {summary?.topProperty?.leadScore.toFixed(1) || '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lead score</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Charts */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="quality">Lead Quality</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="imports">Imports</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Leads & Conversions</CardTitle>
                <CardDescription>Trend over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyMetricsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" name="Leads" />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
                    <Line type="monotone" dataKey="imported" stroke="#f59e0b" name="Imported" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Properties Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Properties</CardTitle>
                <CardDescription>Ranked by lead score</CardDescription>
              </CardHeader>
              <CardContent>
                {topLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Rank</th>
                          <th className="text-left py-2 px-2">Property ID</th>
                          <th className="text-right py-2 px-2">Lead Score</th>
                          <th className="text-right py-2 px-2">Views</th>
                          <th className="text-right py-2 px-2">Leads</th>
                          <th className="text-right py-2 px-2">Conversions</th>
                          <th className="text-right py-2 px-2">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProperties?.map((prop: any, idx: number) => (
                          <tr key={prop.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 font-medium">#{idx + 1}</td>
                            <td className="py-2 px-2">{prop.propertyId}</td>
                            <td className="py-2 px-2 text-right font-bold">{prop.leadScore.toFixed(1)}</td>
                            <td className="py-2 px-2 text-right">{prop.totalViews}</td>
                            <td className="py-2 px-2 text-right">{prop.totalLeads}</td>
                            <td className="py-2 px-2 text-right">{prop.totalConversions}</td>
                            <td className="py-2 px-2 text-right">{prop.leadToConversionRate.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lead Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={qualityChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {qualityChart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={conversionChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hot Markets</CardTitle>
                <CardDescription>Markets ranked by heat score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hotMarkets?.map((market: any) => (
                    <div key={`${market.city}-${market.state}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium">{market.city}, {market.state}</div>
                        <div className="text-sm text-muted-foreground">
                          {market.totalLeads} leads • {market.leadsPerProperty.toFixed(1)} per property
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={market.marketHeat === 'very_hot' ? 'destructive' : 'secondary'}>
                          {market.marketHeat.toUpperCase()}
                        </Badge>
                        <div className="text-right">
                          <div className="font-bold text-lg">{market.heatScore.toFixed(0)}</div>
                          <div className="text-xs text-muted-foreground">Heat Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imports Tab */}
          <TabsContent value="imports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Success Rates</CardTitle>
                <CardDescription>Last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importRates?.map((rate: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium capitalize">{rate.importType}</div>
                          <div className="text-sm text-muted-foreground">{rate.location}</div>
                        </div>
                        <Badge variant="outline">{rate.avgSuccessRate.toFixed(1)}%</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Imports</div>
                          <div className="font-bold">{rate.totalImports}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Properties</div>
                          <div className="font-bold">{rate.totalPropertiesImported}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Failed</div>
                          <div className="font-bold text-red-500">{rate.totalFailed}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-start gap-3 p-2 bg-white rounded border border-yellow-200">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">{alert.message}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
