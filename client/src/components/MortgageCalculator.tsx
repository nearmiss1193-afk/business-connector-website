import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Percent, Calendar, TrendingDown, Home } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice?: string | number;
  onClose?: () => void;
}

export default function MortgageCalculator({ 
  propertyPrice = '400000',
  onClose 
}: MortgageCalculatorProps) {
  const price = typeof propertyPrice === 'string' ? parseInt(propertyPrice) : propertyPrice;
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [homeInsurance, setHomeInsurance] = useState(1500);
  const [hoaFees, setHoaFees] = useState(150);

  const downPayment = (price * downPaymentPercent) / 100;
  const loanAmount = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Calculate monthly payment using mortgage formula
  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } else {
    monthlyPayment = loanAmount / numberOfPayments;
  }

  // Calculate additional costs
  const monthlyPropertyTax = (price * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyHOA = hoaFees;

  const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyHOA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownPaymentPreset = (percent: number) => {
    setDownPaymentPercent(percent);
  };

  return (
    <Card className="border-gray-200 w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Home className="w-5 h-5" />
          Mortgage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Total Monthly Payment - Prominent Display */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-600 mb-1">Estimated Monthly Payment</div>
          <div className="text-4xl font-bold text-blue-600">
            {formatCurrency(totalMonthlyPayment)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Principal, Interest, Taxes, Insurance & HOA</div>
        </div>

        {/* Home Price Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Home Price</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(price)}</span>
          </div>
        </div>

        {/* Input Controls */}
        <div className="space-y-6">
          {/* Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-gray-500" />
                Down Payment
              </label>
              <span className="text-sm font-semibold text-gray-900">
                {downPaymentPercent}% ({formatCurrency(downPayment)})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {[5, 10, 15, 20, 25].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleDownPaymentPreset(percent)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    downPaymentPercent === percent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-500" />
                Interest Rate
              </label>
              <span className="text-sm font-semibold text-gray-900">{interestRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2%</span>
              <span>12%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Loan Term
              </label>
              <span className="text-sm font-semibold text-gray-900">{loanTerm} years</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={loanTerm === 15 ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoanTerm(15)}
              >
                15 years
              </Button>
              <Button
                variant={loanTerm === 20 ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoanTerm(20)}
              >
                20 years
              </Button>
              <Button
                variant={loanTerm === 30 ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoanTerm(30)}
              >
                30 years
              </Button>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-4">Additional Costs</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Property Tax Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Tax Rate (% Annual)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={propertyTaxRate}
                  onChange={(e) => setPropertyTaxRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Monthly: {formatCurrency(monthlyPropertyTax)}</p>
              </div>

              {/* Home Insurance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Insurance ($ Annual)
                </label>
                <input
                  type="number"
                  value={homeInsurance}
                  onChange={(e) => setHomeInsurance(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Monthly: {formatCurrency(monthlyInsurance)}</p>
              </div>

              {/* HOA Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HOA Fees ($ Monthly)
                </label>
                <input
                  type="number"
                  value={hoaFees}
                  onChange={(e) => setHoaFees(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="border-t pt-4 space-y-3 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Monthly Payment Breakdown</h4>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Principal & Interest</span>
            <span className="font-semibold text-gray-900">{formatCurrency(monthlyPayment)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Property Tax</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(monthlyPropertyTax)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Home Insurance</span>
            <span className="font-semibold text-gray-900">{formatCurrency(monthlyInsurance)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">HOA Fees</span>
            <span className="font-semibold text-gray-900">{formatCurrency(monthlyHOA)}</span>
          </div>

          <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-3">
            <span className="text-gray-900">Total Monthly Payment</span>
            <span className="text-blue-600">{formatCurrency(totalMonthlyPayment)}</span>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm border border-blue-200">
          <div className="flex justify-between">
            <span className="text-gray-600">Down Payment</span>
            <span className="font-semibold">{formatCurrency(downPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loan Amount</span>
            <span className="font-semibold">{formatCurrency(loanAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Interest Paid</span>
            <span className="font-semibold">
              {formatCurrency((monthlyPayment * numberOfPayments) - loanAmount)}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          * This calculator provides estimates only. Actual payments may vary based on your credit score,
          loan type, and other factors. Consult with a mortgage professional for accurate quotes.
        </p>

        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close Calculator
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
