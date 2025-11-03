import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { submitLeadToGoHighLevel } from "../gohighlevel";

export const leadsRouter = router({
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
});
