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
    setOpen
}: {
    reservation: TReservationRow
    open: boolean
    setOpen: (open: boolean) => void
}) => {

    const { onSuccessReservationUpdate } = useMutationCallback()

    const { mutateAsync: createPrepayment, isPending: isCreatePrepaymentPending } = api.reservation.requestForPrepayment.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            setOpen(false)
        }
    })
    const { data: restaurantSettings } = api.restaurant.getRestaurantGeneralSettings.useQuery()
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
                    {defaultAmount ? <p>Default amount is {restaurantSettings?.prePayemntPricePerGuest! * reservation.guestCount}</p> : <Input
                        type="number"
                        {...register('customPrepaymentAmount')}
                    />}
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