import * as usecase from "./reservation"
import * as waitingSession from './waiting-session'
import * as reservationStatus from './status'
import * as queries from './queries'
import * as clientQueries from './client-queries'
import * as publicReservationUseCases from './public/reservation'
import * as waitlistUseCases from './waitlist'
export const reservationUseCases = {
    ...usecase,
    ...waitingSession,
    ...reservationStatus,
    ...queries,
    ...clientQueries,
    ...publicReservationUseCases,
    ...waitlistUseCases
}
