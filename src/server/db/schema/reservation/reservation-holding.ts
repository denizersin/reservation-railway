import { relations } from 'drizzle-orm';
import { date, int, mysqlTable, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblTable } from '..';


export const tblReservationHolding = mysqlTable('reservation_holding', {
    id: int('id').autoincrement().primaryKey(),
    holdedTableId: int('holded_table_id').notNull(),
    holdedAt: timestamp('holded_at').defaultNow().notNull(),
    holdingDate: timestamp('holding_date').notNull(),
    guestCount: int('guest_count').notNull(),
    roomId: int('room_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    restaurantId: int('restaurant_id').notNull(),
    mealId: int('meal_id').notNull(),
}, (t) => ({
    unq: unique('unique_table_id').on(t.holdedTableId, t.holdingDate),
}));

export const tblReservationHoldingRelations = relations(tblReservationHolding, ({ one }) => ({
    table: one(tblTable, { fields: [tblReservationHolding.holdedTableId], references: [tblTable.id] }),
}));

export type TReservationHolding = typeof tblReservationHolding.$inferSelect
export type TReservationHoldingInsert = typeof tblReservationHolding.$inferInsert