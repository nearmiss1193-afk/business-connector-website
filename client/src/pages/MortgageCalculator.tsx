import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import PaymentBreakdown from '@/components/PaymentBreakdown';
import MortgageLeadModal from '@/components/MortgageLeadModal';
import Footer from '@/components/Footer';
import TopNavigation from '@/components/TopNavigation';
import { DollarSign, Percent, Calendar, Home } from 'lucide-react';

export default function MortgageCalculator() {
  // Form inputs
  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTerm, setLoanTerm] = useState('30');
  const [propertyTaxRate, setPropertyTaxRate] = useState('1.2');
  const [insuranceMonthly, setInsuranceMonthly] = useState('150');
  const [hoaMonthly, setHoaMonthly] = useState('0');
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const home = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const term = parseInt(loanTerm) || 30;

    const loanAmount = home - down;
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;

    let principalAndInterest = 0;
    if (monthlyRate === 0) {
      principalAndInterest = loanAmount / numberOfPayments;
    } else {
      principalAndInterest =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const taxRate = parseFloat(propertyTaxRate) || 0;
    const monthlyPropertyTax = (home * taxRate) / 100 / 12;
    const insurance = parseFloat(insuranceMonthly) || 0;
    const hoa = parseFloat(hoaMonthly) || 0;

    const total = principalAndInterest + monthlyPropertyTax + insurance + hoa;

    return {
      principalAndInterest,
      monthlyPropertyTax,
      insurance,
      hoa,
      total,
    };
  };

  const payment = calculateMonthlyPayment();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: string) => {
    return parseInt(value).toLocaleString();
  };

  // Handle down payment percentage calculation
  const handleDownPaymentPercentage = (percentage: number) => {
    const home = parseFloat(homePrice) || 0;
    const down = (home * percentage) / 100;
    setDownPayment(down.toString());
  };

  const downPaymentPercentage = ((parseFloat(downPayment) / parseFloat(homePrice)) * 100).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNavigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Mortgage Calculator</h1>
          <p className="text-xl text-blue-100">
            Calculate your monthly payment and see a detailed breakdown of your costs
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Home Price */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Home Price
                  </Label>
                  <Input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    placeholder="400000"
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-gray-500 mt-1">{formatNumber(homePrice)}</p>
                </div>

                {/* Down Payment */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Down Payment ({downPaymentPercentage}%)
                  </Label>
                  <Input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="80000"
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-gray-500 mt-1">{formatNumber(downPayment)}</p>

                  {/* Quick Down Payment Buttons */}
                  <div className="flex gap-2 mt-3">
                    {[5, 10, 15, 20].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => handleDownPaymentPercentage(percent)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded transition-colors"
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4" />
                    Interest Rate (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="7.0"
                    className="text-lg font-semibold"
                  />
                  <Slider
                    value={[parseFloat(interestRate)]}
                    onValueChange={(value) => setInterestRate(value[0].toFixed(1))}
                    min={2}
                    max={12}
                    step={0.1}
                    className="mt-3"
                  />
                </div>

                {/* Loan Term */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Loan Term (Years)
                  </Label>
                  <div className="flex gap-2">
                    {[15, 20, 30].map((term) => (
                      <button
                        key={term}
                        onClick={() => setLoanTerm(term.toString())}
                        className={`flex-1 py-2 rounded font-semibold transition-colors ${
                          loanTerm === term.toString()
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {term} yrs
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Tax Rate */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4" />
                    Annual Property Tax Rate (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={propertyTaxRate}
                    onChange={(e) => setPropertyTaxRate(e.target.value)}
                    placeholder="1.2"
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Monthly: {formatCurrency((parseFloat(homePrice) * parseFloat(propertyTaxRate)) / 100 / 12)}
                  </p>
                </div>

                {/* Homeowners Insurance */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Monthly Homeowners Insurance
                  </Label>
                  <Input
                    type="number"
                    value={insuranceMonthly}
                    onChange={(e) => setInsuranceMonthly(e.target.value)}
                    placeholder="150"
                    className="text-lg font-semibold"
                  />
                </div>

                {/* HOA Fees */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Monthly HOA Fees (Optional)
                  </Label>
                  <Input
                    type="number"
                    value={hoaMonthly}
                    onChange={(e) => setHoaMonthly(e.target.value)}
                    placeholder="0"
                    className="text-lg font-semibold"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Monthly Payment Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Estimated Monthly Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-5xl font-bold text-blue-600">
                  {formatCurrency(payment.total)}
                </div>

                {/* Quick Summary */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                  <div>
                    <p className="text-sm text-blue-700 font-semibold">Loan Amount</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(parseFloat(homePrice) - parseFloat(downPayment))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-semibold">Home Price</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(parseFloat(homePrice))}</p>
                  </div>
                </div>

                {/* Get Pre-Approved Button */}
                <Button
                  onClick={() => setShowLeadModal(true)}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg mt-6"
                >
                  Get Pre-Approved
                </Button>
              </CardContent>
            </Card>

            {/* Payment Breakdown */}
            <PaymentBreakdown
              homePrice={parseFloat(homePrice)}
              downPayment={parseFloat(downPayment)}
              interestRate={parseFloat(interestRate)}
              loanTerm={parseInt(loanTerm)}
              propertyTaxRate={parseFloat(propertyTaxRate) / 100}
              insuranceMonthly={parseFloat(insuranceMonthly)}
              hoaMonthly={parseFloat(hoaMonthly)}
            />
          </div>
        </div>
      </div>

      {/* Lead Modal */}
      <MortgageLeadModal
        open={showLeadModal}
        onOpenChange={setShowLeadModal}
        mortgageData={{
          homePrice,
          downPayment,
          interestRate,
          loanTerm,
          monthlyPayment: payment.total,
        }}
      />

      <Footer />
    </div>
  );
}
