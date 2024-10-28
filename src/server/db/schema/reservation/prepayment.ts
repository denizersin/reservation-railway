import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblReservation } from './';

export const tblPrepayment = mysqlTable('prepayment', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull(),
    amount: int('amount').notNull(),
    status: mysqlEnum('status', ['pending', 'success', 'failed']).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
    unique: unique('unique_reservation_id').on(t.reservationId),
}));

export const tblPrepaymentRelations = relations(tblPrepayment, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblPrepayment.reservationId], references: [tblReservation.id] }),
}));



export const tblBillPayment = mysqlTable('reservation_bill_payment', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull(),
    amount: int('amount').notNull(),
    status: mysqlEnum('status', ['pending', 'success', 'failed']).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
    unique: unique('unique_reservation_id').on(t.reservationId),
}));

export const tblBillPaymentRelations = relations(tblBillPayment, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblBillPayment.reservationId], references: [tblReservation.id] }),
}));


export default tblPrepayment;