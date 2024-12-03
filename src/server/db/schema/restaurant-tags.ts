import { relations } from "drizzle-orm";
import { boolean, int, mysqlTable, unique, varchar } from "drizzle-orm/mysql-core";
import { tblRestaurant } from "./restaurant";


export const tblRestaurantTag = mysqlTable('restaurant_tags', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    isAvailable: boolean('is_available').$default(() => false).notNull(),
    color: varchar('color', { length: 10 }).notNull(),
}, (t) => ({
}));

export const tblRestaurantTagTranslation = mysqlTable('restaurant_tag_translation', {
    id: int('id').autoincrement().primaryKey(),
    tagId: int('tag_id').notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    code: varchar('code', { length: 10 }).notNull(),
    languageId: int('language_id').notNull(),
}, (t) => ({
    unq: unique('unique_tag_translation').on(t.tagId, t.languageId),
}));

export const restaurantTagRelations = relations(tblRestaurantTag, ({ one, many }) => ({
    translations: many(tblRestaurantTagTranslation),
    restaurant: one(tblRestaurant, { fields: [tblRestaurantTag.restaurantId], references: [tblRestaurant.id] }),
}));

export const restaurantTagTranslationRelations = relations(tblRestaurantTagTranslation, ({ one, many }) => ({
    tag: one(tblRestaurantTag, { fields: [tblRestaurantTagTranslation.tagId], references: [tblRestaurantTag.id] }),
}));



export type TRestaurantTag = typeof tblRestaurantTag.$inferSelect
export type TRestaurantTagInsert = typeof tblRestaurantTag.$inferInsert

export type TRestaurantTagTranslation = typeof tblRestaurantTagTranslation.$inferSelect
export type TRestaurantTagTranslationInsert = typeof tblRestaurantTagTranslation.$inferInsert



export type TRestaurantTagInsretWithTranslationsInsert = {
    tag: TRestaurantTagInsert
    translations: Omit<TRestaurantTagTranslationInsert, 'tagId'>[]
}

export type TRestaurantTagWithTranslations = TRestaurantTag & {
    translations: TRestaurantTagTranslation[]
}

export type TRestaurantTagWithTranslationsUpdate = {
    id: number,
    tag: Partial<Omit<TRestaurantTag, 'restaurantId'|'id'>>,
    translations: TRestaurantTagInsretWithTranslationsInsert['translations']
}
