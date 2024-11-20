"use client"
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal"
import { api, RouterOutputs } from "@/server/trpc/react"
import { EnumReservationStatus } from "@/shared/enums/predefined-enums"
import { useRouter, useParams } from "next/navigation"

import React, { createContext, useContext, useEffect } from 'react'

type TReservationStatusData = RouterOutputs['reservation']['getReservationStatusData']

type TReservationStatusContext = {
    reservationStatusData: TReservationStatusData | undefined
}

type Props = {
    children: React.ReactNode,
    params: {
        id: string
    }
}

//create ReservationStatusContext
const ReservationStatusContext = createContext<TReservationStatusContext>({} as TReservationStatusContext)

export function useReservationStatusContext() {
    return useContext(ReservationStatusContext)
}


const Layout = (props: Props) => {

    const { id } = useParams()

    const reservationId = Number(id)

    const router = useRouter()

    const { data: reservationStatusData, isLoading } = api.reservation.getReservationStatusData.useQuery({ reservationId })

    useEffect(() => {
        if (!reservationStatusData) return;

        const isCanceled = reservationStatusData.reservationStatus.status === EnumReservationStatus.cancel
        const isPrepayment = reservationStatusData.reservationStatus.status === EnumReservationStatus.prepayment
        const isConfirmed = reservationStatusData.reservationStatus.status === EnumReservationStatus.confirmed
        const isCompleted = reservationStatusData.reservationStatus.status === EnumReservationStatus.completed
        const isConfirmation = reservationStatusData.reservationStatus.status === EnumReservationStatus.confirmation
        const isReservation = reservationStatusData.reservationStatus.status === EnumReservationStatus.reservation

        const isSuccess = isConfirmed || isCompleted

        if (isCanceled) {
            router.push(`/reservation/status/${reservationId}/cancel`)
        }
        else if (isPrepayment) {
            router.push(`/reservation/status/${reservationId}/prepayment`)
        }
        else if (isSuccess) {
            router.push(`/reservation/status/${reservationId}/success`)
        }
        else if (isConfirmation) {
            router.push(`/reservation/status/${reservationId}/confirmation`)
        }
        else if (isReservation) {
            router.push(`/reservation/status/${reservationId}/reservation`)
        }


    }, [reservationStatusData])

    useShowLoadingModal([isLoading])

    return (
        <ReservationStatusContext.Provider value={{
            reservationStatusData: reservationStatusData!
        }}>
            {props.children}
        </ReservationStatusContext.Provider>
    )
}

export default Layout