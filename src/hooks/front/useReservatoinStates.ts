"use client";

import { WaitlistFormValues } from "@/app/(app)/reservation/waitlist/join/page";
import TClientFormValidator from "@/shared/validators/front/create";
import { useCallback, useEffect, useState } from "react";
import useClientLocalStorage from "../useClientLocalStorage";

type ReservationState = {
    date: Date
    guestCount: number
    areaId: number
    areaName?: string
    time: string
}

type WaitlistReservationState = {
    date: Date
    guestCount: number
}

export const useReservationStates = () => {

    const localStorage = useClientLocalStorage()


    // Reservation State
    const getReservationState = useCallback((): ReservationState | null => {
        const state = localStorage?.getItem?.('reservationState')
        if (state) {
            const parsedState = JSON.parse(state)
            parsedState.date = new Date(parsedState.date)
            return parsedState
        }
        return null
    }, [])

    const updateReservationState = useCallback((state: ReservationState) => {
        localStorage?.setItem('reservationState', JSON.stringify(state))
    }, [])

    const clearReservationState = useCallback(() => {
        localStorage?.removeItem('reservationState')
    }, [])

    // Reservation User Info Form Values
    const getReservationUserInfoFormValues = useCallback((): TClientFormValidator.TUserInfoForm | null => {
        const values = localStorage?.getItem?.('reservationUserInfoFormValues')
        if (values) {
            return JSON.parse(values)
        }
        return null
    }, [])

    const updateReservationUserInfoFormValues = useCallback((values: TClientFormValidator.TUserInfoForm) => {
        localStorage?.setItem('reservationUserInfoFormValues', JSON.stringify(values))
    }, [])

    const clearReservationUserInfoFormValues = useCallback(() => {
        localStorage?.removeItem('reservationUserInfoFormValues')
    }, [])

    // Waitlist Reservation State
    const getWaitlistReservationState = useCallback((): WaitlistReservationState | null => {
        const state = localStorage?.getItem?.('waitlistReservationState')
        if (state) {
            return JSON.parse(state)
        }
        return null
    }, [])

    const updateWaitlistReservationState = useCallback((state: WaitlistReservationState) => {
        localStorage?.setItem('waitlistReservationState', JSON.stringify(state))
    }, [])

    const clearWaitlistReservationState = useCallback(() => {
        localStorage?.removeItem('waitlistReservationState')
    }, [])

    // Waitlist Form Values
    const getWaitlistFormValues = useCallback((): WaitlistFormValues | null => {
        const values = localStorage?.getItem?.('waitlistFormValues')
        if (values) {
            return JSON.parse(values)
        }
        return null
    }, [])

    const updateWaitlistFormValues = useCallback((values: WaitlistFormValues) => {
        localStorage?.setItem('waitlistFormValues', JSON.stringify(values))
    }, [])

    const clearWaitlistFormValues = useCallback(() => {
        localStorage?.removeItem('waitlistFormValues')
    }, [])

    return {
        // Reservation State
        getReservationState,
        updateReservationState,
        clearReservationState,

        // Reservation User Info Form Values
        getReservationUserInfoFormValues,
        updateReservationUserInfoFormValues,
        clearReservationUserInfoFormValues,

        // Waitlist Reservation State
        getWaitlistReservationState,
        updateWaitlistReservationState,
        clearWaitlistReservationState,

        // Waitlist Form Values
        getWaitlistFormValues,
        updateWaitlistFormValues,
        clearWaitlistFormValues,
    }
}

// Kullanım örneği:
/*
const Component = () => {
    const {
        getReservationState,
        updateReservationState,
        clearReservationState,
        // ... diğer metodlar
    } = useLocalStorage()

    // Örnek kullanım
    const handleSaveReservation = () => {
        updateReservationState({
            date: new Date(),
            guestCount: 2,
            areaId: 1,
            time: "18:00"
        })
    }
}
*/
