import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { guestRouter } from "./routers/guest";
import { languageRouter } from "./routers/language";
import { paymentRouter } from "./routers/payment";
import { predefinedRouter } from "./routers/predefined";
import { reservationRouter } from "./routers/reservation";
import { restaurantRouter } from "./routers/restaurant";
import { restaurantSettingRouter } from "./routers/restaurant-setting";
import { roomRouter } from "./routers/room";
import { testRouter } from "./routers/test";
import { waitlistRouter } from "./routers/waitlist";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  restaurant: restaurantRouter,
  predefiend: predefinedRouter,
  reservation: reservationRouter,
  language: languageRouter,
  room: roomRouter,
  guest: guestRouter,
  test: testRouter,
  waitlist: waitlistRouter,
  restaurantSetting: restaurantSettingRouter,
  payment: paymentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

