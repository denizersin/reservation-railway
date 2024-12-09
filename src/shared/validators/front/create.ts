import { getEnumValues } from "@/server/utils/server-utils";
import { blockedAllergens } from "@/shared/data";
import { EnumInvoiceType } from "@/shared/enums/predefined-enums";
import { z } from "zod";

const userInfoFormSchema = z.object({
    name: z.string().max(256).min(2, "Name must be at least 2 characters"),
    surname: z.string().max(256).min(2, "Surname must be at least 2 characters"), 
    email: z.string().email("Invalid email address"),
    phoneCodeId: z.number().int().positive(),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    allergenWarning: z.boolean(),
    guestNote: z.string()
        .superRefine((val, ctx) => {
            console.log(val, 'val2323')
            if (!val) return true;
            
            // Split the note into words and check each word against blocked allergens
            const words = val.toLowerCase().split(/\s+/);
            const hasBlockedAllergens = words.some(word => 
                blockedAllergens.tr.includes(word) || 
                blockedAllergens.en.includes(word)
            );

            if (hasBlockedAllergens) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "We do not accept reservations with these allergens: vegan, vegetarian, lactose intolerance, gluten allergy, celiac, onion, garlic, tomato, milk, butter, chicken stock, kosher",
                });
                return false;
            }
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
    name_and_surname: z.string().max(256).min(2, "Name must be at least 2 characters"),
    card_number: z.string().min(16, "Card number must be 16 digits"),
    expiry_date: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
    cvc: z.string().min(3, "CVC must be 3 digits"),

    invoice: z.object({
        invoiceRequired: z.boolean().optional(),
        invoiceType: z.enum(getEnumValues(EnumInvoiceType)).optional(),
        invoiceFirstName: z.string().optional(),
        invoiceLastName: z.string().optional(),
        invoicePhoneCodeId: z.number().optional(),
        invoicePhone: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        neighbourhood: z.string().optional(),
        address: z.string().optional(),
        tin: z.string().optional(),
        taxOffice: z.string().optional(),
        companyName: z.string().optional(),
        isEInvoiceTaxpayer: z.boolean().optional(),
    }).superRefine((data, ctx) => {
        if (!data.invoiceRequired) return;

        const requiredFields = {
            invoiceType: "Invoice type",
            invoiceFirstName: "First name",
            invoiceLastName: "Last name",
            invoicePhoneCodeId: "Phone code",
            invoicePhone: "Phone number",
            city: "City",
            district: "District",
            // neighbourhood: "Neighbourhood",
            address: "Address",

            
            ...(data.invoiceType === EnumInvoiceType.corporate ? {
                tin: "Tax ID number",
                taxOffice: "Tax office", 
                companyName: "Company name",
                // isEInvoiceTaxpayer: "E-invoice taxpayer status"
            } : {}),
        } as const;

        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!data[field as keyof typeof data]) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${label} is required when invoice is required`,
                    path: [field]
                });
            }
        });

        // if (data.isEInvoiceTaxpayer === undefined) {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: "E-invoice taxpayer status is required when invoice is required",
        //         path: ["isEInvoiceTaxpayer"]
        //     });
        // }
    }).optional(),



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

const createPaymentSchema = z.object({
    reservationId: z.number().int().positive(),
    paymentData: prePaymentFormSchema,
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
    prePaymentFormSchema,
    createPaymentSchema,
}


namespace TclientValidator {
    export type TUserInfoForm = z.infer<typeof userInfoFormSchema>
    export type TReservationDataForm = z.infer<typeof reservationDataFormSchema>
    export type TCreateReservationSchema = z.infer<typeof createReservationSchema>
    export type TholdTableSchema = z.infer<typeof holdTableSchema>
    export type TCreateWaitlistSchema = z.infer<typeof createWaitlistSchema>
    export type TWaitlistForm = z.infer<typeof waitlistFormSchema>
    export type TPrePaymentForm = z.infer<typeof prePaymentFormSchema>
    export type TCreatePaymentSchema = z.infer<typeof createPaymentSchema>
}

export default TclientValidator