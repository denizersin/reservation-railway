import { int, mysqlEnum, mysqlTable, uniqueIndex, varchar, serial, timestamp, unique, boolean } from 'drizzle-orm/mysql-core';
import { relations, sql } from "drizzle-orm";
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumTableShape } from '@/shared/enums/predefined-enums';


//room table

export const tblRoom = mysqlTable('room', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
    isWaitingRoom: boolean('is_waiting_room').notNull().default(false),

});
export const roomRelations = relations(tblRoom, ({ one, many }) => ({
    tables: many(tblTable),
}));


export const tblTable = mysqlTable('table', {
    id: int('id').autoincrement().primaryKey(),
    roomId: int('room_id').notNull(),
    no: varchar('no', { length: 256 }).notNull(),
    order: int('order').notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    capacity: int('capacity').notNull(),
    minCapacity: int('min_capacity').notNull(),
    maxCapacity: int('max_capacity').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    shape: mysqlEnum('shape', getEnumValues(EnumTableShape)).notNull().default(EnumTableShape.rectangle),
}, (t) => ({
    unq: unique('unique_room_table').on(t.roomId, t.name),
}));
export const tableRelations = relations(tblTable, ({ one, many }) => ({
    room: one(tblRoom, { fields: [tblTable.roomId], references: [tblRoom.id] }),
}));