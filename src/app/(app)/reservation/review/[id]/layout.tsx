"use client"
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal"
import { api, RouterOutputs } from "@/server/trpc/react"
import { EnumReservationStatus, EnumReviewStatus } from "@/shared/enums/predefined-enums"
import { useParams, useRouter } from "next/navigation"

import React, { createContext, useContext, useEffect } from 'react'

type TReservationStatusData = RouterOutputs['reservation']['getReservationStatusData']

type TReservationStatusContext = {
    reservationStatusData: TReservationStatusData | undefined
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

        const isReviewed = reservationStatusData.review.status === EnumReviewStatus.REVIEWED
        const isPending = reservationStatusData.review.status === EnumReviewStatus.PENDING


        if (isReviewed) {
            router.replace(`/reservation/review/${reservationId}/reviewed`)
        }
        else if (isPending) {
            router.replace(`/reservation/review/${reservationId}/pending`)
        } else {
            router.replace(`/reservation`)
        }

    }, [reservationStatusData])

    useShowLoadingModal([isLoading])

    return (
        <ReservationStatusContext.Provider value={{
            reservationStatusData: reservationStatusData!,
            isLoading
        }}>
            {props.children}
        </ReservationStatusContext.Provider>
    )
}

export default Layout