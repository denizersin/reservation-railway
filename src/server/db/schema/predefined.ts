import { getEnumValues } from '@/server/utils/server-utils';
import { EnumLanguage, EnumMeals, EnumReservationExistanceStatus, EnumReservationPrepaymentType, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';




export const tblReservationExistanceStatus = mysqlTable('reservation_existance_status', {
    id: int('id').autoincrement().primaryKey(),
    status: mysqlEnum('status', getEnumValues(EnumReservationExistanceStatus)).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({}));


export const tblReservationPrepaymentType = mysqlTable('reservation_prepayment_type', {
    id: int('id').autoincrement().primaryKey(),
    type: mysqlEnum('type', getEnumValues(EnumReservationPrepaymentType)).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({}));


export const tblLanguage = mysqlTable('language', {
    id: int('id').autoincrement().primaryKey(),
    languageCode: mysqlEnum('language_code', getEnumValues(EnumLanguage)).notNull(),
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









