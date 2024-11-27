/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { jwtEntities } from "../layer/entities/jwt";
import { cookies } from "next/headers";
import { EnumHeader, EnumLanguage, EnumTheme } from "@/shared/enums/predefined-enums";
import { TUserPreferences } from "../layer/use-cases/user/user";
import { db } from "../db";
import { userUseCases } from "../layer/use-cases/user";
import { DEFAULT_LANGUAGE_DATA, languagesData } from "@/shared/data/predefined";
import { EnumCookieName } from "../utils/server-constants";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await jwtEntities.getServerSession()

  const language = (cookies().get(EnumCookieName.LANGUAGE)?.value) as EnumLanguage | undefined
  const languageData = languagesData.find(l => l.languageCode === language)



  const userPrefrences: TUserPreferences = {
    theme: EnumTheme.light,
    language: DEFAULT_LANGUAGE_DATA
  }

  if (language && languageData) {
    userPrefrences.language = languageData
  } else {
    userUseCases.updateUserPreferences({ language: DEFAULT_LANGUAGE_DATA.languageCode })
  }

  const restaurantId = session?.user.restaurantId
  // const toast = {
  //   message: ''
  // }
  // const toastOptions = {
  //   toast,
  //   setToast: (message: string) => {
  //     toast.message = message
  //   }
  // }



  return {
    session,
    userPrefrences,
    restaurantId,
    ...opts,
  };
};

export type TCtx = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ ctx, error, shape }) {
    shape.data.code
    return {
      ...shape,
      data: {
        ...shape.data,
        //here will be inferrable error shape from client error
        zodError:
          // error.code === 'BAD_REQUEST' && 
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  }
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) => {

  return next({
    ctx
  })
});


export const clientProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) => {

  const restaurantIdContext = ctx.restaurantId
  const restaurantId = ctx.headers.get(EnumHeader.RESTAURANT_ID);

  if ( !restaurantIdContext && !restaurantId ) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Restaurant id header is required" });
  }




  return next({
    ctx: {
      ...ctx,
      restaurantId: restaurantIdContext || Number(restaurantId),
    }
  })
});


export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });


export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || ctx.session.user.userRole !== 'admin') {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });


export const ownerProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || ctx.session.user.userRole !== 'owner') {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        ...ctx,
        restaurantId: ctx.session.user.restaurantId!,
        // infers the `session` as non-nullable
        session: {
          user: {
            ...ctx.session.user,
            restaurantId: ctx.session.user.restaurantId!,
          },
        },
      },
    });
  });





export type TPublicProcedureCtx = Parameters<Parameters<(typeof publicProcedure)['query']>[0]>[0]['ctx']
export type TProtectedProcedureCtx = Parameters<Parameters<(typeof protectedProcedure)['query']>[0]>[0]['ctx']
export type TAdminProcedureCtx = Parameters<Parameters<(typeof adminProcedure)['query']>[0]>[0]['ctx']
export type TOwnerProcedureCtx = Parameters<Parameters<(typeof ownerProcedure)['query']>[0]>[0]['ctx']
export type TClientProcedureCtx = Parameters<Parameters<(typeof clientProcedure)['query']>[0]>[0]['ctx']
