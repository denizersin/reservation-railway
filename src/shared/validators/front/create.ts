import { z } from "zod";

const userInfoFormSchema = z.object({
    name: z.string().max(256).min(2, "Name must be at least 2 characters"),
    surname: z.string().max(256).min(2, "Surname must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneCode: z.string(),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    allergenWarning: z.boolean(),
    specialRequests: z.string().optional(),
    reservationTags: z.array(z.number().int().positive()).optional(),
    invoiceRequired: z.boolean(),

    // Invoice related fields
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
    allergenAccuracyConsent: z.boolean().refine((val) => val === true, {
        message: "You must accept the accuracy of allergen information",
    }),
    marketingConsent: z.boolean().optional(),
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


const occupyTableSchema = z.object({
    mealId: z.number().int().positive(),
    date: z.date(),
    time: z.string(),
    guestCount: z.number().int().positive(),
    roomId: z.number().int().positive()

})



export const clientFormValidator = {
    userInfoFormSchema,
    reservationDataFormSchema,
    createReservationSchema,
    occupyTableSchema,
}


namespace TClientFormValidator {
    export type TUserInfoForm = z.infer<typeof userInfoFormSchema>
    export type TReservationDataForm = z.infer<typeof reservationDataFormSchema>
    export type TCreateReservationSchema = z.infer<typeof createReservationSchema>
    export type TOccupyTableSchema = z.infer<typeof occupyTableSchema>
}

export default TClientFormValidator