import { getEnumValues } from '@/server/utils/server-utils';
import { EnumTableViewType, EnumUserRole } from '@/shared/enums/predefined-enums';
import { z } from 'zod';



const generealSettingSchema = z.object({
    isAutoCheckOut: z.boolean().optional(),
    newReservationStatusId: z.number().int().positive().optional(),
    defaultLanguageId: z.number().int().positive().optional(),
    defaultCountryId: z.number().int().positive().optional(),
    tableView: z.enum(getEnumValues(EnumTableViewType)).optional(),
    meals: z.array(z.number().int().positive()).optional()
})


const updateRestaurantGeneralSettingFormSchema = generealSettingSchema

const updateRestaurantGeneralSettingSchema = z.object({
    generalSettingID: z.number().int().positive(),
    generalSetting: generealSettingSchema
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