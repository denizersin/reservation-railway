import { TReservationUserInfoFormValues } from "@/app/(app)/reservation/user-info/page"
import { WaitlistFormValues } from "@/app/(app)/reservation/waitlist/join/page"

type ReservationState = {
    date: Date
    guestCount: number
    areaId: number,
    time: string
}


export const updateReservationState = (state: ReservationState) => {
    localStorage.setItem('reservationState', JSON.stringify(state))
}

export const getReservationState = (): ReservationState | null => {
    const state = localStorage.getItem('reservationState')

    if (state) {
        const parsedState = JSON.parse(state)
        parsedState.date = new Date(parsedState.date)
        return parsedState
    }
    return null
}

export const clearReservationState = () => {
    localStorage.removeItem('reservationState')
}


// Reservation User Info Form Values
export const updateReservationUserInfoFormValues = (values: TReservationUserInfoFormValues) => {
    localStorage.setItem('reservationUserInfoFormValues', JSON.stringify(values))
}

export const getReservationUserInfoFormValues = (): TReservationUserInfoFormValues | null => {
    const values = localStorage.getItem('reservationUserInfoFormValues')
    if (values) {
        return JSON.parse(values)
    }
    return null
}

export const clearReservationUserInfoFormValues = () => {
    localStorage.removeItem('reservationUserInfoFormValues')
}


//waitlistReservation
type WaitlistReservationState = {
    date: Date
    guestCount: number
}
export const updateWaitlistReservationState = (state: WaitlistReservationState) => {
    localStorage.setItem('waitlistReservationState', JSON.stringify(state))
}

export const getWaitlistReservationState = (): WaitlistReservationState | null => {
    const state = localStorage.getItem('waitlistReservationState')
    if (state) {
        return JSON.parse(state)
    }
    return null
}

export const clearWaitlistReservationState = () => {
    localStorage.removeItem('waitlistReservationState')
}


//waitlistFormValues
export const updateWaitlistFormValues = (values: WaitlistFormValues) => {
    localStorage.setItem('waitlistFormValues', JSON.stringify(values))
}

export const getWaitlistFormValues = (): WaitlistFormValues | null => {
    const values = localStorage.getItem('waitlistFormValues')
    if (values) {
        return JSON.parse(values)
    }
    return null
}

export const clearWaitlistFormValues = () => {
    localStorage.removeItem('waitlistFormValues')
}



export const localStorageStates = {
    getReservationState,
    clearReservationState,
    updateReservationState,

    // Reservation User Info Form Values
    getReservationUserInfoFormValues,
    updateReservationUserInfoFormValues,
    clearReservationUserInfoFormValues,

    //waitlistReservation
    getWaitlistReservationState,
    updateWaitlistReservationState,
    clearWaitlistReservationState,

    //waitlistFormValues
    getWaitlistFormValues,
    updateWaitlistFormValues,
}