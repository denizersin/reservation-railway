import { getEnumValues } from '@/server/utils/server-utils';
import { EnumLanguage, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { datetime, int, mysqlEnum, mysqlTable, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblRestaurantGeneralSetting } from './restaurant-general-setting';
import { tblUser } from './user';
import { tblLanguage, TLanguage } from './predefined';
import { tblRestaurantTag } from './restaurant-tags';

export const tblRestaurant = mysqlTable('restaurant', {
    id: int('id').autoincrement().primaryKey(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ownerId: int('owner_id').notNull()

},);

export const restaurantRelations = relations(tblRestaurant, ({ many, one }) => ({
    translations: many(tblRestaurantTranslations),
    restaurantGeneralSetting: one(tblRestaurantGeneralSetting),
    owner: one(tblUser, { fields: [tblRestaurant.ownerId], references: [tblUser.id] }),
    languages: many(tblRestaurantLanguage),
    tags: many(tblRestaurantTag),
    // defaultCountry: one(tblCountry, { fields: [tblRestaurantGeneralSetting.defaultCountryId], references: [tblCountry.id] }),
    // 
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


export const tblReservation = mysqlTable('reservation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    userId: int('user_id').notNull(),
    reservationDate: datetime('reservation_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique('unique_user_reservation').on(t.userId, t.reservationDate),
}));


export const tblRestaurantLanguage = mysqlTable('restaurant_language', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
}, (t) => ({
    unq: unique('unique_restaurant_language').on(t.restaurantId, t.languageId),
}));
export const tblRestaurantLanguageRelations = relations(tblRestaurantLanguage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblRestaurantLanguage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblRestaurantLanguage.languageId], references: [tblLanguage.id] }),
}));







type TRestaurantWithoutTrns = typeof tblRestaurant.$inferSelect
type TRestaurantWithoutTrnsInsert = typeof tblRestaurant.$inferInsert

type TRestaurantTranslations = typeof tblRestaurantTranslations.$inferSelect
type TRestaurantTranslationsInsert = typeof tblRestaurantTranslations.$inferInsert




export type TRestaurant = TRestaurantWithoutTrns & TRestaurantTranslations & {
}

export type TRestaurantInsert = TRestaurantWithoutTrnsInsert & {
    translations: TRestaurantTranslationsInsert[]
}


export type TRestaurantLanguage = typeof tblRestaurantLanguage.$inferSelect

export type TRestaurantLanguages = (TRestaurantLanguage & {
    language: TLanguage
})[]