import { getEnumValues } from '@/server/utils/server-utils';
import { EnumTableShape } from '@/shared/enums/predefined-enums';
import { is, relations } from "drizzle-orm";
import { boolean, int, mysqlEnum, mysqlTable, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';


//room table

export const tblRoom = mysqlTable('room', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isWaitingRoom: boolean('is_waiting_room').notNull().default(false),
    order: int('order').notNull(),
    isActive: boolean('is_active').notNull().default(true),
});
export const roomRelations = relations(tblRoom, ({ one, many }) => ({
    tables: many(tblTable),
    translations: many(tblRoomTranslation)
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

export type TRoomInsertWithTranslations = Omit<TRoom, 'id'|'isActive'> & {
    translations: Omit<TRoomTranslation, 'roomId' | 'id'>[]
}
export type TRoomUpdateWithTranslations = Omit<TRoom, 'id' | 'restaurantId'|'isActive'> & {
    translations: Omit<TRoomTranslation, 'roomId' | 'id'>[]
}

export type TRoomWithTranslations = TRoom & {
    translations: TRoomTranslation[]
}


export const tblTable = mysqlTable('table', {
    id: int('id').autoincrement().primaryKey(),
    roomId: int('room_id').notNull(),
    no: varchar('no', { length: 256 }).notNull(),
    order: int('order').notNull(),
    capacity: int('capacity').notNull(),
    minCapacity: int('min_capacity').notNull(),
    maxCapacity: int('max_capacity').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    shape: mysqlEnum('shape', getEnumValues(EnumTableShape)).notNull().default(EnumTableShape.rectangle),
    isActive: boolean('is_active').notNull().default(true),
}, (t) => ({
    unq: unique('unique_table').on(t.roomId, t.no),
}));
export const tableRelations = relations(tblTable, ({ one, many }) => ({
    room: one(tblRoom, { fields: [tblTable.roomId], references: [tblRoom.id] }),
}));


export type TTable = typeof tblTable.$inferSelect
export type TTableInsert = typeof tblTable.$inferInsert

