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