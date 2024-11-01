import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReservationExistanceStatus, EnumReservationPrepaymentType, EnumReservationStatus } from "@/shared/enums/predefined-enums";
import { date } from "drizzle-orm/pg-core";
import { z } from "zod";


const getTableStatues = z.object({
    date: z.string(),
    mealId: z.number().int().positive(),
})

const tableIds = z.array(z.number().int().positive()).min(1)
const reservationTagIds = z.array(z.number().int().positive())

const createReservationBase = z.object({
    roomId: z.number().int().positive(),
    guestId: z.number().int().positive(),
    mealId: z.number().int().positive(),
    prepaymentId: z.number().int().positive().nullable().optional(),
    reservationDate: z.date(),
    hour: z.string(),
    guestCount: z.number().int().positive(),
    // prePaymentType: z.enum(getEnumValues(EnumReservationPrepaymentType)),
    isSendSms: z.boolean().default(true),
    isSendEmail: z.boolean().default(true),
    guestNote: z.string().optional(),
})

const createReservation = z.object({
    reservationData: createReservationBase,
    data: z.object({
        tableIds,
        reservationTagIds,
        reservationNote: z.string().optional(),
        customPrepaymentAmount: z.number().int().positive().optional(),
    })
})

const updateReservation = z.object({
    data: createReservationBase.merge(z.object({
        reservationStatusId: z.number().int().positive().optional()
    })).partial(),
    reservationId: z.number().int().positive()
})

const updateReservationTable = z.object({
    id: z.number().int().positive(),
}).merge(z.object({
    tableId: z.number().int().positive(),
}).partial())


export const getReservations = z.object({
    date: z.string(),
    status: z.enum(getEnumValues(EnumReservationStatus)).optional(),
    existenceStatus: z.enum(getEnumValues(EnumReservationExistanceStatus)).optional(),
    search: z.string().optional(),
})

export const baseUpdateReservation = z.object({
    reservationId: z.number().int().positive()
})

export const checkInReservation = baseUpdateReservation

export const takeReservationIn = baseUpdateReservation

export const reservationValidator = {
    getTableStatues,
    createReservation,
    updateReservation,
    updateReservationTable,
    getReservations,
    checkInReservation,
    takeReservationIn
}

namespace TReservationValidator {
    export type getTableStatues = z.infer<typeof getTableStatues>
    export type createReservation = z.infer<typeof createReservation>
    export type updateReservation = z.infer<typeof updateReservation>
    export type updateReservationTable = z.infer<typeof updateReservationTable>
    export type getReservations = z.infer<typeof getReservations>
    export type checkInReservation = z.infer<typeof checkInReservation>
    export type takeReservationIn = z.infer<typeof takeReservationIn>
}

export default TReservationValidator