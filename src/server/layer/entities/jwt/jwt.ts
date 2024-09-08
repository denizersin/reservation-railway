// not db

import { env } from "@/env";
import { JWT_EXPIRY_DAYS } from "@/server/utils/server-utils";
import jwt from "jsonwebtoken";

export type jwtBody = {
    userId: number;
}

export const generateUserToken = ({
    jwtBody,
}: {
    jwtBody: jwtBody;
}): string => {
 const token = jwt.sign(jwtBody, env.JWT_SECRET, {
    expiresIn: `${JWT_EXPIRY_DAYS}d`,
})
    return token
}

export const verifyUserToken = ({
    token,
}: {
    token: string;
}): jwtBody => {
    return jwt.verify(token, env.JWT_SECRET) as jwtBody
}


export const jwtEntities = {
    generateUserToken,
    verifyUserToken
}