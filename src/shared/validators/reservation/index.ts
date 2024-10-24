import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReservationPrepaymentType } from "@/shared/enums/predefined-enums";
import { z } from "zod";


const getTableStatues = z.object({
    date: z.string(),
    mealId: z.number().int().positive(),
})

const tableIds = z.array(z.number().int().positive()).min(1)

const createReservationBase = z.object({
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
})

const createReservation = createReservationBase.merge(
    z.object({
        tableIds
    })
)

const updateReservation = z.object({
    data: createReservationBase.partial(),
    reservationId: z.number().int().positive()
})

const updateReservationTable = z.object({
    id: z.number().int().positive(),
}).merge(z.object({
    tableId: z.number().int().positive(),
}).partial())

export const reservationValidator = {
    getTableStatues,
    createReservation,
    updateReservation,
    updateReservationTable
}

namespace TReservationValidator {
    export type getTableStatues = z.infer<typeof getTableStatues>
    export type createReservation = z.infer<typeof createReservation>
    export type updateReservation = z.infer<typeof updateReservation>
    export type updateReservationTable = z.infer<typeof updateReservationTable>
}

export default TReservationValidator