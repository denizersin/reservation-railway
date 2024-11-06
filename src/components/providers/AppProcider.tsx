"use client"
import { localStorageStates } from '@/data/local-storage-states'
import useFirstRender from '@/hooks/useFirstRender'
import React, { useEffect } from 'react'

type Props = {
    children: React.ReactNode | React.ReactNode[]
}

export const AppProvider = (props: Props) => {

    const isFirstRender = useFirstRender()

    useEffect(() => {

        if (isFirstRender) {
            localStorageStates.clearReservationState()
            localStorageStates.clearReservationUserInfoFormValues()
        }

        return () => {
        }

    }, [])


    return (props.children)
}
