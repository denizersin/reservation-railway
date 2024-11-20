"use client"
import { localStorageStates } from '@/data/local-storage-states'
import { ClientI18nProvider } from '@/hooks/18n-provider'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

type Props = {
    children: React.ReactNode
}

const Layout = (props: Props) => {

    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        localStorageStates.clearWaitlistFormValues()
        localStorageStates.clearReservationState()
        localStorageStates.clearReservationUserInfoFormValues()
        localStorageStates.clearWaitlistReservationState()


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