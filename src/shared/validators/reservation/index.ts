import { z } from "zod";


const getTableStatues = z.object({
    date: z.date(),
    mealId: z.number().int().positive(),
})


export const reservationValidator = {
    getTableStatues
}

namespace TReservationValidator {
    export type getTableStatues = z.infer<typeof getTableStatues>
}

export default TReservationValidator