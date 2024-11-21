import { z } from "zod"

const confirmReservation = z.object({
    reservationId: z.number().int().positive(),
})


export const clientReservationActionValidator = {
    confirmReservation,
}

namespace TClientReservationActionValidator {
    export type TConfirmReservation = z.infer<typeof confirmReservation>
}

export default TClientReservationActionValidator