import { Button } from '@/components/custom/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'
import React, { useState } from 'react'

type Props = {
    reservation: TReservationRow
}

export const ReservationNote = ({ reservation }: Props) => {

    const [note, setNote] = useState(reservation.reservationNotes[0]?.note)

    const { onSuccessReservationUpdate } = useMutationCallback()

    const { toast } = useToast();

    const {
        mutate: updateReservationNote,
        isPending: isUpdatingReservationNote
    } = api.reservation.updateReservationNote.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            toast({
                title: 'Reservation updated',
                description: 'Reservation note updated',
            })
        }
    })

    function handleUpdateReservationNote() {
        if (note === undefined) return
        updateReservationNote({
            reservationId: reservation.id,
            note: note
        })
    }


    return (
        <div className='flex items-center gap-2 my-1'>
            <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className='max-w-[400px]'
                placeholder='ReservationNote'
            />
            <Button
                variant={'outline'}
                loading={isUpdatingReservationNote}
                disabled={isUpdatingReservationNote}
                onClick={handleUpdateReservationNote}>Update Note</Button>
        </div>
    )
}