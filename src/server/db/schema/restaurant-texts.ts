import { int, mysqlTable, text, unique } from 'drizzle-orm/mysql-core';
import { tblRestaurant } from './restaurant';
import { relations } from 'drizzle-orm';
import { tblLanguage } from './predefined';



export const tblRestaurantTexts = mysqlTable('restaurant_texts', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    reservationRequirements: text('reservation_requirements'),
    dressCode: text('dress_code'),
    agreements: text('agreements'),
    
}, (t) => ({
    unq: unique('unique_restaurant_texts').on(t.restaurantId, t.languageId),
}));

export const tblRestaurantTextsRelations = relations(tblRestaurantTexts, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblRestaurantTexts.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblRestaurantTexts.languageId], references: [tblLanguage.id] }),
}));


export type TRestaurantTexts = typeof tblRestaurantTexts.$inferSelect;
export type TRestaurantTextsInsert = typeof tblRestaurantTexts.$inferInsert;




export const tblReservationMessage = mysqlTable('reservation_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    newReservationMessage: text('new_reservation_message').notNull().default('message'),
    dateTimeChangeMessage: text('date_time_change_message').notNull().default('message'),
    guestCountChangeMessage: text('guest_count_change_message').notNull().default('message'),
    reservationCancellationMessage: text('reservation_cancellation_message').notNull().default('message'),
    reservationCancellationWithReasonMessage: text('reservation_cancellation_with_reason_message').notNull().default('message'),
    reservationConfirmationRequestMessage: text('reservation_confirmation_request_message').notNull().default('message'),
    reservationConfirmedMessage: text('reservation_confirmed_message').notNull().default('message'),
    reservationReminderMessage: text('reservation_reminder_message').notNull().default('message'),
    reservationFeedbackRequestMessage: text('reservation_feedback_request_message').notNull().default('message'),
    cakeReceivedMessage: text('cake_received_message').notNull().default('message'),
    flowerReceivedMessage: text('flower_received_message').notNull().default('message'),
}, (t) => ({
    unq: unique('unique_reservation_message').on(t.restaurantId, t.languageId),
}));

export const tblReservationMessageRelations = relations(tblReservationMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblReservationMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblReservationMessage.languageId], references: [tblLanguage.id] }),
}));


export type TReservationMessage = typeof tblReservationMessage.$inferSelect;
export type TReservationMessageInsert = typeof tblReservationMessage.$inferInsert;






export const tblPrepaymentMessage = mysqlTable('prepayment_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    prepaymentMessage: text('prepayment_message').notNull().default('message'),
    prepaymentCancellationMessage: text('prepayment_cancellation_message').notNull().default('message'),
    prepaymentReminderMessage: text('prepayment_reminder_message').notNull().default('message'),
    prepaymentRefundMessage: text('prepayment_refund_message').notNull().default('message'),
    prepaymentReceivedMessage: text('prepayment_received_message').notNull().default('message'),
    accountPaymentRequestMessage: text('account_payment_request_message').notNull().default('message'),
    accountPaymentSuccessMessage: text('account_payment_success_message').notNull().default('message'),
}, (t) => ({
    unq: unique('unique_prepayment_message').on(t.restaurantId, t.languageId),
}));

export const tblPrepaymentMessageRelations = relations(tblPrepaymentMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblPrepaymentMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblPrepaymentMessage.languageId], references: [tblLanguage.id] }),
}));

export type TPrepaymentMessage = typeof tblPrepaymentMessage.$inferSelect;
export type TPrepaymentMessageInsert = typeof tblPrepaymentMessage.$inferInsert;





export const tblProvisionMessage = mysqlTable('provision_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    provisionMessage: text('provision_message').notNull().default('message'),
    provisionReminderMessage: text('provision_reminder_message').notNull().default('message'),
    provisionReceivedMessage: text('provision_received_message').notNull().default('message'),
    provisionCancellationMessage: text('provision_cancellation_message').notNull().default('message'),
    provisionRefundMessage: text('provision_refund_message').notNull().default('message'),
    provisionChargeMessage: text('provision_charge_message').notNull().default('message'),
    chargeRefundMessage: text('charge_refund_message').notNull().default('message'),
}, (t) => ({
    unq: unique('unique_provision_message').on(t.restaurantId, t.languageId),
}));

export const tblProvisionMessageRelations = relations(tblProvisionMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblProvisionMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblProvisionMessage.languageId], references: [tblLanguage.id] }),
}));

export type TProvisionMessage = typeof tblProvisionMessage.$inferSelect;
export type TProvisionMessageInsert = typeof tblProvisionMessage.$inferInsert;




export const tblWaitlistMessage = mysqlTable('waitlist_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    addedToWaitlistMessage: text('added_to_waitlist_message').notNull().default('message'),
    addedToWaitlistWalkinMessage: text('added_to_waitlist_walkin_message').notNull().default('message'),
    calledFromWaitlistMessage: text('called_from_waitlist_message').notNull().default('message'),
    cancelWaitlistMessage: text('cancel_waitlist_message').notNull().default('message'),
}, (t) => ({
    unq: unique('unique_waitlist_message').on(t.restaurantId, t.languageId),
}));

export const tblWaitlistMessageRelations = relations(tblWaitlistMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblWaitlistMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblWaitlistMessage.languageId], references: [tblLanguage.id] }),
}));

export type TWaitlistMessage = typeof tblWaitlistMessage.$inferSelect;
export type TWaitlistMessageInsert = typeof tblWaitlistMessage.$inferInsert;




