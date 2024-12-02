import { getEnumValues } from "@/server/utils/server-utils";
import { EnumPrepaymentAtNoShow } from "@/shared/enums/predefined-enums";
import { z } from "node_modules/zod/lib";

const updatePaymentSettingFormSchema = z.object({
    prePaymentPricePerGuest: z.number().int().positive(),
    convertPrepaymentToSale: z.boolean(),
    prepaymentCancellationHours: z.number().int().positive(),
    prepaymentAtNoShow: z.enum(getEnumValues(EnumPrepaymentAtNoShow)),
})

export const updatePaymentSettingSchema = z.object({
    paymentSetting: updatePaymentSettingFormSchema.partial(),
    paymentSettingId: z.number().int().positive(),
})


export const paymentSettingValidator = {
    updatePaymentSettingSchema,
    updatePaymentSettingFormSchema
}


namespace TPaymentSettingValidator {
    export type updatePaymentSettingSchema = z.infer<typeof updatePaymentSettingSchema>
    export type updatePaymentSettingFormSchema = z.infer<typeof updatePaymentSettingFormSchema>
}

export default TPaymentSettingValidator