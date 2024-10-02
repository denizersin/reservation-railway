import { relations } from 'drizzle-orm';
import { int, mysqlTable, text, unique } from 'drizzle-orm/mysql-core';
import { tblLanguage } from './predefined';
import { tblRestaurant } from './restaurant';

export const tblPrepaymentMessage = mysqlTable('prepayment_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    prepaymentMessage: text('prepayment_message'),
    prepaymentCancellationMessage: text('prepayment_cancellation_message'),
    prepaymentReminderMessage: text('prepayment_reminder_message'),
    prepaymentRefundMessage: text('prepayment_refund_message'),
    prepaymentReceivedMessage: text('prepayment_received_message'),
    accountPaymentRequestMessage: text('account_payment_request_message'),
    accountPaymentSuccessMessage: text('account_payment_success_message'),
}, (t) => ({
    unq: unique('unique_prepayment_message').on(t.restaurantId, t.languageId),
}));

export const tblPrepaymentMessageRelations = relations(tblPrepaymentMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblPrepaymentMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblPrepaymentMessage.languageId], references: [tblLanguage.id] }),
}));

export type TPrepaymentMessage = typeof tblPrepaymentMessage.$inferSelect;
export type TPrepaymentMessageInsert = typeof tblPrepaymentMessage.$inferInsert;