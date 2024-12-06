import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums"
import { ReservationEntities } from "../../entities/reservation"
import { ReservationLogEntities } from "../../entities/reservation/reservation-log"
import { notificationUseCases } from "../../use-cases/reservation/notification"
import { reservationJobManager } from "@/server/cron/jobs/reservation"


type TReservationCreatiionEntityData = Parameters<typeof ReservationEntities.createReservation>[0]
export const createReservation = async ({
    reservationEntityData,
    reservationCreator
}: {
    reservationEntityData: TReservationCreatiionEntityData,
    reservationCreator: string
}) => {

    const reservation = await ReservationEntities.createReservation(reservationEntityData)

    await ReservationLogEntities.createLog({
        message: `Reservation created`,
        reservationId: reservation.id,
        owner: reservationCreator,
    })


    await notificationUseCases.handleReservationCreated({
        reservationId: reservation.id,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
    })

    return reservation

    //event reservation creation

}


export const createHoldingReservation = async ({
    reservationEntityData,
    reservationCreator
}: {
    reservationEntityData: TReservationCreatiionEntityData,
    reservationCreator: string
}) => {

    const reservation = await ReservationEntities.createReservation(reservationEntityData)

    await ReservationLogEntities.createLog({
        message: `Reservation Holded`,
        reservationId: reservation.id,
        owner: reservationCreator,
    })
    return reservation

    //event reservation creation

}

export const handleConvertHoldingToReservation = async ({ reservationId, reservationCreator }: { reservationId: number, reservationCreator: string }) => {
    const reservation = await ReservationEntities.getReservationById({ reservationId })
    await ReservationLogEntities.createLog({
        message: `Reservation created`,
        reservationId: reservation.id,
        owner: reservationCreator,
    })


    await notificationUseCases.handleReservationCreated({
        reservationId: reservation.id,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
    })

    return reservation
}


export const cancelUnpaidReservation = async (reservationId: number) => {

    
    
    const reservation = await ReservationEntities.getReservationById({ reservationId })

    if (reservation.reservationStatusId !== EnumReservationStatusNumeric.prepayment) return
    
    if (reservation.reservationStatusId === EnumReservationStatusNumeric.prepayment) {
        await ReservationEntities.updateReservation({
            data: {
                reservationStatusId: EnumReservationStatusNumeric.cancel,
                canceledAt: new Date(),
                canceledBy: "System",
            },
            reservationId
        })
    }

    await ReservationLogEntities.createLog({
        message: `Reservation cancelled due to unpaid`,
        reservationId,
        owner: "System",
    })

    console.log('debug 2312')
    await notificationUseCases.handleReservationCancelled({
        reservationId,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
    })

}


export const remindUnpaidReservation = async (reservationId: number) => {
    const reservation = await ReservationEntities.getReservationById({ reservationId })

    // if (reservation.reservationStatusId === EnumReservationStatusNumeric.prepayment) {
    //     await notificationUseCases.handlePrePayment({
    //         reservationId,
    //         withEmail: reservation.isSendEmail,
    //         withSms: reservation.isSendSms,
    //     })
    // }
}

type TUpdateReservationEntityData = Parameters<typeof ReservationEntities.updateReservation>[0]
export const updateReservation = async ({ entityData }: { entityData: TUpdateReservationEntityData }) => {

    await ReservationEntities.updateReservation(entityData)
    reservationJobManager.rescheduleReservationJobs({ reservationId: entityData.reservationId })

}
