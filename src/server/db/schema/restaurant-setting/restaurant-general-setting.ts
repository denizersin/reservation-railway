import { getEnumValues } from '@/server/utils/server-utils';
import { EnumReservationStatusNumeric, EnumTableViewType } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlEnum, mysqlTable } from 'drizzle-orm/mysql-core';
import { tblCountry } from '../predefined';
import { tblReserVationStatus } from '../reservation/reservation-status';
import { tblRestaurant, tblRestaurantLanguage } from '../restaurant';
import { tblRestaurantTag } from '../restaurant-tags';



export const tblRestaurantGeneralSetting = mysqlTable('restaurant_general_setting', {
    id: int('id').autoincrement().primaryKey(),

    //general settings
    isAutoCheckOut: boolean('is_auto_check_out').$default(() => false).notNull(),
    newReservationStatusId: int('new_reservation_state_id').notNull().default(EnumReservationStatusNumeric.reservation),
    defaultLanguageId: int('default_language_id').notNull(),
    defaultCountryId: int('default_country_id').notNull(),
    tableView: mysqlEnum('table_view', getEnumValues(EnumTableViewType)).default(EnumTableViewType.standartTable).notNull(),

    
    

},);

export const tblRestaurantGeneralSettingRelations = relations(tblRestaurantGeneralSetting, ({ one, many }) => ({

    //general settings
    //many

    //one
    newReservationState: one(tblReserVationStatus, { fields: [tblRestaurantGeneralSetting.newReservationStatusId], references: [tblReserVationStatus.id] }),
    defaultLanguage: one(tblRestaurantLanguage, { fields: [tblRestaurantGeneralSetting.defaultLanguageId], references: [tblRestaurantLanguage.id] }),
    defaultCountry: one(tblCountry, { fields: [tblRestaurantGeneralSetting.defaultCountryId], references: [tblCountry.id] }),


}));





export type TRestaurantGeneralSetting = typeof tblRestaurantGeneralSetting.$inferSelect
export type TRestaurantGeneralSettingInsert = typeof tblRestaurantGeneralSetting.$inferInsert







type TGeneralSettingUpdate = Omit<TRestaurantGeneralSetting, 'id' | 'restaurantId'> & {}
export type TUpdateGeneralSetting = Partial<TGeneralSettingUpdate> 