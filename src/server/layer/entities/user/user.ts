import { env } from "@/env";
import { db } from "@/server/db";
import { tblRefreshToken, tblUser, TUserInsert } from "@/server/db/schema/user";
import { REFRESH_TOKEN_EXPIRY_DAYS } from "@/server/utils/server-utils";
import TUserValidator from "@/shared/validators/user";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";



export async function createUser({
    userData,
}: {
    userData: TUserValidator.RegisterInput,
}) {
    const result = await db.insert(tblUser).values(userData).$returningId()
    return result[0]?.id
}

export async function updateUserByAdmin({
    userData
}: {
    userData: TUserValidator.UpdateUserByAdminInput
}) {
    await db.update(tblUser).set(userData).where(eq(tblUser.id, userData.id))

}

export async function createNewRefreshToken({
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

export async function getUserById({
    userId
}: {
    userId: number
}) {
    const user = await db.query.tblUser.findFirst({
        where: eq(tblUser.id, userId)
    })
    return user
}

export async function getUserByEmail({
    email
}: {
    email: string
}) {
    const user = await db.query.tblUser.findFirst({
        where: eq(tblUser.email, email)
    })
    return user
}







export const getAllUsers = async ({
    page, limit, name, email, role
}: TUserValidator.GetAllUsersInput) => {

    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (name) {
        whereConditions.push(like(tblUser.name, `%${name}%`))
    }
    if (email) {
        whereConditions.push(like(tblUser.email, `%${email}%`))
    }
    if (role) {
        whereConditions.push(eq(tblUser.role, role))
    }

    let query = db.query.tblUser.findMany({
        where: and(...whereConditions),
        limit,
        offset: (page - 1) * limit,
        orderBy: desc(tblUser.id)
    });

    const countQuery = db.query.tblUser.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    });
    const totalCount = await countQuery.execute().then(res => res.length);

    const users = await query;

    return {
        data: users,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };






}


