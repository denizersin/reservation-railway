import * as userSchema from "./user"

import * as restaurantSchema from "@/server/db/schema/restaurant"

import * as restaurantSettingSchema from "./restaurant-general-setting"

import * as  predefinedTablesShema from "./predefined"


export const schema = {
    ...userSchema,
    ...restaurantSchema,
    ...restaurantSettingSchema,
    ...predefinedTablesShema
}














