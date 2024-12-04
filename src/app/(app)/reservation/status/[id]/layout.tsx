"use client"
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal"
import { api, RouterOutputs } from "@/server/trpc/react"
import { EnumReservationStatus } from "@/shared/enums/predefined-enums"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"
import { useParams, useRouter } from "next/navigation"

import React, { createContext, useContext, useEffect } from 'react'

type TReservationStatusData = RouterOutputs['reservation']['getReservationStatusData']

type TReservationStatusContext = {
    reservationStatusData: TReservationStatusData | undefined
    inValidateReservationStatusData: () => void
    isLoading: boolean
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
            router.replace(`/reservation/status/${reservationId}/cancel`)
        }
        else if (isPrepayment) {
            router.replace(`/reservation/status/${reservationId}/prepayment`)
        }
        else if (isSuccess) {
            router.replace(`/reservation/status/${reservationId}/success`)
        }
        else if (isConfirmation) {
            router.replace(`/reservation/status/${reservationId}/confirmation`)
        }
        else if (isReservation) {
            router.replace(`/reservation/status/${reservationId}/reservation`)
        }


    }, [reservationStatusData])

    const queryClient = useQueryClient()

    useShowLoadingModal([isLoading])

    return (
        <ReservationStatusContext.Provider value={{
            reservationStatusData: reservationStatusData!,
            isLoading,
            inValidateReservationStatusData: () => {
                queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationStatusData) })
            }
        }}>
            {props.children}
        </ReservationStatusContext.Provider>
    )
}

export default Layout