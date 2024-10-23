import { getEnumValues } from '@/server/utils/server-utils';
import { EnumNotificationMessageType, EnumNotificationStatus, EnumNotificationType } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblReservation } from '.';


export const tblReservationNotification = mysqlTable('reservation_notification', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id'),
    type: mysqlEnum('type', getEnumValues(EnumNotificationType)).notNull(),
    notificationMessageType: mysqlEnum('notification_message_type', getEnumValues(EnumNotificationMessageType)).notNull(),
    message: text('message').notNull(),
    sentAt: timestamp('sent_at'),
    status:mysqlEnum('status', getEnumValues(EnumNotificationStatus)).notNull().default(EnumNotificationStatus.PENDING),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
}));

export const tblReservationNotificationRelations = relations(tblReservationNotification, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationNotification.reservationId], references: [tblReservation.id] }),
}));


export type TReservationNotification = typeof tblReservationNotification.$inferSelect
export type TReservationNotificationInsert = typeof tblReservationNotification.$inferInsert