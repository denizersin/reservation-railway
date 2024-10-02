import * as userSchema from "./user"

import * as restaurantSchema from "@/server/db/schema/restaurant"

import * as restaurantSettingSchema from "./restaurant-general-setting"

import * as  predefinedTablesShema from "./predefined"

import * as restaurantTagSchema from "./restaurant-tags"
import * as restaurantAssetsSchemas from "./restaurant-assets"

import * as reservationMessagesSchema from "./reservation-message"

import * as provisionMessagesSchema from "./provision-message"

import * as waitlistMessagesSchema from "./waitlist-message"

import * as restaurantTextsSchema from "./restaurant-texts"


import * as prepaymentMessageSchema from './prepayment-message';

export const schema = {
    ...userSchema,
    ...restaurantSchema,
    ...restaurantSettingSchema,
    ...predefinedTablesShema,
    ...restaurantTagSchema,
    ...restaurantAssetsSchemas,
    ...reservationMessagesSchema,
    ...provisionMessagesSchema,
    ...waitlistMessagesSchema,
    ...prepaymentMessageSchema,
    ...restaurantTextsSchema
}














