import { db } from "../db";

export async function createTransaction<T>(cb: (trx: typeof db) => Promise<T>): Promise<T> {
    return await db.transaction(async (trx) => {
        return await cb(trx);
    });
}

export type TTransaction = typeof db;