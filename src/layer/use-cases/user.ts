import TUserValidator from "@/validators/user";
import { userEntities } from "../entities/user/user";
import { jwtEntities } from "../entities/jwt/jwt";
import { TUser } from "@/server/db/schema/user";
import { TRPCError } from "@trpc/server";   

async function createUser({
    userData
}: {
    userData: TUserValidator.RegisterInput
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

    const user = await userEntities.getUserById({ userId }) as TUser

    const token = jwtEntities.generateUserToken({ jwtBody: { userId } })

    const sessionUserData = getSessionUserData({ user })
    const session: TSession = {
        user: sessionUserData,
        token
    }

    return session
}

async function loginUser({
    userData
}: {
    userData: TUserValidator.LoginInput
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

    const token = jwtEntities.generateUserToken({ jwtBody: { userId: user.id } })

    const session: TSession = {
        user: getSessionUserData({ user }),
        token
    }
    return session
}


async function getSession({
    headers
}: {
    headers: Headers
}): Promise<TSession | null> {

    try {
        const token = headers.get('Authorization')?.split(' ')[1]

        if (!token) {
            return null
        }
        const jwtBody = jwtEntities.verifyUserToken({ token })

        const user = await userEntities.getUserById({ userId: jwtBody.userId })

        if (!user) {
            return null
        }

        const { password, ...userData } = user


        return {
            user: userData,
            token
        }
    }
    catch (error) {
        return null
    }

}

function getSessionUserData(
    {
        user
    }: {
        user: TUser
    }
) {
    const { password, ...userSessionData } = user
    return userSessionData
}


export const userUseCases = {
    createUser,
    loginUser,
    getSession
}

export type TSession = {
    user: Omit<TUser, 'password'>,
    token: string
}

