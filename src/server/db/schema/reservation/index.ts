import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, text, time, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblRestaurant } from '../restaurant';
import { tblRoom, tblTable } from '../room';
import { tblGuest } from '../guest';
import { tblMeal } from '../predefined';
import { tblPrepayment } from './prepayment';
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumReservationPrepaymentType } from '@/shared/enums/predefined-enums';


export const tblReservation = mysqlTable('reservation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    roomId: int('room_id').notNull(),
    guestId: int('guest_id').notNull(),
    mealId: int('restaurant_meal_id').notNull(),

    prepaymentId: int('prepayment_id'),

    mainReservationId: int('main_reservation_id').notNull().default(0),

    reservationDate: timestamp('reservation_date').notNull(),
    hour: time('reservation_time').notNull(),
    guestCount: int('guest_count').notNull(),
    prePaymentType: mysqlEnum('prepayment_type', getEnumValues(EnumReservationPrepaymentType)).notNull(),
    isSendSms: boolean('is_send_sms').notNull(),
    isSendEmail: boolean('is_send_email').notNull(),

    isMainReservation: boolean('is_main_reservation').default(true).notNull(),

    waitingSessionId: int('waiting_session_id'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (t) => ({

}));

export const tblReservationTables = mysqlTable('reservation_tables', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    mainReservationId: int('main_reservation_id').notNull(),
    tableId: int('table_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});
export const tblReservationTableRelations = relations(tblReservationTables, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationTables.reservationId], references: [tblReservation.id] }),
    table: one(tblTable, { fields: [tblReservationTables.tableId], references: [tblTable.id] }),
}));

export const tblReservationRelations = relations(tblReservation, ({ one, many }) => ({
    tables: many(tblReservationTables),
    linkedReservations: many(tblLinkedReservations, { relationName: 'mainReservation' }),

    mainReservation: one(tblLinkedReservations, { fields: [tblReservation.id], references: [tblLinkedReservations.linkedReservationId], relationName: 'linkedReservation' }),

    waitingSession: one(waitingTableSession, { fields: [tblReservation.waitingSessionId], references: [waitingTableSession.id] }),

    restaurant: one(tblRestaurant, { fields: [tblReservation.restaurantId], references: [tblRestaurant.id] }),
    room: one(tblRoom, { fields: [tblReservation.roomId], references: [tblRoom.id] }),
    meal: one(tblMeal, { fields: [tblReservation.mealId], references: [tblMeal.id] }),
    guest: one(tblGuest, { fields: [tblReservation.guestId], references: [tblGuest.id] }),

    //nullable relations
    prepayment: one(tblPrepayment, { fields: [tblReservation.prepaymentId], references: [tblPrepayment.id] }),

}));


export const tblLinkedReservations = mysqlTable('linked_reservations', {
    id: int('id').autoincrement().primaryKey(),
    mainReservationId: int('main_reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    linkedReservationId: int('linked_reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (t) => ({
    uniqLinkedReservation: unique('linked-rsv-link').on(t.mainReservationId, t.linkedReservationId),
}));
export const tblLinkedReservationsRelations = relations(tblLinkedReservations, ({ one }) => ({
    mainReservation: one(tblReservation, { fields: [tblLinkedReservations.mainReservationId], references: [tblReservation.id], relationName: 'mainReservation' }),
    linkedReservation: one(tblReservation, { fields: [tblLinkedReservations.linkedReservationId], references: [tblReservation.id], relationName: 'linkedReservation' }),
}));


export const waitingTableSession = mysqlTable('waiting_table_session', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id').notNull().references(() => tblReservation.id, { onDelete: 'cascade' }),
    tableId: int('table_id').notNull().references(() => tblTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});
export const waitingTableSessionRelations = relations(waitingTableSession, ({ one }) => ({
    reservation: one(tblReservation, { fields: [waitingTableSession.reservationId], references: [tblReservation.id] }),
    table: one(tblTable, { fields: [waitingTableSession.tableId], references: [tblTable.id] }),
}));



type ReservationSelect = typeof tblReservation.$inferSelect;
type ReservationInsert = typeof tblReservation.$inferInsert;



export type TReservation = ReservationSelect & {
    tables: typeof tblReservationTables.$inferSelect[]
    restaurant: typeof tblRestaurant.$inferSelect
    room: typeof tblRoom.$inferSelect
    meal: typeof tblMeal.$inferSelect
    guest: typeof tblGuest.$inferSelect
};

export type TReservationInsert = ReservationInsert & {
    tableIds: number[]
}

