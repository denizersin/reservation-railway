import { relations } from "drizzle-orm";
import { int, mysqlTable, unique, varchar } from "drizzle-orm/mysql-core";


export const tblRestaurantTag = mysqlTable('restaurant_tags', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
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
    restaurant: one(tblRestaurantTag, { fields: [tblRestaurantTag.restaurantId], references: [tblRestaurantTag.id] }),
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
    translations: TRestaurantTagInsretWithTranslationsInsert['translations']
}
