import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReviewSendDay, EnumReviewSendType } from "@/shared/enums/predefined-enums";
import { relations } from "drizzle-orm";
import { boolean, int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { tblRestaurant } from "..";

export const tblRestaurantReviewSettings = mysqlTable('restaurant_review_settings', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isReviewEnabled: boolean('is_review_enabled').notNull().default(false),
    reviewSendTime: varchar('review_send_time', { length: 5 }).notNull(),
    reviewSendType: mysqlEnum('review_send_type', getEnumValues(EnumReviewSendType)).notNull().default(EnumReviewSendType.SMS),
    reviewSendDay: mysqlEnum('review_send_day', getEnumValues(EnumReviewSendDay)).notNull().default(EnumReviewSendDay.CHECK_OUT_DAY),

})


export const restaurantReviewSettingsRelations = relations(tblRestaurantReviewSettings, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblRestaurantReviewSettings.restaurantId], references: [tblRestaurant.id] })
}))


export type TRestaurantReviewSettings = typeof tblRestaurantReviewSettings.$inferSelect
export type TNewRestaurantReviewSettings = typeof tblRestaurantReviewSettings.$inferInsert





export const tblRestaurantReview = mysqlTable('restaurant_review', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    order: int('order').notNull().default(0),
})


export const restaurantReviewRelations = relations(tblRestaurantReview, ({ one, many }) => ({
    restaurant: one(tblRestaurant, { fields: [tblRestaurantReview.restaurantId], references: [tblRestaurant.id] }),
    translations: many(tblRestaurantReviewTranslation)
}))

export const tblRestaurantReviewTranslation = mysqlTable('restaurant_review_translation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantReviewId: int('restaurant_review_id').notNull(),
    languageId: int('language_id').notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
})

export const restaurantReviewTranslationRelations = relations(tblRestaurantReviewTranslation, ({ one }) => ({
    restaurantReview: one(tblRestaurantReview, { fields: [tblRestaurantReviewTranslation.restaurantReviewId], references: [tblRestaurantReview.id] })
}))


 export type TRestaurantReview = typeof tblRestaurantReview.$inferSelect
 export type TRestaurantReviewInsert = typeof tblRestaurantReview.$inferInsert

 export type TRestaurantReviewTranslation = typeof tblRestaurantReviewTranslation.$inferSelect
 export type TRestaurantReviewTranslationInsert = typeof tblRestaurantReviewTranslation.$inferInsert


 export type TRestaurantReviewWithTranslations = TRestaurantReview & {
    translations: TRestaurantReviewTranslation[]
 }

 export type TRestaurantReviewWithTranslationsInsert = {
    review: TRestaurantReviewInsert
    translations: Omit<TRestaurantReviewTranslationInsert, 'restaurantReviewId'>[]
 }

 export type TRestaurantReviewWithTranslationsUpdate = {
    review: Partial<TRestaurantReviewInsert>
    translations: Omit<TRestaurantReviewTranslationInsert, 'restaurantReviewId'>[]
 }