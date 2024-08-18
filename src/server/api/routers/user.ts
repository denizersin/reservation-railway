import { z } from "zod";

import { userUseCases } from "@/layer/use-cases/user";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { userValidator } from "@/validators/user";



export const userRouter = createTRPCRouter({
    hello: publicProcedure
        .input(z.object({ text: z.string() }))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text}`,
            };
        }),
    register: publicProcedure
        .input(userValidator.registerSchema)
        .mutation(async ({ ctx, input }) => {
            const new_Session = await userUseCases.createUser({ userData: input })
            console.log(new_Session, 'new_Session');
            return new_Session
        }),
    login: publicProcedure
        .input(userValidator.loginSchema)
        .mutation(async ({ ctx, input }) => {
            const token = await userUseCases.loginUser({ userData: input })
            return token
        }),
    getSession: protectedProcedure.query(async ({ ctx }) => {
        
        const session = await userUseCases.getSession({ headers: ctx.headers })
        return session
    }),
    
});
