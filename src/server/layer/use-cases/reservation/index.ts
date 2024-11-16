import * as usecase from "./reservation"
import * as waitingSession from './waiting-session'
import * as reservationStatus from './status'
import * as queries from './queries'
export const reservationUseCases = {
    ...usecase,
    ...waitingSession,
    ...reservationStatus,
    ...queries
}
