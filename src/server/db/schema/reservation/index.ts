import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblRestaurant } from '../restaurant';
import { tblRoom, tblTable } from '../room';
import { tblGuest, tblPersonel } from '../guest';
import { tblMeal, tblReservationExistanceStatus, tblReserVationStatus } from '../predefined';
import { tblPrepayment, tblBillPayment } from './prepayment';
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationPrepaymentType, EnumReservationStatus, EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums';
import { tblReservationNotification } from './notification';
import { tblReservationLog } from './reservation-log';
import { tblReservationNote } from './reservation-note';
import { tblReservationTags } from './tag';


export const tblReservation = mysqlTable('reservation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    roomId: int('room_id').notNull(),
    guestId: int('guest_id').notNull(),
    mealId: int('restaurant_meal_id').notNull(),
    reservationStatusId: int('reservation_status_id').notNull(),
    reservationExistenceStatusId: int('reservation_existence_status_id').notNull().default(EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.notExist]),
    personalId: int('personal_id'),
    prepaymentId: int('prepayment_id'),
    billPaymentId: int('bill_payment_id'),
    linkedReservationId: int('linked_reservation_id'),
    waitingSessionId: int('waiting_session_id').notNull(),


    isCheckedin: boolean('is_checked_in').notNull().default(false),

    prePaymentType: mysqlEnum('prepayment_type', getEnumValues(EnumReservationPrepaymentType)).notNull(),

    reservationDate: timestamp('reservation_date').notNull(),
    guestNote: text('guest_note'),
    hour: time('reservation_time').notNull(),
    guestCount: int('guest_count').notNull(),
    isSendSms: boolean('is_send_sms').notNull(),
    isSendEmail: boolean('is_send_email').notNull(),



    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({

}));

export const tblReservationTables = mysqlTable('reservation_tables', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    tableId: int('table_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});
export const tblReservationTableRelations = relations(tblReservationTables, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationTables.reservationId], references: [tblReservation.id] }),
    table: one(tblTable, { fields: [tblReservationTables.tableId], references: [tblTable.id] }),
}));

export const tblReservationRelations = relations(tblReservation, ({ one, many }) => ({
    tables: many(tblReservationTables),
    notifications: many(tblReservationNotification),
    logs: many(tblReservationLog),
    notes: many(tblReservationNote),
    tags: many(tblReservationTags),

    waitingSession: one(tblWaitingTableSession, { fields: [tblReservation.waitingSessionId], references: [tblWaitingTableSession.id] }),

    reservationStatus: one(tblReserVationStatus, { fields: [tblReservation.reservationStatusId], references: [tblReserVationStatus.id] }),
    reservationExistenceStatus: one(tblReservationExistanceStatus, { fields: [tblReservation.reservationExistenceStatusId], references: [tblReservationExistanceStatus.id] }),
    personal: one(tblPersonel, { fields: [tblReservation.personalId], references: [tblPersonel.id] }),
    restaurant: one(tblRestaurant, { fields: [tblReservation.restaurantId], references: [tblRestaurant.id] }),
    room: one(tblRoom, { fields: [tblReservation.roomId], references: [tblRoom.id] }),
    meal: one(tblMeal, { fields: [tblReservation.mealId], references: [tblMeal.id] }),
    guest: one(tblGuest, { fields: [tblReservation.guestId], references: [tblGuest.id] }),

    //nullable relations
    prepayment: one(tblPrepayment, { fields: [tblReservation.prepaymentId], references: [tblPrepayment.id] }),
    billPayment: one(tblBillPayment, { fields: [tblReservation.billPaymentId], references: [tblBillPayment.id] }),

}));





export const tblWaitingTableSession = mysqlTable('waiting_table_session', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').references(() => tblReservation.id, { onDelete: 'cascade' }),
    isinWaiting: boolean('is_in_waiting').notNull().default(false),



    enteredAt: timestamp('entered_at'),
    exitedAt: timestamp('exited_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});
export type TWaitingTableSession = typeof tblWaitingTableSession.$inferSelect;
export const waitingTableSessionRelations = relations(tblWaitingTableSession, ({ one, many }) => ({
    reservation: one(tblReservation, { fields: [tblWaitingTableSession.reservationId], references: [tblReservation.id] }),
    tables: many(tblWaitingSessionTables),
}));

export const tblWaitingSessionTables = mysqlTable('waiting_session_tables', {
    id: int('id').autoincrement().primaryKey(),
    waitingSessionId: int('waiting_session_id').notNull(),
    tableId: int('table_id').notNull().references(() => tblTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

export const waitingSessionTablesRelations = relations(tblWaitingSessionTables, ({ one }) => ({
    waitingSession: one(tblWaitingTableSession, { fields: [tblWaitingSessionTables.waitingSessionId], references: [tblWaitingTableSession.id] }),
    table: one(tblTable, { fields: [tblWaitingSessionTables.tableId], references: [tblTable.id] }),
}));

export const TWaitingTableSession = typeof tblWaitingTableSession.$inferSelect;
export const TWaitingSessionTables = typeof tblWaitingSessionTables.$inferSelect;

export const TWaitingTableSessionInsert = typeof tblWaitingTableSession.$inferInsert;
export const TWaitingSessionTablesInsert = typeof tblWaitingSessionTables.$inferInsert;



export type TReservationSelect = typeof tblReservation.$inferSelect;
type ReservationInsert = typeof tblReservation.$inferInsert;



export type TReservation = TReservationSelect & {
    tables: typeof tblReservationTables.$inferSelect[]
    restaurant: typeof tblRestaurant.$inferSelect
    room: typeof tblRoom.$inferSelect
    meal: typeof tblMeal.$inferSelect
    guest: typeof tblGuest.$inferSelect
};

export type TReservationInsert = ReservationInsert & {
    tableIds: number[]
}

type ReservationUpdate = TReservationSelect & {
    tableIds: number[]
}

export type TUpdateReservation = Partial<ReservationUpdate>

export type TReservatioTable = typeof tblReservationTables.$inferSelect