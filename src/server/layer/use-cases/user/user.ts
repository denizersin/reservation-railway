import { TUser } from "@/server/db/schema/user";
import TUserValidator from "@/shared/validators/user";
import { TRPCError } from "@trpc/server";
import { jwtEntities } from "../../entities/jwt";
import { userEntities } from "../../entities/user";
import { cookies } from "next/headers";
import { jwtBody } from "../../entities/jwt/jwt";
import { EnumLanguage, EnumTheme } from "@/shared/enums/predefined-enums";
import { TLanguage } from "@/server/db/schema/predefined";
import { revalidatePath } from "next/cache";
import { DEFAULT_LANGUAGE, languagesData } from "@/shared/data/predefined";


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
    cookies().delete('token')
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


export const updateUserPreferences =  ({
    language,
    theme
}: TUserValidator.updateUserPreferencesSchema) => {
    if (language) {
        const languageData = languagesData.find(l => l.languageCode === language)
        if (languageData) {
            cookies().set('language', language)
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid language',
            })
        }
    }
}


export const getUserPreferences = () => {
    const language = (cookies().get('language')?.value) as EnumLanguage | undefined
    const languageData = languagesData.find(l => l.languageCode === language)

    const userPrefrences: TUserPreferences = {
        theme: EnumTheme.light,
        language: DEFAULT_LANGUAGE
    }
    if (language && languageData) {
        userPrefrences.language = languageData
    } else {
        cookies().set('language', DEFAULT_LANGUAGE.languageCode)
        revalidatePath('/')
    }
    return userPrefrences
}


export const getAllUsers = userEntities.getAllUsers



export type TSession = {
    user: jwtBody
}
export type TSessionWithRestaurat = {
    user: jwtBody & {
        restaurantId: number
    }
}

export type TUserPreferences = {
    theme: EnumTheme,
    language: TLanguage
}