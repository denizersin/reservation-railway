import { int, mysqlEnum, mysqlTable, uniqueIndex, varchar, serial, timestamp, unique, boolean } from 'drizzle-orm/mysql-core';
import { relations, sql } from "drizzle-orm";
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumGuestSelectionSide, EnumReservationListingType, EnumUserRole } from '@/shared/enums/predefined-enums';
import { tblResturant } from './restaurant';
// declaring enum in database



export const tblUser = mysqlTable('user', {
    id: int("id").autoincrement().primaryKey(),
    name: varchar('name', { length: 256 }),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 256 }).notNull(),
    role: mysqlEnum('role', getEnumValues(EnumUserRole)).notNull().default(EnumUserRole.user),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const tblUserRelations = relations(tblUser, ({ one, many }) => ({
    // reservations: many(tblReservation),
    // restaurant: one(tblResturant),
    // userPersonalSettings: one(userPersonalSettings),
    // refreshToken: many(tblRefreshToken),
    restaurant: one(tblResturant, { fields: [tblUser.id], references: [tblResturant.ownerId] }),
}));



export const tblRefreshToken = mysqlTable('refresh_token', {
    id: int("id").autoincrement().primaryKey(),
    userId: int('user_id').notNull().references(() => tblUser.id),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    revokedAt: timestamp('revoked_at').default(sql`NULL`),
    ipAddress: varchar('ip_address', { length: 45 }).default(sql`NULL`),
    userAgent: varchar('user_agent', { length: 255 }).default(sql`NULL`),

}, (t) => ({
    unq: unique('unique_refresh_token_and_user_id').on(t.token, t.userId),
}));



export const userPersonalSettings = mysqlTable('user_personal_settings', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull().unique(),
    soundForNotifications: boolean('sound_for_notifications').notNull().default(false),
    reservationListingType: mysqlEnum('reservation_listing_type',
        getEnumValues(EnumReservationListingType)
    ).notNull().default(EnumReservationListingType.smartList),
    guestSelectionSide: mysqlEnum('guest_selection_side',
        getEnumValues(EnumGuestSelectionSide)
    ).notNull().default(EnumGuestSelectionSide.left),
    corporateInformationSelectable: boolean('corporate_information_selectable').notNull().default(false),
    openReservationWindowOnCall: boolean('open_reservation_window_on_call').notNull().default(false),
    openReservationWindowFullScreen: boolean('open_reservation_window_full_screen').notNull().default(true),
    reservationScreenFollowMainCalendar: boolean('reservation_screen_follow_main_calendar').notNull().default(true),
    hideDailySummarySection: boolean('hide_daily_summary_section').notNull().default(false),
});


export type TUser = typeof tblUser.$inferSelect
export type TUserInsert = typeof tblUser.$inferInsert

export type TRefreshToken = typeof tblRefreshToken.$inferSelect
export type TRefreshTokenInsert = typeof tblRefreshToken.$inferInsert

