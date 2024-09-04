import { int, mysqlEnum, mysqlTable, varchar, serial, datetime, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { EnumLanguage } from './user';

export const tblResturant = mysqlTable('restaurants', {
    id: int('id').primaryKey(),
    location: varchar('location', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }).notNull()
});

export const tblRestaurantTranslations = mysqlTable('restaurant_translations', {
    restaurantId: int('restaurant_id')
        .notNull()
        .references(() => tblResturant.id),
    languageCode: mysqlEnum('role', [
        EnumLanguage.en,
        EnumLanguage.tr
    ]).notNull().default(EnumLanguage.tr),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 500 }).notNull()
}, (table) => ({
    pk: primaryKey({ name: "id", columns: [table.restaurantId, table.languageCode] }),
}));


export type TResturant = typeof tblResturant.$inferSelect
export type TResturantInsert = typeof tblResturant.$inferInsert