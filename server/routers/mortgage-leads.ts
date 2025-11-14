import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { handleFormSubmission } from '../gohighlevel';

export const mortgageLeadsRouter = router({
  submitMortgageLead: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        homePrice: z.string(),
        downPayment: z.string(),
        interestRate: z.string(),
        loanTerm: z.string(),
        monthlyPayment: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Split name into first and last
      const nameParts = input.name.trim().split(' ');
      const firstName = nameParts[0] || input.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Submit to GoHighLevel
      const result = await handleFormSubmission({
        firstName,
        lastName,
        email: input.email,
        phone: input.phone,
        homePrice: input.homePrice,
        downPayment: input.downPayment,
        interestRate: input.interestRate,
        loanTerm: input.loanTerm,
        monthlyPayment: input.monthlyPayment,
        source: 'centralfloridahomes.com - Mortgage Calculator',
      });

      return {
        success: result.success,
        message: result.success ? 'Mortgage lead submitted successfully' : 'Lead submitted but GoHighLevel integration not available',
      };
    }),
});
