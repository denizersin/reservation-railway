import { getEnumValues } from '@/server/utils/server-utils';
import { EnumWaitlistStatus } from '@/shared/enums/predefined-enums';
import { boolean, index, int, json, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblGuest, TGuest } from './guest';
import { relations } from 'drizzle-orm';
import { tblRestaurant, tblWaitlistNotification } from '.';


export const tblWaitlist = mysqlTable('waitlist', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    status: mysqlEnum('status', getEnumValues(EnumWaitlistStatus)).notNull().default(EnumWaitlistStatus.created),

    allergenWarning: boolean('allergen_warning').notNull().default(false),
    guestNote: text('guest_note'),
    reservationTagIds: json('reservation_tags').$type<string[]>().notNull(),

    guestId: int('guest_id').notNull(),
    mealId: int('meal_id').notNull(),
    waitlistDate: timestamp('waitlist_date').notNull(),
    guestCount: int('guest_count').notNull(),

    assignedReservationId: int('assigned_reservation_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
})

export const tblWaitlistRelations = relations(tblWaitlist, ({ one, many }) => ({
    guest: one(tblGuest, {
        fields: [tblWaitlist.guestId],
        references: [tblGuest.id]
    }),
    restaurant: one(tblRestaurant, {
        fields: [tblWaitlist.restaurantId],
        references: [tblRestaurant.id]
    }),
    notifications: many(tblWaitlistNotification)
}))

export type TWaitlist = typeof tblWaitlist.$inferSelect
export type TWaitlistInsert = typeof tblWaitlist.$inferInsert
export type WaitlistWithGuest = TWaitlist & { guest: TGuest }