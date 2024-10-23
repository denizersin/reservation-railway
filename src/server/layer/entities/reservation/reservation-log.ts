import { db } from "@/server/db";
import { tblReservationLog, TReservationLogInsert } from "@/server/db/schema/reservation/reservation-log";

export const createLog = async (data: TReservationLogInsert) => {
    console.log(`Creating log for reservation ${data.reservationId}`);
    await db.insert(tblReservationLog).values(data);
}


export const ReservationLogEntities = {
    createLog
}