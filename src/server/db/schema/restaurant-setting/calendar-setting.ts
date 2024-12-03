import { mysqlTable } from "drizzle-orm/mysql-core";
import { int, json } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from "zod";
export const tblRestaurantCalendarSetting = mysqlTable('restaurant_calendar_setting', {
    id: int('id').autoincrement().primaryKey(),
    maxAdvanceBookingDays: int('max_advance_booking_days').notNull().default(30),
    closedMonths: json('closed_months').$type<number[]>().notNull(),
})


export type TRestaurantCalendarSetting = typeof tblRestaurantCalendarSetting.$inferSelect
export type TRestaurantCalendarSettingInsert = typeof tblRestaurantCalendarSetting.$inferInsert


