import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAvailableLeads,
  createLead,
  getLead,
  updateLead,
  getLeadsByType,
  createLeadNotification,
  getAgentProfile,
  createAgentProfile,
} from "../db-revenue";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

export const leadsMarketplaceRouter = router({
  /**
   * GET AVAILABLE LEADS
   */
  getAvailableLeads: protectedProcedure
    .input(
      z.object({
        leadType: z.enum(["buyer", "seller", "mortgage"]),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const leads = await getAvailableLeads(input.leadType, input.limit);
        return leads;
      } catch (error) {
        console.error("[Leads] Error getting available leads:", error);
        throw error;
      }
    }),

  /**
   * GET LEAD DETAILS
   */
  getLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const lead = await getLead(input.leadId);
        if (!lead) throw new Error("Lead not found");
        return lead;
      } catch (error) {
        console.error("[Leads] Error getting lead:", error);
        throw error;
      }
    }),

  /**
   * CREATE LEAD (from form submission)
   */
  createLead: protectedProcedure
    .input(
      z.object({
        leadType: z.enum(["buyer", "seller", "mortgage"]),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        // Buyer-specific
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        timelineMonths: z.number().optional(),
        interestedPropertyId: z.number().optional(),
        // Seller-specific
        propertyAddress: z.string().optional(),
        propertyCity: z.string().optional(),
        estimatedValue: z.number().optional(),
        // Mortgage-specific
        homePrice: z.number().optional(),
        downPayment: z.number().optional(),
        interestRate: z.number().optional(),
        loanTerm: z.number().optional(),
        monthlyPayment: z.number().optional(),
        source: z.string(),
        sourcePropertyId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Analyze lead quality using LLM
        const leadAnalysis = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a real estate lead quality analyzer. Analyze the lead and provide a quality score (hot, warm, or cold) and brief reason. Return JSON with score and reason fields.",
            },
            {
              role: "user",
              content: `Analyze this lead: ${JSON.stringify(input)}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "lead_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  score: {
                    type: "string",
                    enum: ["hot", "warm", "cold"],
                    description: "Lead quality score",
                  },
                  reason: {
                    type: "string",
                    description: "Reason for the score",
                  },
                },
                required: ["score", "reason"],
                additionalProperties: false,
              },
            },
          },
        });

        const analysis = JSON.parse(
          leadAnalysis.choices[0]?.message.content || '{"score":"warm","reason":"Standard lead"}'
        );

        // Create lead
        const result = await createLead({
          leadType: input.leadType as any,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          budgetMin: input.budgetMin ? input.budgetMin.toString() : undefined,
          budgetMax: input.budgetMax ? input.budgetMax.toString() : undefined,
          timelineMonths: input.timelineMonths,
          interestedPropertyId: input.interestedPropertyId,
          propertyAddress: input.propertyAddress,
          propertyCity: input.propertyCity,
          estimatedValue: input.estimatedValue ? input.estimatedValue.toString() : undefined,
          homePrice: input.homePrice ? input.homePrice.toString() : undefined,
          downPayment: input.downPayment ? input.downPayment.toString() : undefined,
          interestRate: input.interestRate ? input.interestRate.toString() : undefined,
          loanTerm: input.loanTerm,
          monthlyPayment: input.monthlyPayment ? input.monthlyPayment.toString() : undefined,
          qualityScore: analysis.score,
          qualityReason: analysis.reason,
          status: "new",
          source: input.source,
          sourcePropertyId: input.sourcePropertyId,
        });

        await notifyOwner({
          title: "New Lead Captured",
          content: `New ${input.leadType} lead: ${input.firstName} ${input.lastName} (${input.email})`,
        });

        return {
          success: true,
          leadId: result[0]?.insertId,
        };
      } catch (error) {
        console.error("[Leads] Error creating lead:", error);
        throw error;
      }
    }),

  /**
   * UPDATE LEAD STATUS
   */
  updateLeadStatus: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        await updateLead(input.leadId, {
          status: input.status as any,
        });

        return { success: true };
      } catch (error) {
        console.error("[Leads] Error updating lead status:", error);
        throw error;
      }
    }),

  /**
   * ENRICH LEAD WITH AI
   */
  enrichLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const lead = await getLead(input.leadId);
        if (!lead) throw new Error("Lead not found");

        // Use LLM to generate insights
        const insights = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a real estate lead analyst. Provide actionable insights and next steps for this lead. Be concise and specific.",
            },
            {
              role: "user",
              content: `Analyze this lead and provide insights: ${JSON.stringify(lead)}`,
            },
          ],
        });

        const insightContent = insights.choices[0]?.message.content;
        const insightText = typeof insightContent === 'string' ? insightContent : JSON.stringify(insightContent) || "";

        // Update lead with insights
        await updateLead(input.leadId, {
          qualityReason: insightText as string,
        });

        return {
          success: true,
          insights: insightText,
        };
      } catch (error) {
        console.error("[Leads] Error enriching lead:", error);
        throw error;
      }
    }),

  /**
   * SETUP AGENT PROFILE
   */
  setupAgentProfile: protectedProcedure
    .input(
      z.object({
        companyName: z.string().optional(),
        licenseNumber: z.string().optional(),
        yearsExperience: z.number().optional(),
        bio: z.string().optional(),
        website: z.string().optional(),
        phone: z.string().optional(),
        serviceAreas: z.array(z.string()).optional(),
        specialties: z.array(z.string()).optional(),
        preferredLeadTypes: z.array(z.enum(["buyer", "seller", "mortgage"])).optional(),
        maxLeadsPerMonth: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        const existingProfile = await getAgentProfile(user.id);

        if (existingProfile) {
          // Update existing profile
          const { updateAgentProfile } = await import("../db-revenue");

          await updateAgentProfile(existingProfile.id, {
            companyName: input.companyName,
            licenseNumber: input.licenseNumber,
            yearsExperience: input.yearsExperience,
            bio: input.bio,
            website: input.website,
            phone: input.phone,
            serviceAreas: input.serviceAreas ? JSON.stringify(input.serviceAreas) : undefined,
            specialties: input.specialties ? JSON.stringify(input.specialties) : undefined,
            preferredLeadTypes: input.preferredLeadTypes
              ? JSON.stringify(input.preferredLeadTypes)
              : undefined,
            maxLeadsPerMonth: input.maxLeadsPerMonth,
          });
        } else {
          // Create new profile
          await createAgentProfile({
            userId: user.id,
            companyName: input.companyName,
            licenseNumber: input.licenseNumber,
            yearsExperience: input.yearsExperience,
            bio: input.bio,
            website: input.website,
            phone: input.phone,
            serviceAreas: input.serviceAreas ? JSON.stringify(input.serviceAreas) : undefined,
            specialties: input.specialties ? JSON.stringify(input.specialties) : undefined,
            preferredLeadTypes: input.preferredLeadTypes
              ? JSON.stringify(input.preferredLeadTypes)
              : undefined,
            maxLeadsPerMonth: input.maxLeadsPerMonth,
            subscriptionActive: false,
          });
        }

        return { success: true };
      } catch (error) {
        console.error("[Leads] Error setting up agent profile:", error);
        throw error;
      }
    }),

  /**
   * GET AGENT PROFILE
   */
  getAgentProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    if (!user) throw new Error("Not authenticated");

    try {
      const profile = await getAgentProfile(user.id);
      return profile;
    } catch (error) {
      console.error("[Leads] Error getting agent profile:", error);
      throw error;
    }
  }),

  /**
   * SEARCH LEADS
   */
  searchLeads: protectedProcedure
    .input(
      z.object({
        leadType: z.enum(["buyer", "seller", "mortgage"]),
        minBudget: z.number().optional(),
        maxBudget: z.number().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user) throw new Error("Not authenticated");

      try {
        // Get available leads and filter
        const leads = await getAvailableLeads(input.leadType, input.limit);

        // Filter by additional criteria
        let filtered = leads;

        if (input.city) {
          filtered = filtered.filter((l) => l.city?.toLowerCase().includes(input.city!.toLowerCase()));
        }

        if (input.state) {
          filtered = filtered.filter((l) => l.state === input.state);
        }

        if (input.minBudget || input.maxBudget) {
          filtered = filtered.filter((l) => {
            const budget = l.budgetMax ? parseFloat(l.budgetMax.toString()) : 0;
            if (input.minBudget && budget < input.minBudget) return false;
            if (input.maxBudget && budget > input.maxBudget) return false;
            return true;
          });
        }

        return filtered;
      } catch (error) {
        console.error("[Leads] Error searching leads:", error);
        throw error;
      }
    }),
});
