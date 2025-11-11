import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { leadsRouter } from "./routers/leads";
import { propertiesRouter } from "./routers/properties";
import { mlsRouter } from "./routers/mls";
import { adminRouter } from "./routers/admin";
import { propertyReportsRouter } from "./routers/property-reports";
import { mortgageLeadsRouter } from "./routers/mortgage-leads";
import { adminAgentAdsRouter } from "./routers/admin-agent-ads";
import { agentAdsPublicRouter } from "./routers/agent-ads-public";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  leads: leadsRouter,
  properties: propertiesRouter,
  mls: mlsRouter,
  admin: adminRouter,
  propertyReports: propertyReportsRouter,
  mortgageLeads: mortgageLeadsRouter,
  adminAgentAds: adminAgentAdsRouter,
  agentAds: agentAdsPublicRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
