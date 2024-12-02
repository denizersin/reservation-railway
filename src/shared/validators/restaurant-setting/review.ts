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


 const reviewTranslationSchema = z.object({
    languageId: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().min(1),
 })

 const updateReviewTranslationsValidator = z.object({
    id: z.number().int().positive(),
    translations: z.array(reviewTranslationSchema),

 })


 const reviewSchema = z.object({
    isActive: z.boolean(),
    order: z.number().int().positive(),
 })



 const createReviewSchema = z.object({
    review: reviewSchema,
    translations: z.array(reviewTranslationSchema),
 })

 const createReviewValidator = createReviewSchema

 const updateReviewValidator = z.object({
    id: z.number().int().positive(),
    reviewData: createReviewSchema,
 })


 export const reviewSettingsValidator = {
    updateReviewSettingsValidator,
    updateReviewSettingsFormSchema,
    updateReviewTranslationsValidator,
    updateReviewValidator,

    createReviewSchema,
    createReviewValidator,
 }

 namespace TReviewSettingsValidator {
    export type TUpdateReviewSettingsValidator = z.infer<typeof updateReviewSettingsValidator>
    export type TUpdateReviewSettingsFormSchema = z.infer<typeof updateReviewSettingsFormSchema>
    export type TUpdateReviewTranslationsValidator = z.infer<typeof updateReviewTranslationsValidator>
    export type TUpdateReviewValidator = z.infer<typeof updateReviewValidator>
    export type TCreateReviewSchema = z.infer<typeof createReviewSchema>
    export type TCreateReviewValidator = z.infer<typeof createReviewValidator>
 }

 export default TReviewSettingsValidator