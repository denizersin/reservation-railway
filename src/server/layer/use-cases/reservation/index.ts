import * as usecase from "./reservation"
import * as waitingSession from './waiting-session'

export const reservationUseCases = {
    ...usecase,
    ...waitingSession
}