/**
 * Research & Blog Page
 * Housing trends, market reports, and industry insights
 */

import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, Home } from 'lucide-react';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';

interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  featured: boolean;
}

export default function Research() {
  const featuredPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Central Florida: CPI Shelter Forecast, October 2025',
      category: 'MARKET TRENDS, NEWS, RENTING',
      date: 'October 15, 2025',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      excerpt: 'Our latest forecast for shelter costs in Central Florida shows continued moderation in rent growth as inventory levels normalize across the region.',
      featured: true,
    },
    {
      id: 2,
      title: 'Buyers: Results from the Central Florida Consumer Housing Trends Report 2025',
      category: 'HOUSING TRENDS REPORT, MARKET TRENDS',
      date: 'October 10, 2025',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
      excerpt: 'Discover what motivates buyers in today\'s Central Florida market, including affordability concerns, preferred home features, and financing trends.',
      featured: true,
    },
    {
      id: 3,
      title: 'Sellers: Results from the Central Florida Consumer Housing Trends Report 2025',
      category: 'HOUSING TRENDS REPORT, MARKET TRENDS',
      date: 'October 10, 2025',
      image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop',
      excerpt: 'Understand seller sentiment, pricing strategies, and market timing decisions based on our comprehensive survey of Central Florida homeowners.',
      featured: true,
    },
  ];

  const recentPosts: BlogPost[] = [
    {
      id: 4,
      title: 'Home Value and Home Sales Forecast (October 2025)',
      category: 'MARKET TRENDS',
      date: 'October 5, 2025',
      image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=300&fit=crop',
      excerpt: 'Our monthly forecast for home values and sales volume across Central Florida markets.',
      featured: false,
    },
    {
      id: 5,
      title: 'Mortgage Rates Drift Lower During Government Data Blackout',
      category: 'MORTGAGE RATES',
      date: 'October 3, 2025',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      excerpt: 'Analysis of recent mortgage rate trends and their impact on buyer affordability in the region.',
      featured: false,
    },
    {
      id: 6,
      title: 'First-Time Homebuyer Guide for Central Florida',
      category: 'HOMEBUYERS',
      date: 'September 28, 2025',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      excerpt: 'Everything first-time buyers need to know about purchasing a home in Central Florida.',
      featured: false,
    },
    {
      id: 7,
      title: 'Investment Property Trends in Tampa Bay',
      category: 'MARKET TRENDS',
      date: 'September 25, 2025',
      image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=300&fit=crop',
      excerpt: 'Analyzing rental yields, appreciation rates, and investor activity in the Tampa Bay market.',
      featured: false,
    },
    {
      id: 8,
      title: 'Orlando Housing Market: Q3 2025 Review',
      category: 'MARKET TRENDS',
      date: 'September 20, 2025',
      image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=400&h=300&fit=crop',
      excerpt: 'A comprehensive look at Orlando\'s housing market performance in the third quarter of 2025.',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container">
          <h1 className="text-5xl font-bold mb-4">
            Research & Market Insights
          </h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Stay informed with the latest housing trends, market forecasts, and data-driven insights for Central Florida real estate.
          </p>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Reports</h2>
          <Link href="/research/featured">
            <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View All →
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {featuredPosts.map((post) => (
            <Link key={post.id} href={`/research/${post.id}`}>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide mb-3">
                    <TrendingUp className="w-3 h-3" />
                    {post.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Read More Button */}
        <div className="text-center mb-16">
          <Link href="/research/featured">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
              Read more
            </button>
          </Link>
        </div>

        {/* Recent Posts Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button className="pb-4 border-b-2 border-blue-600 text-blue-600 font-semibold">
              FEATURED
            </button>
            <button className="pb-4 text-gray-600 hover:text-gray-900 font-semibold">
              RECENT
            </button>
          </div>
        </div>

        {/* Recent Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/research/${post.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex">
                  <div className="w-48 h-32 flex-shrink-0 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      {post.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to stay updated?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Subscribe to our newsletter for the latest market insights and trends
          </p>
          <Link href="/subscribe">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
              Subscribe Now
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
