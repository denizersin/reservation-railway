'use client'

import { TReservationRow } from "@/lib/reservation"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { api } from "@/server/trpc/react"
import { useForm } from "react-hook-form"
import TReservationValidator from "@/shared/validators/reservation"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/custom/button"
import { useMutationCallback } from "@/hooks/useMutationCallback"

export const CreatePrepaymentModal = ({
    reservation,
    open,
    setOpen,
}: {
    reservation: TReservationRow
    open: boolean
    setOpen: (open: boolean) => void

}) => {

    const [withSms, setWithSms] = useState(true)
    const [withEmail, setWithEmail] = useState(true)

    const { onSuccessReservationUpdate } = useMutationCallback()

    const { mutateAsync: createPrepayment, isPending: isCreatePrepaymentPending } = api.reservation.requestForPrepayment.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            setOpen(false)
        }
    })
    const { data: restaurantSettings } = api.restaurantSetting.getRestaurantPaymentSettings.useQuery()
    const [defaultAmount, setDefaultAmount] = useState(true)

    const { register, handleSubmit } = useForm<TReservationValidator.requestForPrepaymentForm>({
        defaultValues: {
            customPrepaymentAmount: 0
        }
    })

    const onSubmit = handleSubmit(async (data) => {
        createPrepayment({
            reservationId: reservation.id,
            data: {
                customPrepaymentAmount: defaultAmount ? undefined : Number(data.customPrepaymentAmount)
            },
            notificationOptions: {
                withEmail,
                withSms
            }
        })
    })




    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                Prepayment
            </DialogHeader>
            <form onSubmit={onSubmit}>
                <div>
                    <Checkbox
                        checked={defaultAmount}
                        onCheckedChange={(checked) => setDefaultAmount(checked as boolean)}
                    />
                    <Label>Default Amount</Label>
                </div>
                <div>
                    {defaultAmount ? <p>Default amount is {restaurantSettings?.prePaymentPricePerGuest! * reservation.guestCount}</p> : <Input
                        type="number"
                        {...register('customPrepaymentAmount')}
                    />}
                </div>

                <div className="my-2 flex flex-wrap gap-2">
                    <div className='flex gap-2'>
                        <Checkbox
                            checked={withSms}
                            onCheckedChange={(s) => setWithSms(s as boolean)}
                        />
                        <Label>Send SMS</Label>
                    </div>
                    <div className='flex gap-2'>
                        <Checkbox
                            checked={withEmail}
                            onCheckedChange={(s) => setWithEmail(s as boolean)}
                        />
                        <Label>Send Email</Label>
                    </div>
                </div>

                <Button
                    loading={isCreatePrepaymentPending}
                    type="submit" disabled={isCreatePrepaymentPending}>
                    {isCreatePrepaymentPending ? 'Creating...' : 'Create'}
                </Button>
            </form>
        </DialogContent>
    </Dialog>

}