import * as entities from "./reservation"
import * as waitingSession from './waiting-session'

export const ReservationEntities = {
    ...entities,
    ...waitingSession
}