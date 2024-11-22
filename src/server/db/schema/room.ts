import { getEnumValues } from '@/server/utils/server-utils';
import { EnumTableShape } from '@/shared/enums/predefined-enums';
import { is, relations } from "drizzle-orm";
import { boolean, index, int, mysqlEnum, mysqlTable, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { restaurant } from '../scripts/seedData';
import { tblRestaurant } from './restaurant';
import { tblReservationHolding } from './reservation/reservation-holding';


//room table

export const tblRoom = mysqlTable('room', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    order: int('order').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    isWaitingRoom: boolean('is_waiting_room').default(false),
    layoutWidth: int('layout_width').notNull().default(1200),
    layoutRowHeight: int('layout_row_height').notNull().default(120),
}, (table) => ({
    // Index for room status lookups
    roomStatusIdx: index('idx_room_status').on(table.restaurantId, table.isActive, table.isWaitingRoom),
}));
export const roomRelations = relations(tblRoom, ({ one, many }) => ({
    tables: many(tblTable),
    translations: many(tblRoomTranslation),
    restaurant: one(tblRestaurant, { fields: [tblRoom.restaurantId], references: [tblRestaurant.id] }),
}));

export const tblRoomTranslation = mysqlTable('room_translation', {
    id: int('id').autoincrement().primaryKey(),
    roomId: int('room_id').notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 256 }),
    languageId: int('language_id').notNull(),
}
    , (t) => ({
        unq: unique('unique_room_translation').on(t.languageId, t.roomId),
    }));
export const roomTranslationRelations = relations(tblRoomTranslation, ({ one, many }) => ({
    room: one(tblRoom, { fields: [tblRoomTranslation.roomId], references: [tblRoom.id] }),
}));

export type TRoom = typeof tblRoom.$inferSelect
export type TRoomInsert = typeof tblRoom.$inferInsert

export type TRoomTranslation = typeof tblRoomTranslation.$inferSelect
export type TRoomTranslationInsert = typeof tblRoomTranslation.$inferInsert

export type TRoomInsertWithTranslations = Omit<TRoomInsert, 'id'|'isActive'> & {
    translations: Omit<TRoomTranslation, 'roomId' | 'id'>[]
}
export type TRoomUpdateWithTranslations = Omit<TRoom, 'id' | 'restaurantId'|'isActive'> & {
    translations: Omit<TRoomTranslation, 'roomId' | 'id'>[]
}

export type TRoomWithTranslations = TRoom & {
    translations: TRoomTranslation[]
}

// { i: "a", x: 0, y: 0, w: 1, h: 1, minW: 1, maxW: 1 },

export const tblTable = mysqlTable('table', {
    id: int('id').autoincrement().primaryKey(),
    roomId: int('room_id').notNull(),
    no: varchar('no', { length: 256 }).notNull(),
    order: int('order').notNull(),
    minCapacity: int('min_capacity').notNull(),
    maxCapacity: int('max_capacity').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    shape: mysqlEnum('shape', getEnumValues(EnumTableShape)).notNull().default(EnumTableShape.rectangle),
    isActive: boolean('is_active').notNull().default(true),
    

    x: int('x').default(0),
    y: int('y').default(0),
    h: int('h').default(1),
    w: int('w').default(1),
}, (table) => ({
    unq: unique('unique_table').on(table.roomId, table.no),
    // Index for table status lookups
    tableStatusIdx: index('idx_table_status').on(table.roomId, table.isActive),
}));
export const tableRelations = relations(tblTable, ({ one, many }) => ({
    room: one(tblRoom, { fields: [tblTable.roomId], references: [tblRoom.id] }),
    reservationHolding: one(tblReservationHolding, { fields: [tblTable.id], references: [tblReservationHolding.holdedTableId] }),
}));


export type TTable = typeof tblTable.$inferSelect
export type TTableInsert = typeof tblTable.$inferInsert




