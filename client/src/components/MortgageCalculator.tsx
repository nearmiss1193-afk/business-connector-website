import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Percent, Calendar, TrendingDown } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice: string;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const price = parseInt(propertyPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const downPayment = (price * downPaymentPercent) / 100;
  const loanAmount = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Calculate monthly payment using mortgage formula
  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  // Estimate property tax (1.2% annually in Florida)
  const monthlyPropertyTax = (price * 0.012) / 12;

  // Estimate home insurance ($1,500 annually average in Florida)
  const monthlyInsurance = 1500 / 12;

  // Estimate HOA (if applicable)
  const monthlyHOA = 150;

  const totalMonthlyPayment = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyHOA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Mortgage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Total Monthly Payment */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Estimated Monthly Payment</div>
          <div className="text-4xl font-bold text-blue-600">
            {formatCurrency(totalMonthlyPayment)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Principal & Interest, Taxes, Insurance, HOA</div>
        </div>

        {/* Input Controls */}
        <div className="space-y-4">
          {/* Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-2">
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
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-500" />
                Interest Rate
              </label>
              <span className="text-sm font-semibold text-gray-900">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3%</span>
              <span>10%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <div className="flex items-center justify-between mb-2">
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
                variant={loanTerm === 30 ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoanTerm(30)}
              >
                30 years
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="border-t pt-4 space-y-3">
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

          <div className="flex justify-between text-base font-bold border-t pt-3">
            <span className="text-gray-900">Total Monthly Payment</span>
            <span className="text-blue-600">{formatCurrency(totalMonthlyPayment)}</span>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Home Price</span>
            <span className="font-semibold">{formatCurrency(price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Down Payment</span>
            <span className="font-semibold">{formatCurrency(downPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loan Amount</span>
            <span className="font-semibold">{formatCurrency(loanAmount)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          * This calculator provides estimates only. Actual payments may vary based on your credit score,
          loan type, and other factors. Consult with a mortgage professional for accurate quotes.
        </p>
      </CardContent>
    </Card>
  );
}
