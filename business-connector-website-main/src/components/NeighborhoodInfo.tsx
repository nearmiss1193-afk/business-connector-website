import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  DollarSign,
  GraduationCap,
  Home,
  TrendingUp,
  MapPin,
  Star,
  Coffee,
  ShoppingBag,
  Utensils,
} from 'lucide-react';

interface NeighborhoodInfoProps {
  city: string;
  state: string;
  zipCode: string;
}

export default function NeighborhoodInfo({ city, state, zipCode }: NeighborhoodInfoProps) {
  // Mock data - in production, this would come from an API
  const neighborhoodData = {
    population: '52,341',
    medianIncome: '$68,500',
    medianHomeValue: '$425,000',
    walkScore: 72,
    transitScore: 58,
    bikeScore: 65,
    schools: [
      { name: 'Sunshine Elementary School', rating: 8, distance: '0.5 mi', type: 'Elementary' },
      { name: 'Central Florida Middle School', rating: 7, distance: '1.2 mi', type: 'Middle' },
      { name: 'Orlando High School', rating: 9, distance: '2.1 mi', type: 'High' },
    ],
    demographics: {
      medianAge: 38,
      homeownership: 62,
      collegeDegree: 35,
      employed: 94,
    },
    nearbyPlaces: [
      { name: 'Whole Foods Market', type: 'Grocery', distance: '0.8 mi', icon: ShoppingBag },
      { name: 'Starbucks Coffee', type: 'Cafe', distance: '0.3 mi', icon: Coffee },
      { name: 'The Cheesecake Factory', type: 'Restaurant', distance: '1.1 mi', icon: Utensils },
      { name: 'Target', type: 'Shopping', distance: '1.5 mi', icon: ShoppingBag },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Neighborhood Overview */}
      <Card className="border-gray-200">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-green-600" />
            Neighborhood Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{neighborhoodData.population}</div>
              <div className="text-sm text-gray-600">Population</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {neighborhoodData.medianIncome}
              </div>
              <div className="text-sm text-gray-600">Median Income</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {neighborhoodData.medianHomeValue}
              </div>
              <div className="text-sm text-gray-600">Median Home Value</div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{neighborhoodData.demographics.employed}%</div>
              <div className="text-sm text-gray-600">Employment Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Walkability Scores */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Walkability & Transportation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Walk Score</span>
              <span className="text-lg font-bold text-blue-600">{neighborhoodData.walkScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${neighborhoodData.walkScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Very Walkable - Most errands can be accomplished on foot</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Transit Score</span>
              <span className="text-lg font-bold text-green-600">
                {neighborhoodData.transitScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${neighborhoodData.transitScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Good Transit - Many nearby public transportation options</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Bike Score</span>
              <span className="text-lg font-bold text-purple-600">{neighborhoodData.bikeScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${neighborhoodData.bikeScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Bikeable - Biking is convenient for most trips</p>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Schools */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Nearby Schools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {neighborhoodData.schools.map((school, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{school.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span>{school.type}</span>
                  <span>•</span>
                  <span>{school.distance}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-blue-700" />
                <span className="font-bold">{school.rating}/10</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Nearby Places */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Nearby Places</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {neighborhoodData.nearbyPlaces.map((place, idx) => {
              const Icon = place.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{place.name}</div>
                    <div className="text-xs text-gray-500">{place.type} • {place.distance}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Median Age</div>
              <div className="text-2xl font-bold text-gray-900">
                {neighborhoodData.demographics.medianAge} years
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Homeownership Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {neighborhoodData.demographics.homeownership}%
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">College Degree or Higher</div>
              <div className="text-2xl font-bold text-gray-900">
                {neighborhoodData.demographics.collegeDegree}%
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Employment Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {neighborhoodData.demographics.employed}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
