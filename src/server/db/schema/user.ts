import { int, mysqlEnum, mysqlTable, uniqueIndex, varchar, serial, timestamp, unique } from 'drizzle-orm/mysql-core';
import { sql } from "drizzle-orm";
// declaring enum in database
export const tblUser = mysqlTable('user', {
    id: int("id").autoincrement().primaryKey(),
    name: varchar('name', { length: 256 }),
    email: varchar('email', { length: 256 }),
    password: varchar('password', { length: 256 }).notNull(),
    role: mysqlEnum('role', ['admin', 'user']).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    optionalField: varchar('optional_field', { length: 256 })
});

export const tblRefreshToken = mysqlTable('refresh_token', {
    id: serial("id").primaryKey(),
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


export type TUser = typeof tblUser.$inferSelect
export type TUserInsert = typeof tblUser.$inferInsert

export type TRefreshToken = typeof tblRefreshToken.$inferSelect
export type TRefreshTokenInsert = typeof tblRefreshToken.$inferInsert