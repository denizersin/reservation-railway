import { z } from "zod";

import { userUseCases } from "@/server/layer/use-cases/user";
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { userValidator } from "@/shared/validators/user";
import { cookies } from "next/headers";
import { jwtEntities } from "@/server/layer/entities/jwt";



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
            return new_Session
        }),
    login: publicProcedure
        .input(userValidator.loginSchema)
        .mutation(async ({ ctx, input }) => {
            const session = await userUseCases.loginUser({ userData: input })
            return session
        }),
    getSession: protectedProcedure.query(async ({ ctx }) => {
        const session = await jwtEntities.getServerSession()
        return session
    }),
    updateUserPreferences: publicProcedure
        .input(userValidator.updateUserPreferencesSchema)
        .mutation(async ({ input }) => {
            const updatedUserPreferences = await userUseCases.updateUserPreferences(input)
            return updatedUserPreferences
        }),
    getUserPreferences: publicProcedure.query(async ({ ctx }) => {
        const userPreferences = ctx.userPrefrences
        return userPreferences
    }),
    createUser: adminProcedure
        .input(userValidator.registerSchema)
        .mutation(async ({ input }) => {
            const session = await userUseCases.createUserByAdmin({ userData: input })
            return session
        }),
    updateUser: adminProcedure
        .input(userValidator.updateUserByAdminSchema)
        .mutation(async ({ input }) => {

            const user = await userUseCases.updateUserByAdmin({
                userData: input
            })
            return user
        }),
    getAllUsers: adminProcedure
        .input(userValidator.getAllUsersValidatorSchema)
        .query(async ({ input }) => {
            const users = await userUseCases.getAllUsers(input)
            return users
        }),

    logout: protectedProcedure.mutation(async ({ ctx }) => {
        await userUseCases.logoutUser()
        return true
    })



});
