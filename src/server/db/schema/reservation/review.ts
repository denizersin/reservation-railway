import { relations } from "drizzle-orm";
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";
import { tblReservation } from ".";
import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReviewStatus } from "@/shared/enums/predefined-enums";

export const tblReservationReview = mysqlTable('reservation_review', {
    id: int('id').autoincrement().primaryKey(),
    reservationId: int('reservation_id'),
    guestId: int('guest_id').notNull(),
    restaurantId: int('restaurant_id').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at'),
    status: mysqlEnum('status', getEnumValues(EnumReviewStatus)).notNull().default(EnumReviewStatus.NOT_SENT),
    guestReview: text('guest_review'),
    reviewScore: int('review_score'),
})

export const reservationReviewRelations = relations(tblReservationReview, ({ one }) => ({
    reservation: one(tblReservation, { fields: [tblReservationReview.reservationId], references: [tblReservation.id] }),
}))

export type TReservationReview = typeof tblReservationReview.$inferSelect
export type TNewReservationReview = typeof tblReservationReview.$inferInsert

export const tblReviewRating = mysqlTable('review_rating', {
    id: int('id').autoincrement().primaryKey(),
    reservationReviewId: int('reservation_review_id').notNull(),
    rating: int('rating').notNull(),
    restaurantReviewId: int('restaurant_review_id').notNull(),
})

export const reviewRatingRelations = relations(tblReviewRating, ({ one }) => ({
    reservationReview: one(tblReservationReview, { fields: [tblReviewRating.reservationReviewId], references: [tblReservationReview.id] }),
}))

export type TReviewRating = typeof tblReviewRating.$inferSelect
export type TNewReviewRating = typeof tblReviewRating.$inferInsert