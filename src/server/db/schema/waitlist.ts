import { getEnumValues } from '@/server/utils/server-utils';
import { EnumWaitlistStatus } from '@/shared/enums/predefined-enums';
import { boolean, index, int, json, mysqlEnum, mysqlTable, text, time, timestamp, unique, varchar } from 'drizzle-orm/mysql-core';
import { tblGuest } from './guest';
import { relations } from 'drizzle-orm';


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
})

export const tblWaitlistRelations = relations(tblWaitlist, ({ one }) => ({
    guest: one(tblGuest, {
        fields: [tblWaitlist.guestId],
        references: [tblGuest.id]
    })
}))

export type TWaitlist = typeof tblWaitlist.$inferSelect
export type TWaitlistInsert = typeof tblWaitlist.$inferInsert