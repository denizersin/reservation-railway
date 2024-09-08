import * as userSchema from "./user"

import * as restaurantSchema from "./restaurant"

import * as restaurantSettingSchema from "./restaurant-setting"


export const schema = {
    ...userSchema,
    ...restaurantSchema,
    ...restaurantSettingSchema,
}
