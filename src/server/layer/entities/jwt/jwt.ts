import { env } from "@/env"
import { TUser } from "@/server/db/schema/user"
import { JWT_EXPIRY_DAYS } from "@/server/utils/server-utils"
import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers';
import { TSession } from "../../use-cases/user/user";
import { EnumCookieName } from "@/server/utils/server-constants";

export type jwtBody = {
    userId: number;
    userRole: TUser['role'];
    restaurantId?: number;
}


const secretKey = new TextEncoder().encode(env.JWT_SECRET)

export const generateUserToken = async ({
    jwtBody
}: {
    jwtBody: jwtBody
}): Promise<string> => {
    const token = await new SignJWT(jwtBody)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(`${JWT_EXPIRY_DAYS}d`)
        .sign(secretKey)
    return token
}



export const verifyUserToken = async ({
    token
}: {
    token: string
}): Promise<jwtBody> => {
    const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256'],
    })
    return payload as jwtBody
}

export const getJwtBody = async ({
    token
}: {
    token: string
}): Promise<jwtBody | null> => {
    try {
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ['HS256'],
        })
        return payload as jwtBody
    } catch (err) {
        console.error('JWT verification failed:', err)
        return null
    }
}



export const getServerSession = async (): Promise<TSession | null> => {

    const cookieStore = cookies();
    const token = cookieStore.get(EnumCookieName.TOKEN)?.value ?? "";


    try {
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ['HS256'],
        })
        return {
            user: payload as jwtBody
        }
    } catch (err) {
        console.error('JWT verification failed:', err)
        return null
    }
}

