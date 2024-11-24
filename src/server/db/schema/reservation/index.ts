import { EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, index, int, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblUser } from '..';
import { tblGuest, tblPersonel } from '../guest';
import { tblMeal, tblReservationExistanceStatus } from '../predefined';
import { tblRestaurant } from '../restaurant';
import { tblRoom, tblTable } from '../room';
import { tblConfirmationRequest } from './confirmation-request';
import { tblReservationNotification } from './notification';
import { tblBillPayment, tblPrepayment } from './prepayment';
import { tblReservationLog } from './reservation-log';
import { tblReservationNote } from './reservation-note';
import { tblReserVationStatus } from './reservation-status';
import { tblReservationTag } from './tag';
import { tblInvoice } from './invoice';



export const tblReservation = mysqlTable('reservation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    roomId: int('room_id').notNull(),
    guestId: int('guest_id').notNull(),
    mealId: int('restaurant_meal_id').notNull(),
    reservationStatusId: int('reservation_status_id').notNull(),
    reservationExistenceStatusId: int('reservation_existence_status_id')
        .notNull().default(EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.notExist]),
    assignedPersonalId: int('assigned_personal_id'),
    currentPrepaymentId: int('current_prepayment_id'),
    billPaymentId: int('bill_payment_id'),
    linkedReservationId: int('linked_reservation_id'),
    waitingSessionId: int('waiting_session_id').notNull(),
    invoiceId: int('invoice_id'),
    invoiceRequired: boolean('invoice_required').notNull().default(false),
    //if exists, it means that the reservation is created by restaurant owner
    createdOwnerId: int('created_owner_id'),
    isCreatedByOwner: boolean('is_created_by_owner').notNull().default(false),

    isCheckedin: boolean('is_checked_in').notNull().default(false),

    confirmedBy: varchar('confirmed_by', { length: 255 }),
    confirmedAt: timestamp('confirmed_at'),

    checkedinAt: timestamp('checkedin_at'),
    enteredMainTableAt: timestamp('entered_main_table_at'),
    checkedoutAt: timestamp('checkedout_at'),

    canceledBy: varchar('canceled_by', { length: 255 }),
    canceledAt: timestamp('canceled_at'),

    prePaymentTypeId: int('prepayment_type_id').notNull(),

    //holding
    holdedAt: timestamp('holded_at'),
    holdExpiredAt: timestamp('hold_expired_at'),

    isCameFromWaitlist: boolean('is_came_from_waitlist').notNull().default(false),


    reservationDate: timestamp('reservation_date').notNull(),
    guestNote: text('guest_note'),
    hour: time('reservation_time').notNull(),
    guestCount: int('guest_count').notNull(),
    isSendSms: boolean('is_send_sms').notNull(),
    isSendEmail: boolean('is_send_email').notNull(),





    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    reservationLookupIdx: index('idx_reservation_lookup').on(
        table.reservationDate,     // en önemli filtreleme kriteri
        table.reservationStatusId, // sık kullanılan durum kontrolü
        table.restaurantId,        // sabit değer (en sona)
        table.mealId              // sabit değer (en sona)
    ),
}));

export const tblReservationTable = mysqlTable('reservation_tables', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    tableId: int('table_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    reservationTableLookupIdx: index('idx_reservation_table_lookup').on(table.tableId,table.reservationId, ),
    reservationTableUniqueIdx: unique('idx_reservation_table_unique').on(table.reservationId, table.tableId),
}));
export const tblReservationTableRelations = relations(tblReservationTable, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationTable.reservationId], references: [tblReservation.id] }),
    table: one(tblTable, { fields: [tblReservationTable.tableId], references: [tblTable.id] }),
}));

export const tblReservationRelations = relations(tblReservation, ({ one, many }) => ({
    tables: many(tblReservationTable),
    notifications: many(tblReservationNotification),
    logs: many(tblReservationLog),
    reservationNotes: many(tblReservationNote),
    tags: many(tblReservationTag),
    prepayments:many(tblPrepayment),
    waitingSession: one(tblWaitingTableSession, { fields: [tblReservation.waitingSessionId], references: [tblWaitingTableSession.id] }),
    confirmationRequests: many(tblConfirmationRequest),
    createdOwner: one(tblUser, { fields: [tblReservation.createdOwnerId], references: [tblUser.id] }),

    reservationStatus: one(tblReserVationStatus, { fields: [tblReservation.reservationStatusId], references: [tblReserVationStatus.id] }),
    reservationExistenceStatus: one(tblReservationExistanceStatus, { fields: [tblReservation.reservationExistenceStatusId], references: [tblReservationExistanceStatus.id] }),
    assignedPersonal: one(tblPersonel, { fields: [tblReservation.assignedPersonalId], references: [tblPersonel.id] }),
    restaurant: one(tblRestaurant, { fields: [tblReservation.restaurantId], references: [tblRestaurant.id] }),
    room: one(tblRoom, { fields: [tblReservation.roomId], references: [tblRoom.id] }),
    meal: one(tblMeal, { fields: [tblReservation.mealId], references: [tblMeal.id] }),
    guest: one(tblGuest, { fields: [tblReservation.guestId], references: [tblGuest.id] }),

    //nullable relations
    currentPrepayment: one(tblPrepayment, { fields: [tblReservation.currentPrepaymentId], references: [tblPrepayment.id] }),
    billPayment: one(tblBillPayment, { fields: [tblReservation.billPaymentId], references: [tblBillPayment.id] }),
    invoice: one(tblInvoice, { fields: [tblReservation.invoiceId], references: [tblInvoice.id] }),

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



export type TReservation = TReservationSelect

export type TReservationInsert = ReservationInsert

type ReservationUpdate = TReservationSelect & {
    tableIds: number[]
}

export type TUpdateReservation = Partial<ReservationUpdate>

export type TReservatioTable = typeof tblReservationTable.$inferSelect