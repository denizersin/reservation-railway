import { blockedAllergens } from "@/shared/data";
import { z } from "zod";

const userInfoFormSchema = z.object({
    name: z.string().max(256).min(2, "Name must be at least 2 characters"),
    surname: z.string().max(256).min(2, "Surname must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneCode: z.string(),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    allergenWarning: z.boolean(),
    guestNote: z.string().optional().refine((val) => {
        if (val) {
            return !(blockedAllergens.tr.includes(val.toLocaleLowerCase()) || blockedAllergens.en.includes(val.toLocaleLowerCase()))
        }
        return true
    }, {
        message: "We are not accepting this allergen",
    }),
    reservationTags: z.array(z.number().int().positive()).optional(),

    allergenAccuracyConsent: z.boolean().refine((val) => val === true, {
        message: "You must accept the accuracy of allergen information",
    }),
    marketingConsent: z.boolean().refine((val) => val === true, {
        message: "You must accept the marketing consent",
    }),
})


const reservationDataFormSchema = z.object({
    mealId: z.number().int().positive(),
    date: z.date(),
    time: z.string(),
    guestCount: z.number().int().positive(),
    roomId: z.number().int().positive()

})


const createReservationSchema = z.object({
    userInfo: userInfoFormSchema,
    reservationData: reservationDataFormSchema,
})


const holdTableSchema = z.object({
    mealId: z.number().int().positive(),
    date: z.date(),
    time: z.string(),
    guestCount: z.number().int().positive(),
    roomId: z.number().int().positive()

})

const prePaymentFormSchema = z.object({
    card_number: z.string().min(16, "Card number must be 16 digits"),
    expiry_date: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
    cvc: z.string().min(3, "CVC must be 3 digits"),

    invoice: z.object({
        invoiceRequired: z.boolean().optional(),
        invoiceType: z.enum(["individual", "corporate"]).optional(),
        invoiceFirstName: z.string().optional(),
        invoiceLastName: z.string().optional(),
        invoicePhoneCode: z.string().optional(),
        invoicePhone: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        neighbourhood: z.string().optional(),
        address: z.string().optional(),
        tin: z.string().optional(),
        taxOffice: z.string().optional(),
        companyName: z.string().optional(),
        isEInvoiceTaxpayer: z.boolean().optional(),
    }),



    cancellation_policy_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the cancellation policy",
    }),
    preliminary_form_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the preliminary information form",
    }),
    distance_sales_consent: z.boolean().refine((val) => val === true, {
        message: "You must accept the distance sales agreement",
    }),
})


const waitlistFormSchema = userInfoFormSchema;

const createWaitlistSchema = z.object({
    guestCount: z.number().int().positive(),
    mealId: z.number().int().positive(),
    waitlistDate: z.date(),
    waitlistUserInfo: waitlistFormSchema
})


export const clientValidator = {
    userInfoFormSchema,
    reservationDataFormSchema,
    createReservationSchema,
    holdTableSchema,
    createWaitlistSchema,
    waitlistFormSchema,
    prePaymentFormSchema
}


namespace TclientValidator {
    export type TUserInfoForm = z.infer<typeof userInfoFormSchema>
    export type TReservationDataForm = z.infer<typeof reservationDataFormSchema>
    export type TCreateReservationSchema = z.infer<typeof createReservationSchema>
    export type TholdTableSchema = z.infer<typeof holdTableSchema>
    export type TCreateWaitlistSchema = z.infer<typeof createWaitlistSchema>
    export type TWaitlistForm = z.infer<typeof waitlistFormSchema>
    export type TPrePaymentForm = z.infer<typeof prePaymentFormSchema>
}

export default TclientValidator