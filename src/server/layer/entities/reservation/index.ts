import * as entities from "./reservation"
import * as waitingSession from './waiting-session'
import * as reservationNote from './reservation-note'
import * as reservationTag from './reservation-tag'
import * as prepayment from './prepayment'
import * as confirmationRequest from './confirmation-request'
export const ReservationEntities = {
    ...entities,
    ...waitingSession,
    ...reservationNote,
    ...reservationTag,
    ...prepayment,
    ...confirmationRequest
}
