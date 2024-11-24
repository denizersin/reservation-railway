import { z } from "zod";

const createReservationFromWaitlist = z.object({
    waitlistId: z.number().int().positive(),
    tableId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    hour: z.string(),
})


export const waitlistValidators = {
    createReservationFromWaitlist
}

namespace TWaitlistValidator {
    export type CreateReservationFromWaitlist = z.infer<typeof createReservationFromWaitlist>
}

export default TWaitlistValidator