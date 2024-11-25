import { getEnumValues } from "@/server/utils/server-utils";
import { EnumReservationExistanceStatus, EnumReservationPrepaymentType, EnumReservationStatus } from "@/shared/enums/predefined-enums";
import { z } from "zod";
import { baseNotificationOptionsSchema } from "..";


const getTableStatues = z.object({
    date: z.date(),
    mealId: z.number().int().positive(),
})

const tableIds = z.array(z.number().int().positive()).min(1)
const reservationTagIds = z.array(z.number().int().positive())

const createReservationBase = z.object({
    roomId: z.number().int().positive(),
    guestId: z.number().int().positive(),
    mealId: z.number().int().positive(),
    prepaymentTypeId: z.number().int().positive(),
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
    reservationId: z.number().int().positive(),
    tableId: z.number().int().positive(),
})



const getReservations = z.object({
    date: z.date(),
    status: z.enum(getEnumValues(EnumReservationStatus)).optional(),
    existenceStatus: z.enum(getEnumValues(EnumReservationExistanceStatus)).optional(),
    search: z.string().optional(),
})

const reservationIdSchema = z.object({
    reservationId: z.number().int().positive()
})

const checkInReservation = reservationIdSchema

const takeReservationIn = reservationIdSchema
const makeReservationNotExist = reservationIdSchema
const getReservationLogs = reservationIdSchema
const getReservationNotifications = reservationIdSchema



// reservation status actions
const baseReservationStatusAction = z.object({
    reservationId: z.number().int().positive(),
    notificationOptions: baseNotificationOptionsSchema
})

const confirmReservation = baseReservationStatusAction
const cancelReservation = baseReservationStatusAction
const requestForConfirmation = baseReservationStatusAction
const cancelConfirmationRequest = baseReservationStatusAction
const notifyPrepayment = baseReservationStatusAction
const cancelPrepayment = baseReservationStatusAction
const requestForBill = baseReservationStatusAction
const askForBill = baseReservationStatusAction
const returnPrepayment = baseReservationStatusAction
const cancelAndReturnPrepayment = baseReservationStatusAction
const turnCanceledToReservation = baseReservationStatusAction

const requestForPrepaymentForm = z.object({
    customPrepaymentAmount: z.number().int().positive().optional(),
})

const requestForPrepayment = z.object({
    reservationId: z.number().int().positive(),
    data: requestForPrepaymentForm,
    notificationOptions: baseNotificationOptionsSchema
})


const getReservationDetail = reservationIdSchema
const deleteReservation = reservationIdSchema
const repeatReservation = reservationIdSchema



const checkOutAndCompleteReservation = reservationIdSchema



const updateReservationTime = z.object({
    reservationId: z.number().int().positive(),
    data: z.object({
        reservationDate: z.date(),
        hour: z.string(),
        tableId: z.number().int().positive(),
        roomId: z.number().int().positive(),
        guestCount: z.number().int().positive(),
    }),
    notificationOptions: baseNotificationOptionsSchema
})

const updateReservationAssignedPersonal = z.object({
    reservationId: z.number().int().positive(),
    assignedPersonalId: z.number().int().positive().nullable(),
})

const updateReservationNote = z.object({
    reservationId: z.number().int().positive(),
    note: z.string(),
})



export const reservationValidator = {
    getTableStatues,
    createReservation,
    updateReservation,
    updateReservationTable,
    getReservations,
    checkInReservation,
    takeReservationIn,
    getReservationLogs,
    getReservationNotifications,
    requestForPrepayment,
    requestForConfirmation,
    confirmReservation,
    cancelReservation,
    notifyPrepayment,
    cancelPrepayment,
    requestForBill,
    getReservationDetail,
    repeatReservation,
    askForBill,
    deleteReservation,
    requestForPrepaymentForm,
    returnPrepayment,
    updateReservationTime,
    makeReservationNotExist,
    updateReservationAssignedPersonal,
    updateReservationNote,
    checkOutAndCompleteReservation,
    cancelConfirmationRequest,
    cancelAndReturnPrepayment,
    turnCanceledToReservation,
}

namespace TReservationValidator {
    export type getTableStatues = z.infer<typeof getTableStatues>
    export type createReservation = z.infer<typeof createReservation>
    export type updateReservation = z.infer<typeof updateReservation>
    export type updateReservationTable = z.infer<typeof updateReservationTable>
    export type getReservations = z.infer<typeof getReservations>
    export type checkInReservation = z.infer<typeof checkInReservation>
    export type takeReservationIn = z.infer<typeof takeReservationIn>
    export type getReservationLogs = z.infer<typeof getReservationLogs>
    export type getReservationNotifications = z.infer<typeof getReservationNotifications>
    export type requestForPrepayment = z.infer<typeof requestForPrepayment>
    export type requestForConfirmation = z.infer<typeof requestForConfirmation>
    export type confirmReservation = z.infer<typeof confirmReservation>
    export type cancelReservation = z.infer<typeof cancelReservation>
    export type notifyPrepayment = z.infer<typeof notifyPrepayment>
    export type cancelPrepayment = z.infer<typeof cancelPrepayment>
    export type requestForBill = z.infer<typeof requestForBill>
    export type getReservationDetail = z.infer<typeof getReservationDetail>
    export type repeatReservation = z.infer<typeof repeatReservation>
    export type askForBill = z.infer<typeof askForBill>
    export type requestForPrepaymentForm = z.infer<typeof requestForPrepaymentForm>
    export type deleteReservation = z.infer<typeof deleteReservation>
    export type returnPrepayment = z.infer<typeof returnPrepayment>
    export type updateReservationTime = z.infer<typeof updateReservationTime>
    export type makeReservationNotExist = z.infer<typeof makeReservationNotExist>
    export type updateReservationAssignedPersonal = z.infer<typeof updateReservationAssignedPersonal>
    export type updateReservationNote = z.infer<typeof updateReservationNote>
    export type checkOutAndCompleteReservation = z.infer<typeof checkOutAndCompleteReservation>
    export type cancelConfirmationRequest = z.infer<typeof cancelConfirmationRequest>
    export type cancelAndReturnPrepayment = z.infer<typeof cancelAndReturnPrepayment>
    export type turnCanceledToReservation = z.infer<typeof turnCanceledToReservation>
}

export default TReservationValidator