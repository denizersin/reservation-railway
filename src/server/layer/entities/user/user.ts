import { env } from "@/env";
import { db } from "@/server/db";
import { tblRefreshToken, tblUser, TUserInsert } from "@/server/db/schema/user";
import { REFRESH_TOKEN_EXPIRY_DAYS } from "@/server/utils/server-utils";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";



async function createUser({
    userData,
}: {
    userData: TUserInsert,
}) {
    const result = await db.insert(tblUser).values(userData).$returningId()
    return result[0]?.id
}

async function createNewRefreshToken({
    userId
}: {
    userId: number
}) {
    const refreshToken = jwt.sign({ userId: userId }, env.JWT_SECRET, {
        expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    })
    await db.insert(tblRefreshToken).values({
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        token: refreshToken,
        userId,
    })
}

async function getUserById({
    userId
}: {
    userId: number
}) {
    const user = await db.query.tblUser.findFirst({
        where: eq(tblUser.id, userId)
    })
    return user
}

async function getUserByEmail({
    email
}: {
    email: string
}) {
    const user = await db.query.tblUser.findFirst({
        where: eq(tblUser.email, email)
    })
    return user
}



export const userEntities = {
    getUserById,
    createUser,
    createNewRefreshToken,
    getUserByEmail
}