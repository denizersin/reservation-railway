import * as cron from 'node-cron';

import { db } from "@/server/db"

export const obje1 = {}

export async function getReservations() {
    return await db.query.tblReservation.findMany();
}




cron.schedule('*/10 * * * * *', async () => {
    console.log('testttt 321')
}); 