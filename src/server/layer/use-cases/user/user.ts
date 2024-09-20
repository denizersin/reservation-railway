import { TUser } from "@/server/db/schema/user";
import TUserValidator from "@/shared/validators/user";
import { TRPCError } from "@trpc/server";
import { jwtEntities } from "../../entities/jwt";
import { userEntities } from "../../entities/user";
import { cookies } from "next/headers";
import { jwtBody } from "../../entities/jwt/jwt";


export async function createUser({
    userData
}: {
    userData: TUserValidator.registerSchema
}): Promise<TSession> {
    const isExist = await userEntities.getUserByEmail({ email: userData.email })

    if (isExist) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User already exists',
        })
    }

    const userId = await userEntities.createUser({ userData })

    if (!userId) {
        throw new Error('User not created')
    }


    const jwtBody = await userEntities.generateJWTBody({ userId })


    const token = await jwtEntities.generateUserToken({
        jwtBody
    })

    const session: TSession = {
        user: jwtBody,
    }

    cookies().set('token', token)

    return session
}
export async function createUserByAdmin({
    userData
}: {
    userData: TUserValidator.registerSchema
}): Promise<TSession> {
    const isExist = await userEntities.getUserByEmail({ email: userData.email })

    if (isExist) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User already exists',
        })
    }

    const userId = await userEntities.createUser({ userData })

    if (!userId) {
        throw new Error('User not created')
    }

    const jwtBody = await userEntities.generateJWTBody({ userId })


    const session: TSession = {
        user: jwtBody,
    }

    return session
}

export const updateUserByAdmin = userEntities.updateUserByAdmin

export async function loginUser({
    userData
}: {
    userData: TUserValidator.loginSchema
}): Promise<TSession> {
    const user = await userEntities.getUserByEmail({ email: userData.email })


    if (!user) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User not found',
        })
    }

    if (user.password !== userData.password) {
        throw new Error('Invalid password')
    }

    const jwtBody = await userEntities.generateJWTBody({ userId: user?.id })

    const token = await jwtEntities.generateUserToken({ jwtBody })

    const session: TSession = {
        user: jwtBody
    }

    cookies().set('token', token)

    return session
}

export function logoutUser() {
    cookies().set('token', '')
    return true
}



export function getSessionUserData(
    {
        user
    }: {
        user: TUser
    }
) {
    const { password, ...userSessionData } = user
    return userSessionData
}


export const getAllUsers = userEntities.getAllUsers



export type TSession = {
    user: jwtBody
}

