import { boolean, int, mysqlEnum, mysqlTable, time, unique } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { tblMeal } from './predefined';
import { tblRestaurant } from './restaurant';
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumDays } from '@/shared/enums/predefined-enums';

export const tblRestaurantMeals = mysqlTable('restaurant_meals', {
    id: int('id').autoincrement().primaryKey(),
    mealId: int('meal_id').notNull(),
    restaurantId: int('restaurant_id').notNull(),
}, (t) => ({
    unq: unique('unique_meal_and_restaurant').on(t.mealId, t.restaurantId),
}));

export const tblRestaurantMealsRelations = relations(tblRestaurantMeals, ({ one }) => ({
    meal: one(tblMeal, { fields: [tblRestaurantMeals.mealId], references: [tblMeal.id] }),
    restaurant: one(tblRestaurant, { fields: [tblRestaurantMeals.restaurantId], references: [tblRestaurant.id] }),
}));


export type TRestaurantMeals = typeof tblRestaurantMeals.$inferSelect
export type TRestaurantMealsInsert = typeof tblRestaurantMeals.$inferInsert

export type TRestaurantMealsCrud = {
    meals: number[]
}


export const tblMealHours = mysqlTable('meal_hours', {
    id: int('id').autoincrement().primaryKey(),
    mealId: int('meal_id').notNull(),
    restaurantId: int('restaurant_id').notNull(),
    hour: time('hour').notNull(),
    isOpen: boolean('is_open').notNull().$default(() => true),
}, (t) => ({
    unq: unique('unique_meal_hours').on(t.mealId, t.hour),
}));

export const tblMealHoursRelations = relations(tblMealHours, ({ one }) => ({
    meal: one(tblMeal, { fields: [tblMealHours.mealId], references: [tblMeal.id] }),
    restaurant: one(tblRestaurant, { fields: [tblMealHours.restaurantId], references: [tblRestaurant.id] }),
}));

export type TMealHour = typeof tblMealHours.$inferSelect

export type TMealHoursAdd = {
    mealHours: {
        mealId: number,
        hour: string,
        isOpen: boolean
    }[]
}


export const tblRestaurantMealDays = mysqlTable('restaurant_meal_days', {
    id: int('id').autoincrement().primaryKey(),
    mealId: int('meal_id').notNull(),
    restaurantId: int('restaurant_id').notNull(),
    day: mysqlEnum('day', getEnumValues(EnumDays)).notNull(),
    isOpen: boolean('is_open').notNull(),
}, (t) => ({
    unq: unique('unique_meal_day').on(t.mealId, t.restaurantId, t.day),
}));
export const tblRestaurantMealDaysRelations = relations(tblRestaurantMealDays, ({ one }) => ({
    meal: one(tblMeal, { fields: [tblRestaurantMealDays.mealId], references: [tblMeal.id] }),
    restaurant: one(tblRestaurant, { fields: [tblRestaurantMealDays.restaurantId], references: [tblRestaurant.id] }),
}));

export type TRestaurantMealDays = typeof tblRestaurantMealDays.$inferSelect
export type TRestaurantMealDaysInsert = typeof tblRestaurantMealDays.$inferInsert

export type TRestaurantMealDaysCrud = {
    mealDays: {
        mealId: number,
        day: EnumDays,
        isOpen: boolean
    }[]
}

