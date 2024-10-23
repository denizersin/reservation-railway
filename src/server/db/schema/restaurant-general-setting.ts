import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable, unique } from 'drizzle-orm/mysql-core';
import { tblCountry, tblLanguage, tblMeal, tblReserVationStatus, TMeal } from './predefined';
import { tblRestaurantLanguage, tblRestaurant } from './restaurant';
import { EnumDays, EnumTableViewType } from '@/shared/enums/predefined-enums';
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

    //financial settings
    prePayemntPricePerGuest: int('prepayment_price_per_guest').$default(() => 0).notNull(),

},);

export const tblRestaurantGeneralSettingRelations = relations(tblRestaurantGeneralSetting, ({ one, many }) => ({

    //general settings
    //many

    //one
    restaurant: one(tblRestaurant, { fields: [tblRestaurantGeneralSetting.restaurantId], references: [tblRestaurant.id] }),
    newReservationState: one(tblReserVationStatus, { fields: [tblRestaurantGeneralSetting.newReservationStatusId], references: [tblReserVationStatus.id] }),
    defaultLanguage: one(tblRestaurantLanguage, { fields: [tblRestaurantGeneralSetting.defaultLanguageId], references: [tblRestaurantLanguage.id] }),
    defaultCountry: one(tblCountry, { fields: [tblRestaurantGeneralSetting.defaultCountryId], references: [tblCountry.id] }),


}));





export type TRestaurantGeneralSetting = typeof tblRestaurantGeneralSetting.$inferSelect
export type TRestaurantGeneralSettingInsert = typeof tblRestaurantGeneralSetting.$inferInsert







type TGeneralSettingUpdate = Omit<TRestaurantGeneralSetting, 'id' | 'restaurantId'> & {}
export type TUpdateGeneralSetting = Partial<TGeneralSettingUpdate> 