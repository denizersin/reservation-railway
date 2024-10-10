import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblRestaurant } from './restaurant';
import { tblRoom, tblTable } from './room';
import { tblGuest } from './guest';
import { tblMeal } from './predefined';


export const tblReservation= mysqlTable('reservation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    roomId: int('room_id').notNull(),
    tableId: int('table_id').notNull(),
    mealId: int('restaurant_meal_id').notNull(),
    reservationDate: timestamp('reservation_date').notNull(),
    hour: time('reservation_time').notNull(),
    guestCount: int('guest_count').notNull(),
    createdAt:timestamp('created_at').defaultNow().notNull(),
    updatedAt:timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt:timestamp('deleted_at'),
    guestId: int('guest_id').notNull(),
}, (t) => ({

}));

export const tblReservationRelations = relations(tblReservation, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblReservation.restaurantId], references: [tblRestaurant.id] }),
    room: one(tblRoom, { fields: [tblReservation.roomId], references: [tblRoom.id] }),
    table: one(tblTable, { fields: [tblReservation.tableId], references: [tblTable.id] }),
    meal: one(tblMeal, { fields: [tblReservation.mealId], references: [tblMeal.id] }),
    guest: one(tblGuest, { fields: [tblReservation.guestId], references: [tblGuest.id] }),
}));

export type TReservation = typeof tblReservation.$inferSelect;
export type TReservationInsert = typeof tblReservation.$inferInsert;

