"use client"
import { ClientI18nProvider } from '@/hooks/18n-provider'
import { useReservationStates } from '@/hooks/front/useReservatoinStates'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

type Props = {
    children: React.ReactNode
}

const ReservationPageLayoutProvider = (props: Props) => {

    const pathname = usePathname()
    const router = useRouter()

    const { clearWaitlistFormValues, clearReservationState, clearReservationUserInfoFormValues, clearWaitlistReservationState } = useReservationStates()

    useEffect(() => {
        clearWaitlistFormValues()
        clearReservationState()
        clearReservationUserInfoFormValues()
        clearWaitlistReservationState()

        const isWaitlistStatusPage = pathname.includes('waitlist/status')
        const isReservationStatusPage = pathname.includes('reservation/status')
        const isReviewPage = pathname.includes('review')

        if (!(isWaitlistStatusPage || isReservationStatusPage || isReviewPage)) {
            router.push('/reservation')
        }
    }, [])

    return (

        <ClientI18nProvider>
            {props.children}
        </ClientI18nProvider>
    )
}

export default ReservationPageLayoutProvider