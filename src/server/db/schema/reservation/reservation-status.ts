import { getEnumValues } from '@/server/utils/server-utils';
import { EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { int, mysqlEnum, mysqlTable, timestamp } from 'drizzle-orm/mysql-core';

export const tblReserVationStatus = mysqlTable('reservation_status', {
    id: int('id').autoincrement().primaryKey(),
    status: mysqlEnum('status', getEnumValues(EnumReservationStatus)).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({}));



export const tblReservationStatusLogs = mysqlTable('reservation_status_logs', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull(),
    statusId: int('status_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({}));





export type TReservationStatus = typeof tblReserVationStatus.$inferSelect
export type TReservationStatusInsert = typeof tblReserVationStatus.$inferInsert