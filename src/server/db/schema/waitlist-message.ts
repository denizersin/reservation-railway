import { relations } from 'drizzle-orm';
import { int, mysqlTable, text, unique } from 'drizzle-orm/mysql-core';
import { tblLanguage } from './predefined';
import { tblRestaurant } from './restaurant';

export const tblWaitlistMessage = mysqlTable('waitlist_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    addedToWaitlistMessage: text('added_to_waitlist_message'),
    addedToWaitlistWalkinMessage: text('added_to_waitlist_walkin_message'),
    calledFromWaitlistMessage: text('called_from_waitlist_message'),
}, (t) => ({
    unq: unique('unique_waitlist_message').on(t.restaurantId, t.languageId),
}));

export const tblWaitlistMessageRelations = relations(tblWaitlistMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblWaitlistMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblWaitlistMessage.languageId], references: [tblLanguage.id] }),
}));

export type TWaitlistMessage = typeof tblWaitlistMessage.$inferSelect;
export type TWaitlistMessageInsert = typeof tblWaitlistMessage.$inferInsert;