import * as userSchema from "./user"

import * as restaurantSchema from "@/server/db/schema/restaurant"

import * as restaurantSettingSchema from "./restaurant-general-setting"

import * as  predefinedTablesShema from "./predefined"

import * as restaurantTagSchema from "./restaurant-tags"


export const schema = {
    ...userSchema,
    ...restaurantSchema,
    ...restaurantSettingSchema,
    ...predefinedTablesShema,
    ...restaurantTagSchema
}














