import { TPrepaymentInsert, TReservationSelect } from "@/server/db/schema"
import { ReservationEntities } from "@/server/layer/entities/reservation"
import { ReservationLogEntities } from "@/server/layer/entities/reservation/reservation-log"
import { notificationUseCases } from "@/server/layer/use-cases/reservation/notification"
import { TTransaction } from "@/server/utils/db-utils"
import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums"


type TCreatePrepaymentEntityData = Parameters<typeof ReservationEntities.createReservationPrepayment>[0]

export const createPrepayment = async ({
    prepaymentEntityData,
    reservation,
    withEmail,
    withSms,
    creator,
    trx
}: {
    prepaymentEntityData: TPrepaymentInsert,
    reservation: TReservationSelect,
    withEmail: boolean,
    withSms: boolean,
    creator: string
    trx?: TTransaction,


}) => {

    const newPrepaymentId = await ReservationEntities.createReservationPrepayment({
        data: prepaymentEntityData,
        trx
    })

    await ReservationEntities.updateReservation({
        data: {
            currentPrepaymentId: newPrepaymentId,
            reservationStatusId: EnumReservationStatusNumeric.prepayment,
        },
        reservationId: reservation.id,
        trx
    })

    if (withEmail || withSms) {
        await notificationUseCases.handlePrePayment({
            reservationId: reservation.id,
            withEmail,
            withSms,
        })
    }


    await ReservationLogEntities.createLog({
        message: `Reservation prepayment created`,
        reservationId: reservation.id,
        owner: creator,
    })




}
