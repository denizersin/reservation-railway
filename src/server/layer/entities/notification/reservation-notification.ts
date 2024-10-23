import { db } from "@/server/db";
import { tblReservationNotification, TReservationNotification, TReservationNotificationInsert } from "@/server/db/schema/reservation/notification";
import { eq } from "drizzle-orm";

export const createReservationNotification = async (data: TReservationNotificationInsert) => {
    const [result] = await db.insert(tblReservationNotification).values(data).$returningId()
    const notification = await db.query.tblReservationNotification.findFirst({
        where: eq(tblReservationNotification.id, result?.id!)
    })
    if (!notification) throw new Error('Notification not created')
    return notification
};

export const updateNotification = (data: Partial<TReservationNotification> & {
    id: number
}) => {
    return db.update(tblReservationNotification).set(data).where(eq(tblReservationNotification.id, data.id))

}