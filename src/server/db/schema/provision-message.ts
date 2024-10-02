import { relations } from 'drizzle-orm';
import { int, mysqlTable, text, unique } from 'drizzle-orm/mysql-core';
import { tblLanguage } from './predefined';
import { tblRestaurant } from './restaurant';

export const tblProvisionMessage = mysqlTable('provision_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    provisionMessage: text('provision_message'),
    provisionReminderMessage: text('provision_reminder_message'),
    provisionReceivedMessage: text('provision_received_message'),
    provisionCancellationMessage: text('provision_cancellation_message'),
    provisionRefundMessage: text('provision_refund_message'),
    provisionChargeMessage: text('provision_charge_message'),
    chargeRefundMessage: text('charge_refund_message'),
}, (t) => ({
    unq: unique('unique_provision_message').on(t.restaurantId, t.languageId),
}));

export const tblProvisionMessageRelations = relations(tblProvisionMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblProvisionMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblProvisionMessage.languageId], references: [tblLanguage.id] }),
}));

export type TProvisionMessage = typeof tblProvisionMessage.$inferSelect;
export type TProvisionMessageInsert = typeof tblProvisionMessage.$inferInsert;