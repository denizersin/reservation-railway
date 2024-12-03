import { getEnumValues } from '@/server/utils/server-utils';
import { EnumDays, EnumMeals } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, index, int, mysqlEnum, mysqlTable, text, time, timestamp, unique } from 'drizzle-orm/mysql-core';
import { tblRestaurant } from './restaurant';
import { tblMeal } from './predefined';
import { tblRoom } from './room';


export const tblReservationLimitation = mysqlTable('reservation_limitation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    day: mysqlEnum('day', getEnumValues(EnumDays)), //not required if null then all days
    mealId: int('meal_id').notNull(),
    roomId: int('room_id'), //not required
    hour:time('hour').notNull(),
    minHour: time('min_hour').notNull(),
    maxHour: time('max_hour').notNull(),
    maxTableCount: int('max_table_count').notNull(),
    maxGuestCount: int('max_guest_count').notNull(),
    isDaily: boolean('is_daily').notNull().default(false),
    createdAt:timestamp('created_at').defaultNow().notNull(),


}, (t) => ({
    limitationLookupIdx: index('idx_limitation_lookup').on( t.hour, t.roomId, t.isActive,t.restaurantId, t.mealId,),
}));
export const tblReservationLimitationRelations = relations(tblReservationLimitation, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblReservationLimitation.restaurantId], references: [tblRestaurant.id] }),
    meal: one(tblMeal, { fields: [tblReservationLimitation.mealId], references: [tblMeal.id] }),
    room: one(tblRoom, { fields: [tblReservationLimitation.roomId], references: [tblRoom.id] }),
}));

export type TReservationLimitation = typeof tblReservationLimitation.$inferSelect;
export type TReservationLimitationInsert = typeof tblReservationLimitation.$inferInsert;



export const tblPermanentLimitation= mysqlTable('permanent_limitation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    roomId: int('room_id'), //not required
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
}, (t) => ({
    // unq: unique('unique_permanent_limitation').on(t.restaurantId, t.roomId),
}));


export const permanentLimitationRelations = relations(tblPermanentLimitation, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblPermanentLimitation.restaurantId], references: [tblRestaurant.id] }),
    room: one(tblRoom, { fields: [tblPermanentLimitation.roomId], references: [tblRoom.id] }),
}));

export type TPermanentLimitation = typeof tblPermanentLimitation.$inferSelect;
export type TPermanentLimitationInsert = typeof tblPermanentLimitation.$inferInsert;


