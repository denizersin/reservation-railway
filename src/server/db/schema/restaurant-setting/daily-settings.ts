import { int, mysqlTable, varchar, boolean, json, date, time, timestamp } from "drizzle-orm/mysql-core";

export const tblRestaurantDailySettings = mysqlTable('restaurant_daily_settings', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    onlineReservations: boolean('online_reservations').notNull().default(true),
    waitlist: boolean('waitlist').notNull().default(true),
    dinner: boolean('dinner').notNull().default(true),
    minGuests: int('min_guests').notNull().default(1),
    maxGuests: int('max_guests').notNull().default(5),
    closedDinnerHours: json('closed_dinner_hours').$type<string[]>().notNull().default([]),
    closedAreas: json('closed_areas').$type<number[]>().notNull().default([]),
    date: timestamp('date').notNull(),
});

