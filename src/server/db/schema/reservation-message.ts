import { relations } from 'drizzle-orm';
import { int, mysqlTable, text, unique } from 'drizzle-orm/mysql-core';
import { tblLanguage } from './predefined';
import { tblRestaurant } from './restaurant';

export const tblReservationMessage = mysqlTable('reservation_message', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    newReservationMessage: text('new_reservation_message'),
    dateTimeChangeMessage: text('date_time_change_message'),
    guestCountChangeMessage: text('guest_count_change_message'),
    reservationCancellationMessage: text('reservation_cancellation_message'),
    reservationCancellationWithReasonMessage: text('reservation_cancellation_with_reason_message'),
    reservationConfirmationRequestMessage: text('reservation_confirmation_request_message'),
    reservationConfirmedMessage: text('reservation_confirmed_message'),
    reservationReminderMessage: text('reservation_reminder_message'),
    reservationFeedbackRequestMessage: text('reservation_feedback_request_message'),
    cakeReceivedMessage: text('cake_received_message'),
    flowerReceivedMessage: text('flower_received_message'),
}, (t) => ({
    unq: unique('unique_reservation_message').on(t.restaurantId, t.languageId),
}));

export const tblReservationMessageRelations = relations(tblReservationMessage, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblReservationMessage.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblReservationMessage.languageId], references: [tblLanguage.id] }),
}));


export type TReservationMessage = typeof tblReservationMessage.$inferSelect;
export type TReservationMessageInsert = typeof tblReservationMessage.$inferInsert;