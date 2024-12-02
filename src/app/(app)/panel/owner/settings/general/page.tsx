"use client"
import { Button } from '@/components/custom/button'
import { api } from '@/server/trpc/react'
import { GeneralSettings } from './_components/general-setting'
import { ReviewSettings } from './_components/review/review-settings'
import { Reviews } from './_components/review/reviews'
import { PaymentSettings } from './_components/payment-setting'

type Props = {}

const Page =  (props: Props) => {

    const {
        mutate: syncHoldingReservationMutation,
        isPending: isSyncHoldingReservationPending
    } = api.test.syncHoldingReservation.useMutation()

    return (
        <>
            <GeneralSettings />
            <Reviews />
            <PaymentSettings />
            <Button className='my-6' loading={isSyncHoldingReservationPending} onClick={() => syncHoldingReservationMutation({})}>Sync Holding Reservations</Button>
        </>
    )
}


export default Page