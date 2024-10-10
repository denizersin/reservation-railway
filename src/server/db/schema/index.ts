import * as userSchema from "./user"

import * as restaurantSchema from "@/server/db/schema/restaurant"

import * as restaurantSettingSchema from "./restaurant-general-setting"

import * as  predefinedTablesShema from "./predefined"

import * as restaurantTagSchema from "./restaurant-tags"
import * as restaurantAssetsSchemas from "./restaurant-assets"


// import * as provisionMessagesSchema from "./provision-message"

// import * as waitlistMessagesSchema from "./waitlist-message"

import * as restaurantTextsSchema from "./restaurant-texts"


// import * as prepaymentMessageSchema from './prepayment-message';

import * as roomSchema from './room';

import * as reservationLimitationSchema from './resrvation_limitation';

import * as reservationSchema from './reservation';

import * as guestSchema from './guest';
export const schema = {
    ...userSchema,
    ...restaurantSchema,
    ...restaurantSettingSchema,
    ...predefinedTablesShema,
    ...restaurantTagSchema,
    ...restaurantAssetsSchemas,
    // ...provisionMessagesSchema,
    // ...waitlistMessagesSchema,
    // ...prepaymentMessageSchema,
    ...restaurantTextsSchema,
    ...roomSchema,
    ...reservationLimitationSchema,
    ...reservationSchema,
    ...guestSchema

}














