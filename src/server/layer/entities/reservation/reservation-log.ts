import { db } from "@/server/db";
import { tblReservationLog, TReservationLogInsert } from "@/server/db/schema/reservation/reservation-log";

export const createLog = async (data: TReservationLogInsert) => {
    await db.insert(tblReservationLog).values(data);
}


export const ReservationLogEntities = {
    createLog
}