import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblReservation } from '.';


export const tblReservationLog = mysqlTable('reservation_log', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull(),
    message: text('message').notNull(),
    owner:varchar('process_owner', { length: 50 }).notNull(),
    logTime: timestamp('log_time').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
}));

export const tblReservationLogRelations = relations(tblReservationLog, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationLog.reservationId], references: [tblReservation.id] }),
}));

export type TReservationLog = typeof tblReservationLog.$inferSelect
export type TReservationLogInsert = typeof tblReservationLog.$inferInsert