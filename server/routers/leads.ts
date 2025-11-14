import { z } from 'zod';
import { publicProcedure, router } from "../_core/trpc";
import { submitLeadToGoHighLevel, handleFormSubmission } from "../gohighlevel";

export const leadsRouter = router({
  // Legacy agent lead submission (for existing forms)
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        brokerage: z.string().optional(),
        yearsExperience: z.string().optional(),
        currentLeadSource: z.string().optional(),
        selectedPlan: z.enum(["core", "nurture", "content"]),
        message: z.string().optional(),
        agreeToSMS: z.boolean(),
        agreeToTerms: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      // Validate consent
      if (!input.agreeToSMS || !input.agreeToTerms) {
        throw new Error("Consent required");
      }

      // Submit to GoHighLevel
      try {
        const result = await submitLeadToGoHighLevel(input);
        return { success: true, contactId: result.contactId };
      } catch (error) {
        console.error("Failed to submit lead to GoHighLevel:", error);
        throw new Error("Failed to submit application. Please try again.");
      }
    }),

  // Smart form submission (auto-detects agent vs buyer)
  submitForm: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        source: z.string().optional(),
        
        // Agent-specific fields
        brokerageName: z.string().optional(),
        yearsExperience: z.string().optional(),
        currentLeadSource: z.string().optional(),
        monthlyLeadBudget: z.string().optional(),
        interestedPackage: z.string().optional(),
        selectedPlan: z.string().optional(),
        message: z.string().optional(),
        
        // Buyer-specific fields
        propertyAddress: z.string().optional(),
        propertyPrice: z.string().optional(),
        propertyId: z.string().optional(),
        budget: z.string().optional(),
        timeline: z.string().optional(),
        preapproved: z.string().optional(),
        propertyBeds: z.string().optional(),
        propertyBaths: z.string().optional(),
        propertySqft: z.string().optional(),
        city: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await handleFormSubmission(input);
        return result;
      } catch (error: any) {
        console.error("Form submission error:", error);
        throw new Error(error.message || "Failed to submit form");
      }
    }),
});
