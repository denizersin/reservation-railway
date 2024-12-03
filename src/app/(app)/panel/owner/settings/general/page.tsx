"use client"
import { Button } from '@/components/custom/button'
import { api } from '@/server/trpc/react'
import { CalendarSetting } from './_components/calendar-setting'
import { GeneralSettings } from './_components/general-setting'
import { PaymentSettings } from './_components/payment-setting'
import { Reviews } from './_components/review/reviews'

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
            <CalendarSetting/>
            <Button className='my-6' loading={isSyncHoldingReservationPending} onClick={() => syncHoldingReservationMutation({})}>Sync Holding Reservations</Button>
        </>
    )
}


export default Page