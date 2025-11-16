import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MortgageCalculator from './MortgageCalculator';
import { X } from 'lucide-react';

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyPrice: number;
  propertyAddress?: string;
}

export default function MortgageCalculatorModal({
  isOpen,
  onClose,
  propertyPrice,
  propertyAddress,
}: MortgageCalculatorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Mortgage Calculator</DialogTitle>
            {propertyAddress && (
              <p className="text-sm text-gray-500 mt-1">{propertyAddress}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <MortgageCalculator propertyPrice={propertyPrice} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
