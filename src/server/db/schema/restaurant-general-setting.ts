import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, unique } from 'drizzle-orm/mysql-core';
import { tblCountry, tblLanguage, tblMeal, tblReserVationStatus, TMeal } from './predefined';
import { tblRestaurantLanguage, tblRestaurant } from './restaurant';
import { EnumTableViewType } from '@/shared/enums/predefined-enums';
import { getEnumValues } from '@/server/utils/server-utils';



export const tblRestaurantGeneralSetting = mysqlTable('restaurant_general_setting', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),

    //general settings
    isAutoCheckOut: boolean('is_auto_check_out').$default(() => false).notNull(),
    newReservationStatusId: int('new_reservation_state_id').notNull(),
    defaultLanguageId: int('default_language_id').notNull(),
    defaultCountryId: int('default_country_id').notNull(),
    tableView: mysqlEnum('table_view', getEnumValues(EnumTableViewType)).default(EnumTableViewType.standartTable).notNull(),

},);

export const tblRestaurantGeneralSettingRelations = relations(tblRestaurantGeneralSetting, ({ one, many }) => ({

    //general settings
    //many
    meals: many(tblRestaurantGeneralSettingToMeal),

    //one
    restaurant: one(tblRestaurant, { fields: [tblRestaurantGeneralSetting.restaurantId], references: [tblRestaurant.id] }),
    newReservationState: one(tblReserVationStatus, { fields: [tblRestaurantGeneralSetting.newReservationStatusId], references: [tblReserVationStatus.id] }),
    defaultLanguage: one(tblRestaurantLanguage, { fields: [tblRestaurantGeneralSetting.defaultLanguageId], references: [tblRestaurantLanguage.id] }),
    defaultCountry: one(tblCountry, { fields: [tblRestaurantGeneralSetting.defaultCountryId], references: [tblCountry.id] }),

    
}));

export const tblRestaurantGeneralSettingToMeal = mysqlTable('restaurant_general_setting_to_meal', {
    id: int('id').autoincrement().primaryKey(),
    mealId: int('meal_id').notNull(),
    restaurantSettingId: int('restaurant_general_setting_id').notNull(),
}, (t) => ({
    unq: unique('unique_meal_and_rst_sttng').on(t.mealId, t.restaurantSettingId),
}));
export const tblRestaurantGeneralSettingToMealRelations = relations(tblRestaurantGeneralSettingToMeal, ({ one }) => ({
    meal: one(tblMeal, { fields: [tblRestaurantGeneralSettingToMeal.mealId], references: [tblMeal.id] }),
    restaurantSetting: one(tblRestaurantGeneralSetting, { fields: [tblRestaurantGeneralSettingToMeal.restaurantSettingId], references: [tblRestaurantGeneralSetting.id] }),
}));



export type TRestaurantGeneralSetting = typeof tblRestaurantGeneralSetting.$inferSelect
export type TRestaurantGeneralSettingInsert = typeof tblRestaurantGeneralSetting.$inferInsert

export type TRestaurantGeneralSettingToMeal = typeof tblRestaurantGeneralSettingToMeal.$inferSelect
export type TRestaurantGeneralSettingToMealInsert = typeof tblRestaurantGeneralSettingToMeal.$inferInsert






type GeneralSettingUpdate = Omit<TRestaurantGeneralSetting, 'id'|'restaurantId'> & {
    meals: number[]
}
export type TUpdateGeneralSetting = Partial<GeneralSettingUpdate> 