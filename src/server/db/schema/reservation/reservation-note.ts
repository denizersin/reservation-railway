import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblReservation } from '.';


export const tblReservationNote = mysqlTable('reservation_note', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull(),
    note: text('note').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
}));

export const tblReservationNoteRelations = relations(tblReservationNote, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationNote.reservationId], references: [tblReservation.id] }),
}));

export type TReservationNote = typeof tblReservationNote.$inferSelect
export type TReservationNoteInsert = typeof tblReservation