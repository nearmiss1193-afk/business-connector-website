import LeadContactForm from "@/components/LeadContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Get in Touch</h1>
          <p className="text-blue-100">
            Have questions? We're here to help. Contact us today and let's find your perfect property.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Call us during business hours</p>
              <p className="text-lg font-semibold text-blue-600 mt-2">+1 (863) 320-3921</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Send us an email</p>
              <p className="text-sm font-semibold text-blue-600 mt-2">info@centralfloridahomes.example</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Central Florida</p>
              <p className="text-sm font-semibold text-blue-600 mt-2">Orlando, FL 32801</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto">
          <LeadContactForm />
        </div>
      </div>
    </div>
  );
}
