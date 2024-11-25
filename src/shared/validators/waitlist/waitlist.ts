import { z } from "zod";


 const getWaitlists = z.object({
    date: z.date()
})

const queryWaitlistAvailability = z.object({
    waitlistId: z.number().int().positive()
})

const createReservationFromWaitlist = z.object({
    waitlistId: z.number().int().positive(),
    reservationData: z.object({
        roomId: z.number().int().positive(),
        guestId: z.number().int().positive(),
        mealId: z.number().int().positive(),
        reservationDate: z.date(),
        hour: z.string(),
        guestCount: z.number().int().positive(),
        isSendSms: z.boolean().default(true),
        isSendEmail: z.boolean().default(true),
        guestNote: z.string().optional(),
        allergenWarning: z.boolean().default(false),
    }),
    data: z.object({
        tableIds: z.array(z.number().int().positive()),
        reservationTagIds: z.array(z.number().int().positive()),
        waitlistId: z.number().int().positive(),
    })
})


export const waitlistValidators = {
    createReservationFromWaitlist,
    getWaitlists,
    queryWaitlistAvailability
}

namespace TWaitlistValidator {
    export type CreateReservationFromWaitlist = z.infer<typeof createReservationFromWaitlist>
    export type GetWaitlists = z.infer<typeof getWaitlists>
    export type QueryWaitlistAvailability = z.infer<typeof queryWaitlistAvailability>
}

export default TWaitlistValidator