import { TReservationRow } from '@/lib/reservation'
import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRestaurantTagsSelectData } from '@/hooks/predefined/predfined'
import { MultiSelect } from '@/components/custom/multi-select'
import { ReservationStatusGuestSection } from '../status-modal/reservation-status-guest-section'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/custom/button'
import { api } from '@/server/trpc/react'
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { useToast } from '@/hooks/use-toast'

type Props = {
    reservation: TReservationRow
    isOpen: boolean
    setOpen: (open: boolean) => void
}

export const ReservationNoteModal = ({
    reservation,
    isOpen,
    setOpen
}: Props) => {

    const { selectData: restaurantTags, isLoading: isLoadingRestaurantTags } = useRestaurantTagsSelectData();

    const [note, setNote] = useState(reservation.guestNote)

    const [reservationTagIds, setReservationTagIds] = useState(reservation.tags.map((tag) => tag.tagId))

    const { onSuccessReservationUpdate } = useMutationCallback()

    const {
        mutate: updateReservationTagAndNote,
        isPending: isUpdatingReservationTagAndNote
    } = api.reservation.updateReservationTagAndNote.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
            toast({
                title: 'Reservation tag and note updated',
                description: 'Reservation tag and note updated successfully',
            })
        }
    })

    const handleSave = () => {
        console.log('save')
        updateReservationTagAndNote({
            reservationId: reservation.id,
            reservationTagIds,
            note: note ?? ''
        })
    }

    const { toast } = useToast()




    return (


        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='md:max-w-[60vw] max-h-[90vh] overflow-y-auto'>
                <div className=' flex'>
                    <div className="c c1 w-1/4">
                        <ReservationStatusGuestSection reservation={reservation} />
                    </div>
                    <div className="c c2 w-2/3 flex flex-col">
                        <div className='my-2'>
                            <div>Reservation Tags:</div>
                            <MultiSelect
                                options={restaurantTags}
                                onValueChange={(value) => setReservationTagIds(value.map((v) => Number(v)))}
                                value={reservationTagIds.map((v) => String(v))}
                                maxCount={10}

                            />
                        </div>

                        <div className='my-2'>
                            <div>Guest Note:</div>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                        <div className='flex justify-end mt-4'>
                            <Button
                                loading={isUpdatingReservationTagAndNote}
                                disabled={isUpdatingReservationTagAndNote}
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                        </div>

                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}