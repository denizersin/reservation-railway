import { TUseCaseOwnerLayer } from "@/server/types/types";
import TRestaurantGeneralSettingValidator from "@/shared/validators/restaurant-setting/general";
import { restaurantGeneralSettingEntities } from "../../entities/restaurant-setting";
import { restaurantTagEntities } from "../../entities/restaurant-tag";
import { db } from "@/server/db";
import { tblRestaurantTag } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { inArray, notInArray } from "drizzle-orm";

export const updateRestaurantGeneralSetting = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TRestaurantGeneralSettingValidator.updateRestaurantGeneralSettingSchema>) => {

    const { restaurantId } = ctx
    const { generalSetting, availableLaTags, generalSettingID } = input

    const restaurantGeneralSetting = await restaurantGeneralSettingEntities.updateRestaurantGeneralSettings({
        generalSetting: { ...generalSetting },
        generalSettingID
    })


    db.transaction(async (trx) => {
        await trx.update(tblRestaurantTag).set({ isAvailable: false }).where(eq(tblRestaurantTag.restaurantId, restaurantId))
        if (availableLaTags.length > 0) {
            await trx.update(tblRestaurantTag).set({ isAvailable: true }).where(and(eq(tblRestaurantTag.restaurantId, restaurantId), inArray(tblRestaurantTag.id, availableLaTags)))
        }
    })

    // if (availableLaTags.length > 0) {
    //     await Promise.all(availableLaTags.map(async (tagId) => {
    //         await restaurantTagEntities.updateRestaurantTag({ tagId, data: { isAvailable: true } })
    //     }))
    // }

}