/**
 * Careers Page
 * Job listings and company culture
 */

import { Briefcase, MapPin, Clock, DollarSign, Users, Zap, Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';
import { APP_TITLE } from '@/const';

interface JobListing {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
}

export default function Careers() {
  const benefits = [
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: 'Health & Wellness',
      description: 'Comprehensive health, dental, and vision insurance plus wellness programs.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: 'Career Growth',
      description: 'Professional development opportunities, training programs, and clear career paths.',
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: 'Work-Life Balance',
      description: 'Flexible schedules, remote work options, and generous PTO.',
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: 'Innovation',
      description: 'Work with cutting-edge technology and contribute to industry-leading products.',
    },
  ];

  const openPositions: JobListing[] = [
    {
      id: 1,
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Clermont, FL / Remote',
      type: 'Full-time',
      salary: '$120K - $160K',
      description: 'Build and scale our real estate platform using React, Node.js, and modern web technologies.',
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Tampa, FL / Hybrid',
      type: 'Full-time',
      salary: '$110K - $140K',
      description: 'Lead product strategy and roadmap for our property search and recommendation features.',
    },
    {
      id: 3,
      title: 'Data Scientist',
      department: 'Data & Analytics',
      location: 'Orlando, FL / Remote',
      type: 'Full-time',
      salary: '$130K - $170K',
      description: 'Develop machine learning models for home value estimation and market predictions.',
    },
    {
      id: 4,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$90K - $120K',
      description: 'Create beautiful, intuitive user experiences for buyers, sellers, and agents.',
    },
    {
      id: 5,
      title: 'Real Estate Operations Manager',
      department: 'Operations',
      location: 'Lakeland, FL',
      type: 'Full-time',
      salary: '$80K - $100K',
      description: 'Manage relationships with agents, brokers, and MLS providers across Central Florida.',
    },
    {
      id: 6,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Tampa, FL / Hybrid',
      type: 'Full-time',
      salary: '$85K - $110K',
      description: 'Drive growth through digital marketing, content strategy, and brand development.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">
            Join Our Team
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Help us transform the real estate experience for millions of people across Central Florida
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
            View Open Positions
          </Button>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why Work at {APP_TITLE}?
          </h2>
          <p className="text-xl text-gray-600">
            We're building the future of real estate technology, and we want you to be part of it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-white py-16">
        <div className="container">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Open Positions
          </h2>

          <div className="max-w-5xl mx-auto space-y-6">
            {openPositions.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm">{job.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{job.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-semibold">{job.salary}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {job.description}
                      </p>
                    </div>
                    <Button className="ml-4 bg-blue-600 hover:bg-blue-700">
                      Apply Now
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{job.department}</Badge>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see a position that fits? We're always looking for talented people.
            </p>
            <Button variant="outline" size="lg">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Culture Section */}
      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Users className="w-12 h-12 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900">Our Culture</h2>
          </div>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              At {APP_TITLE}, we believe that great products are built by great teams. We foster a culture of collaboration, innovation, and continuous learning where everyone's ideas are valued.
            </p>
            <p>
              We're a diverse team of engineers, designers, product managers, and real estate experts who are passionate about using technology to solve real problems. Whether you're working remotely or in one of our offices, you'll find a supportive environment that encourages growth and creativity.
            </p>
            <p>
              We celebrate wins together, learn from challenges, and always keep our users at the center of everything we do. If you're excited about making a real impact in the real estate industry, we'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explore our open positions and join our team today
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
            <Briefcase className="w-5 h-5 mr-2" />
            View All Jobs
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
