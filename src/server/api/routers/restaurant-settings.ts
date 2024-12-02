import { restaurantGeneralSettingValidator } from "@/shared/validators/restaurant-setting/general";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { restaurantGeneralSettingEntities } from "@/server/layer/entities/restaurant-setting";

export const restaurantSettingsRouter = createTRPCRouter({
    updateRestaurantGeneralSettings: ownerProcedure
        .input(restaurantGeneralSettingValidator.updateRestaurantGeneralSettingSchema)
        .mutation(async ({ input, ctx }) => {
            await restaurantGeneralSettingEntities.updateRestaurantGeneralSettings({
                generalSetting: input.generalSetting,
                generalSettingID: input.generalSettingID,
            })

            return true
        }),
}); 