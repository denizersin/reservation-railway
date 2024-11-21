import { db } from "../db";

export async function createTransaction<T>(cb: (trx: typeof db) => Promise<T>): Promise<T> {

    return new Promise(async (resolve, reject) => {
        const result = await db.transaction(async (trx) => {
            return await cb(trx);
        }).catch(reject)

        resolve(result as T)
    })
}

export type TTransaction = typeof db;