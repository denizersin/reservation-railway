import { int, mysqlEnum, mysqlTable, uniqueIndex, varchar, serial, timestamp, unique, boolean } from 'drizzle-orm/mysql-core';
import { sql } from "drizzle-orm";
// declaring enum in database

export enum EnumLanguage {
    en = "en",
    tr = "tr",
}

export enum EnumUserRole {
    admin = "admin",
    owner = "owner",
    user = "user"
}

export const tblUser = mysqlTable('user', {
    id: int("id").autoincrement().primaryKey(),
    name: varchar('name', { length: 256 }),
    email: varchar('email', { length: 256 }),
    password: varchar('password', { length: 256 }).notNull(),
    role: mysqlEnum('role', [
        EnumUserRole.admin,
        EnumUserRole.owner,
        EnumUserRole.user
    ]).notNull().default(EnumUserRole.user),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    optionalField: varchar('optional_field', { length: 256 })
});

export const tblRefreshToken = mysqlTable('refresh_token', {
    id: int("id").primaryKey(),
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


export enum EnumReservationListingType {
    smartList = 'smart_list',
    newestOnTop = 'newest_on_top',
}
export enum EnumGuestSelectionSide {
    left = 'left',
    right = 'right',
}
export const userPersonalSettings = mysqlTable('user_personal_settings', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull().unique(),
    soundForNotifications: boolean('sound_for_notifications').notNull().default(false),
    reservationListingType: mysqlEnum('reservation_listing_type', [
        EnumReservationListingType.smartList,
        EnumReservationListingType.newestOnTop
    ]).notNull().default(EnumReservationListingType.smartList),
    guestSelectionSide: mysqlEnum('guest_selection_side', [
        EnumGuestSelectionSide.left,
        EnumGuestSelectionSide.right
    ]).notNull().default(EnumGuestSelectionSide.left),
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