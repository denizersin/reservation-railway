import { relations } from "drizzle-orm";
import { int, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

import { tblRestaurant } from "../restaurant";
import { mysqlTable } from "drizzle-orm/mysql-core";
import { getEnumValues } from "@/server/utils/server-utils";
import { EnumPrepaymentAtNoShow } from "@/shared/enums/predefined-enums";

export const tblRestaurantPaymentSetting = mysqlTable('restaurant_payment_setting', {
    id: int('id').autoincrement().primaryKey(),


    prePaymentPricePerGuest: int('prepayment_price_per_guest').$default(() => 0).notNull(),

    //misafir geldiginde ödeme işlemi yapılıyorsa, bu ödemeye ne yapılır?
    convertPrepaymentToSale: boolean('convert_prepayment_to_sale').$default(() => true).notNull(),
    //misafir gelmeden önce ödeme iptali için kalan süre
    prepaymentCancellationHours: int('prepayment_cancellation_hours').$default(() => 72).notNull(),

    
    //misafir gelmezse ödeme nasıl işlenir?
    prepaymentAtNoShow: mysqlEnum('prepayment_at_no_show', getEnumValues(EnumPrepaymentAtNoShow)).$default(() => EnumPrepaymentAtNoShow.convertToSale).notNull(),

    notifyPrepaymentReminderHoursBefore: int('notify_prepayment_reminder_hours_before').default(4)
})


export type TRestaurantPaymentSettingSelect = typeof tblRestaurantPaymentSetting.$inferSelect
export type TRestaurantPaymentSettingInsert = typeof tblRestaurantPaymentSetting.$inferInsert

