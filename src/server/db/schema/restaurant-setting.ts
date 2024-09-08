import { getEnumValues } from '@/server/utils/server-utils';
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, primaryKey, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblResturant } from './restaurant';
import { EnumLanguage } from './user';


export const tblRestaurantSetting = mysqlTable('restaurant_setting', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isAutoCheckOut: boolean('is_auto_check_out').notNull().default(false),
    isUseLastUpdates: boolean('is_use_last_updates').notNull().default(false),
},);
export const tblRestaurantSettingRelations = relations(tblRestaurantSetting, ({ one, many }) => ({
    meals: many(tblRestaurantSettingToMeal),
    restaurant: one(tblResturant, { fields: [tblRestaurantSetting.restaurantId], references: [tblResturant.id] }),
}));








export const tblMeal = mysqlTable('meal', {
    id: int('id').autoincrement().primaryKey(),
},);
export const mealRelations = relations(tblMeal, ({ many, one }) => ({
    translations: many(tblMealTranslations),
    restaurantSettings: many(tblRestaurantSettingToMeal),
}));

export const tblMealTranslations = mysqlTable('meal_translation', {
    mealId: int('meal_id').notNull(),
    languageCode: mysqlEnum('role', getEnumValues(EnumLanguage)).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.mealId, t.languageCode], }),
}));
export const tblMealTranslationRelations = relations(tblMealTranslations, ({ one }) => ({
    meal: one(tblMeal, { fields: [tblMealTranslations.mealId], references: [tblMeal.id] }),
}));


export const tblRestaurantSettingToMeal = mysqlTable('restaurant_setting_to_meal', {
    id: int('id').autoincrement().primaryKey(),
    mealId: int('meal_id').notNull(),
    restaurantSettingId: int('restaurant_setting_id').notNull()
}, (t) => ({
    unq: unique('unique_meal_and_rst_sttng').on(t.mealId, t.restaurantSettingId),
}));
export const tblRestaurantSettingToMealRelations = relations(tblRestaurantSettingToMeal, ({ one }) => ({
    meal: one(tblMeal, { fields: [tblRestaurantSettingToMeal.mealId], references: [tblMeal.id] }),
    restaurantSetting: one(tblRestaurantSetting, { fields: [tblRestaurantSettingToMeal.restaurantSettingId], references: [tblRestaurantSetting.id] }),
}));



export type TMealNoTrns = typeof tblMeal.$inferSelect
export type TMealNoTrnsInsert = typeof tblMeal.$inferInsert

export type TMealTranslations = typeof tblMealTranslations.$inferSelect
export type TMealTranslationsInsert = typeof tblMealTranslations.$inferInsert

export type TMeal = TMealNoTrns & TMealTranslations & {}

export type TMealInsert = TMealNoTrnsInsert & Omit<TMealTranslationsInsert, 'mealId'>

