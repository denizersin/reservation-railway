import { int, mysqlEnum, mysqlTable, uniqueIndex, varchar, serial, timestamp, unique, boolean } from 'drizzle-orm/mysql-core';
import { relations, sql } from "drizzle-orm";
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumDays } from '@/shared/enums/predefined-enums';
import { tblMeal } from './predefined';

export const tblMealDay = mysqlTable('meal_day', {
    id: int('id').autoincrement().primaryKey(),
    mealId: int('meal_id').notNull(),
    day: mysqlEnum('day', getEnumValues(EnumDays)).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (t) => ({
    unq: unique('unique_meal_day').on(t.mealId, t.day),
}));


export const tblMealDayRelations = relations(tblMealDay, ({ one, many }) => ({
    meal: one(tblMeal),
}));


export type TMealDay = typeof tblMealDay.$inferSelect
export type TMealDayInsert = typeof tblMealDay.$inferInsert