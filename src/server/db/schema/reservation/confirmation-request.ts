import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblReservation } from '.';

export const tblConfirmationRequest = mysqlTable('confirmation_request', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

export const tblConfirmationRequestRelations = relations(tblConfirmationRequest, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblConfirmationRequest.reservationId], references: [tblReservation.id] }),
}));

export type TConfirmationRequest = typeof tblConfirmationRequest.$inferSelect
export type TConfirmationRequestInsert = typeof tblConfirmationRequest.$inferInsert