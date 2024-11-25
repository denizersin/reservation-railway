import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReviewSendDay, EnumReviewSendType } from "@/shared/enums/predefined-enums";
import { z } from "zod";

 const reviewSettingsSchema = z.object({
    isReviewEnabled: z.boolean(),
    reviewSendTime: z.string(),
    reviewSendType: z.enum(getEnumValues(EnumReviewSendType)),
    reviewSendDay: z.enum(getEnumValues(EnumReviewSendDay)),
})

 const updateReviewSettingsFormSchema = reviewSettingsSchema.partial()

 const updateReviewSettingsValidator = z.object({
    reviewSettingId: z.number().int().positive(),
    reviewSetting: updateReviewSettingsFormSchema,
 })

 

 namespace TReviewSettingsValidator {
    export type TUpdateReviewSettingsValidator = z.infer<typeof updateReviewSettingsValidator>
    export type TUpdateReviewSettingsFormSchema = z.infer<typeof updateReviewSettingsFormSchema>
 }

 export default TReviewSettingsValidator