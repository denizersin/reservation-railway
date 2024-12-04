import { getEnumValues } from '@/server/utils/server-utils';
import { EnumNotificationMessageType, EnumNotificationStatus, EnumNotificationType, EnumWaitlistNotificationMessageType } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblReservation } from '.';
import { tblWaitlist } from '../waitlist';


export const tblReservationNotification = mysqlTable('reservation_notification', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull(),
    type: mysqlEnum('type', getEnumValues(EnumNotificationType)).notNull(),
    notificationMessageType: mysqlEnum('notification_message_type', getEnumValues(EnumNotificationMessageType)).notNull(),
    notificationMessageTypeId: int('numeric_notification_message_type_id').notNull(),
    message: text('message').notNull(),
    sentAt: timestamp('sent_at'),
    status: mysqlEnum('status', getEnumValues(EnumNotificationStatus)).notNull().default(EnumNotificationStatus.PENDING),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
}));

export const tblReservationNotificationRelations = relations(tblReservationNotification, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationNotification.reservationId], references: [tblReservation.id] }),
    notificationMessageType: one(tblReservationNotificationMessageType, { fields: [tblReservationNotification.notificationMessageTypeId], references: [tblReservationNotificationMessageType.id] }),
}));




export type TReservationNotification = typeof tblReservationNotification.$inferSelect
export type TReservationNotificationInsert = typeof tblReservationNotification.$inferInsert



export const tblReservationNotificationMessageType = mysqlTable('reservation_notification_message_type', {
    id: int('id').autoincrement().primaryKey(),
    type: mysqlEnum('type', getEnumValues(EnumNotificationMessageType)).notNull(),
})



export const tblWaitlistNotification = mysqlTable('waitlist_notification', {
    id: int('id').autoincrement().primaryKey(),
    waitlistId: int('waitlist_id').notNull(),
    type: mysqlEnum('type', getEnumValues(EnumNotificationType)).notNull(),
    notificationMessageType: mysqlEnum('notification_message_type', getEnumValues(EnumWaitlistNotificationMessageType)).notNull(),
    message: text('message').notNull(),
    sentAt: timestamp('sent_at'),
    status: mysqlEnum('status', getEnumValues(EnumNotificationStatus)).notNull().default(EnumNotificationStatus.PENDING),
})

export const tblWaitlistNotificationRelations = relations(tblWaitlistNotification, ({ one }) => ({
    waitlist: one(tblWaitlist, { fields: [tblWaitlistNotification.waitlistId], references: [tblWaitlist.id] }),
}));

export type TWaitlistNotification = typeof tblWaitlistNotification.$inferSelect
export type TWaitlistNotificationInsert = typeof tblWaitlistNotification.$inferInsert