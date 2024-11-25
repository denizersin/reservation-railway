import { boolean, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { tblRestaurant } from "..";
import { relations } from "drizzle-orm";






export const tblRestaurantReview = mysqlTable('restaurant_review', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isActive: boolean('is_active').notNull().default(true),
})


export const restaurantReviewRelations = relations(tblRestaurantReview, ({ one }) => ({
    restaurant: one(tblRestaurant, { fields: [tblRestaurantReview.restaurantId], references: [tblRestaurant.id] })
}))

export const tblRestaurantReviewTranslation = mysqlTable('restaurant_review_translation', {
    id: int('id').autoincrement().primaryKey(),
    restaurantReviewId: int('restaurant_review_id').notNull(),
    languageId: int('language_id').notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    description: varchar('description', { length: 256 }).notNull(),
})



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
    id: number,
    translations: TRestaurantReviewWithTranslationsInsert['translations']
 }
