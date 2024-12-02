import { getEnumValues } from '@/server/utils/server-utils';
import { EnumTableViewType, EnumUserRole } from '@/shared/enums/predefined-enums';
import { z } from 'zod';



const generealSettingSchema = z.object({
    isAutoCheckOut: z.boolean(),
    newReservationStatusId: z.number().int().positive(),
    defaultLanguageId: z.number().int().positive(),
    defaultCountryId: z.number().int().positive(),
    tableView: z.enum(getEnumValues(EnumTableViewType)),

})


const updateRestaurantGeneralSettingFormSchema = generealSettingSchema

const updateRestaurantGeneralSettingSchema = z.object({
    generalSettingID: z.number().int().positive(),
    generalSetting: generealSettingSchema.partial()
})




export const restaurantGeneralSettingValidator = {
    updateRestaurantGeneralSettingSchema,
    updateRestaurantGeneralSettingFormSchema
}

namespace TRestaurantGeneralSettingValidator {
    export type updateRestaurantGeneralSettingSchema = z.infer<typeof updateRestaurantGeneralSettingSchema>
    export type updateRestaurantGeneralSettingFormSchema = z.infer<typeof updateRestaurantGeneralSettingFormSchema>
}

export default TRestaurantGeneralSettingValidator