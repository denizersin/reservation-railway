import { getEnumValues } from '@/server/utils/server-utils';
import { EnumLanguage, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { datetime, int, mysqlEnum, mysqlTable, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblRestaurantGeneralSetting } from './restaurant-general-setting';
import { tblUser } from './user';

export const tblResturant = mysqlTable('restaurant', {
    id: int('id').autoincrement().primaryKey(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ownerId: int('owner_id').notNull()

},);

export const restaurantRelations = relations(tblResturant, ({ many, one }) => ({
    translations: many(tblRestaurantTranslations),
    restaurantGeneralSetting: one(tblRestaurantGeneralSetting),
    owner: one(tblUser, { fields: [tblResturant.ownerId], references: [tblUser.id] }),

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










type TResturantWithoutTrns = typeof tblResturant.$inferSelect
type TResturantWithoutTrnsInsert = typeof tblResturant.$inferInsert

type TResturantTranslations = typeof tblRestaurantTranslations.$inferSelect
type TResturantTranslationsInsert = typeof tblRestaurantTranslations.$inferInsert



export type TResturant = TResturantWithoutTrns & TResturantTranslations & {
}

export type TResturantInsert = TResturantWithoutTrnsInsert & {
    translations: TResturantTranslationsInsert[]
}
