import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblReservation } from '.';
import { tblRestaurantTag } from '../restaurant-tags';


export const tblReservationTag = mysqlTable('reservation_tag', {
    id: int('id').autoincrement().primaryKey(),
    tagId: int('tag_id').notNull(),
    reservationId: int('reservation_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({
}));

export const tblReservationTagRelations = relations(tblReservationTag, ({ one }) => ({
    reservation: one(tblReservation, {
        fields: [tblReservationTag.reservationId],
        references: [tblReservation.id]
    }),
    tag: one(tblRestaurantTag, {
        fields: [tblReservationTag.tagId],
        references: [tblRestaurantTag.id]
    })
}))

export type TReservationTag = typeof tblReservationTag.$inferSelect
export type TReservationTagInsert = typeof tblReservationTag.$inferInsert