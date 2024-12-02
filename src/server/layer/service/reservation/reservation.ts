import { ReservationEntities } from "../../entities/reservation"
import { ReservationLogEntities } from "../../entities/reservation/reservation-log"
import { notificationUseCases } from "../../use-cases/reservation/notification"


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

