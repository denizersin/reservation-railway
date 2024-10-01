import { getEnumValues } from '@/server/utils/server-utils';
import { EnumMeals, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';



export const tblReserVationStatus = mysqlTable('reservation_status', {
    id: int('id').autoincrement().primaryKey(),
    status: mysqlEnum('status', getEnumValues(EnumReservationStatus)).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({}));




export const tblLanguage = mysqlTable('language', {
    id: int('id').autoincrement().primaryKey(),
    languageCode: varchar('language_code', { length: 10 }).notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    isRtl: boolean('is_rtl').notNull(),
})




export const tblMeal = mysqlTable('meal', {
    id: int('id').autoincrement().primaryKey(),
    name: mysqlEnum('name', getEnumValues(EnumMeals)).notNull(),
},);



export const tblCountry = mysqlTable('country', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    code: varchar('code', { length: 10 }).notNull(),
    phoneCode: varchar('phone_code', { length: 10 }).notNull(),
})




export type TMeal = typeof tblMeal.$inferSelect
export type TMealInsert = typeof tblMeal.$inferInsert

export type TLanguage = typeof tblLanguage.$inferSelect
export type TLanguageInsert = typeof tblLanguage.$inferInsert

export type TCountry = typeof tblCountry.$inferSelect
export type TCountryInsert = typeof tblCountry.$inferInsert


export type TReservationStatus = typeof tblReserVationStatus.$inferSelect
export type TReservationStatusInsert = typeof tblReserVationStatus.$inferInsert






