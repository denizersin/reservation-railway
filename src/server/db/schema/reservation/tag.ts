import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';


export const tblReservationTags = mysqlTable('reservation_tags', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    color: text('color').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
    unique: unique('unique_name').on(t.name),
}));

export type TReservationTags = typeof tblReservationTags.$inferSelect
export type TReservationTagsInsert = typeof tblReservationTags.$inferInsert