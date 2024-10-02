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