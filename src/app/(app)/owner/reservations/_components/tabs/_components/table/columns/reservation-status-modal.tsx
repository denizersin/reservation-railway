import { Button } from '@/components/custom/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'
import { EnumReservationExistanceStatusNumeric, EnumReservationStatus, EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    reservation: TReservationRow
}

export const ReservationStatusModal = ({
    isOpen,
    setOpen,
    reservation
}: Props) => {

    const queryClient = useQueryClient()
    const {
        mutate: updateReservationStatus,
        isPending: isUpdatePending
    } = api.reservation.updateReservationStatus.useMutation({
        onSuccess:()=>{
            queryClient.invalidateQueries({
                queryKey:getQueryKey(api.reservation.getReservations),
            })
            queryClient.invalidateQueries({
                queryKey:getQueryKey(api.reservation.getAllAvailableReservation2)
            })
        }
    })

    console.log(EnumReservationStatus, 'EnumReservationStatus')
    console.log(EnumReservationExistanceStatusNumeric, 'EnumReservationExistanceStatusNumeric')

    useShowLoadingModal([isUpdatePending])


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    CHange Status
                </DialogHeader>
                <div>
                    <Button
                        variant={'destructive'}
                        onClick={() => {
                            updateReservationStatus({
                                reservationId: reservation.id,
                                reservationStatusId: EnumReservationStatusNumeric.cancel
                            })
                        }}
                    >
                        Cancel Reservation
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    )
}