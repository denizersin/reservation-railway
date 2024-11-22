"use client"
import { Button } from '@/components/custom/button'
import { api } from '@/server/trpc/react'
import { GeneralSettings } from './general-setting'

type Props = {}

const Page =  (props: Props) => {

    const {
        mutate: syncHoldingReservationMutation,
        isPending: isSyncHoldingReservationPending
    } = api.test.syncHoldingReservation.useMutation()

    return (
        <>
            <GeneralSettings />
            <Button className='my-6' loading={isSyncHoldingReservationPending} onClick={() => syncHoldingReservationMutation({})}>Sync Holding Reservations</Button>
        </>
    )
}


export default Page