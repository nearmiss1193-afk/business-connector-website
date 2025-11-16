import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentBreakdownProps {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTaxRate?: number; // Annual property tax as % of home value
  insuranceMonthly?: number; // Monthly homeowners insurance
  hoaMonthly?: number; // Monthly HOA fees
}

interface BreakdownDetails {
  principal: number;
  interest: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  total: number;
}

export default function PaymentBreakdown({
  homePrice,
  downPayment,
  interestRate,
  loanTerm,
  propertyTaxRate = 0.012, // Default 1.2% annual property tax
  insuranceMonthly = 150,
  hoaMonthly = 0,
}: PaymentBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate mortgage payment breakdown
  const calculatePaymentBreakdown = (): BreakdownDetails => {
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Calculate principal + interest using standard mortgage formula
    let principalAndInterest = 0;
    if (monthlyRate === 0) {
      principalAndInterest = loanAmount / numberOfPayments;
    } else {
      principalAndInterest =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    // For simplicity, we'll calculate an average principal payment
    // In reality, principal increases over time and interest decreases
    const totalInterest = principalAndInterest * numberOfPayments - loanAmount;
    const averagePrincipal = loanAmount / numberOfPayments;
    const averageInterest = totalInterest / numberOfPayments;

    // Calculate property tax (annual / 12)
    const monthlyPropertyTax = (homePrice * propertyTaxRate) / 12;

    // Calculate total
    const total = principalAndInterest + monthlyPropertyTax + insuranceMonthly + hoaMonthly;

    return {
      principal: averagePrincipal,
      interest: averageInterest,
      propertyTax: monthlyPropertyTax,
      insurance: insuranceMonthly,
      hoa: hoaMonthly,
      total,
    };
  };

  const breakdown = calculatePaymentBreakdown();

  // Calculate percentages for visualization
  const getPercentage = (amount: number) => {
    return ((amount / breakdown.total) * 100).toFixed(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const breakdownItems = [
    {
      label: 'Principal & Interest',
      amount: breakdown.principal + breakdown.interest,
      color: 'bg-blue-500',
      icon: '🏠',
    },
    {
      label: 'Property Tax',
      amount: breakdown.propertyTax,
      color: 'bg-amber-500',
      icon: '📋',
    },
    {
      label: 'Homeowners Insurance',
      amount: breakdown.insurance,
      color: 'bg-green-500',
      icon: '🛡️',
    },
    ...(breakdown.hoa > 0
      ? [
          {
            label: 'HOA Fees',
            amount: breakdown.hoa,
            color: 'bg-purple-500',
            icon: '🏘️',
          },
        ]
      : []),
  ];

  return (
    <div className="w-full space-y-4">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">Payment Breakdown</h3>
          <p className="text-sm text-gray-500">See what makes up your monthly payment</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
          {/* Visual Bar Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Monthly Payment Composition</h4>
            <div className="flex h-12 rounded-lg overflow-hidden gap-1 bg-gray-100">
              {breakdownItems.map((item, index) => (
                <div
                  key={index}
                  className={`${item.color} transition-all hover:opacity-80 cursor-pointer relative group`}
                  style={{ width: `${getPercentage(item.amount)}%` }}
                  title={`${item.label}: ${formatCurrency(item.amount)} (${getPercentage(item.amount)}%)`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {item.label}: {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Breakdown Items */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 mt-4">Breakdown Details</h4>
            {breakdownItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{getPercentage(item.amount)}% of total</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
              <p className="font-semibold text-gray-900">Total Monthly Payment</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(breakdown.total)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p>
              <strong>Note:</strong> This breakdown shows average principal and interest. Early payments are mostly interest, while later payments are mostly principal.
            </p>
            <p>
              Property tax rate assumed at {(propertyTaxRate * 100).toFixed(2)}% annually. Actual rates vary by location.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
