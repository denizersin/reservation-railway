"use client"
import { ClientI18nProvider } from '@/hooks/18n-provider'
import { useReservationStates } from '@/hooks/front/useReservatoinStates'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

type Props = {
    children: React.ReactNode
}

const Layout = (props: Props) => {

    const pathname = usePathname()
    const router = useRouter()

    const { clearWaitlistFormValues, clearReservationState, clearReservationUserInfoFormValues, clearWaitlistReservationState } = useReservationStates()

    useEffect(() => {
        clearWaitlistFormValues()
        clearReservationState()
        clearReservationUserInfoFormValues()
        clearWaitlistReservationState()


        if (!pathname.includes('reservation/status')) {
            router.push('/reservation')
        }
    }, [])

    return (

        <ClientI18nProvider>
            {props.children}
        </ClientI18nProvider>
    )
}

export default Layout