import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReservationPrepaymentType } from "@/shared/enums/predefined-enums";
import { z } from "zod";


const getTableStatues = z.object({
    date: z.date(),
    mealId: z.number().int().positive(),
})


const createReservation= z.object({
    roomId: z.number().int().positive(),
    guestId: z.number().int().positive(),
    mealId: z.number().int().positive(),
    prepaymentId: z.number().int().positive().nullable().optional(),
    reservationDate: z.date(),
    hour: z.string(),
    guestCount: z.number().int().positive(),
    prePaymentType: z.enum(getEnumValues(EnumReservationPrepaymentType)),
    isSendSms: z.boolean().default(true),
    isSendEmail: z.boolean().default(true),
    tableIds: z.array(z.number().int().positive()).min(1),
})


export const reservationValidator = {
    getTableStatues,
    createReservation,
}

namespace TReservationValidator {
    export type getTableStatues = z.infer<typeof getTableStatues>
    export type createReservation = z.infer<typeof createReservation>
}

export default TReservationValidator