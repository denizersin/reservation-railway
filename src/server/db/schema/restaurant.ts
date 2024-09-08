import { int, mysqlEnum, mysqlTable, varchar, serial, datetime, timestamp, primaryKey, foreignKey, unique } from 'drizzle-orm/mysql-core';
import { EnumLanguage } from './user';
import { relations } from 'drizzle-orm';
import { getEnumValues } from '@/server/utils/server-utils';
import { tblRestaurantSetting } from './restaurant-setting';

export const tblResturant = mysqlTable('restaurant', {
    id: int('id').autoincrement().primaryKey(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    name: varchar('name', { length: 255 }).notNull(),

},);
export const restaurantRelations = relations(tblResturant, ({ many, one }) => ({
    translations: many(tblRestaurantTranslations),
    restaurantSettings:one(tblRestaurantSetting),
}));



//DONT USE ID AS PRIMARY KEY IN TRANSLATION TABLES (returningID problem! we should use id)
export const tblRestaurantTranslations = mysqlTable('restaurant_translation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageCode: mysqlEnum('language_code', getEnumValues(EnumLanguage)).notNull().default(EnumLanguage.tr),
    description: varchar('description', { length: 500 }).notNull(),
}, (t) => ({
    // pk: primaryKey({ columns: [t.restaurantId, t.languageCode], }),
}));










type TResturantWithoutTrns = typeof tblResturant.$inferSelect
type TResturantWithoutTrnsInsert = typeof tblResturant.$inferInsert

type TResturantTranslations = typeof tblRestaurantTranslations.$inferSelect
type TResturantTranslationsInsert = typeof tblRestaurantTranslations.$inferInsert



export type TResturant = TResturantWithoutTrns & TResturantTranslations & {
}

export type TResturantInsert = TResturantWithoutTrnsInsert & {
    translations: TResturantTranslationsInsert[]
}
