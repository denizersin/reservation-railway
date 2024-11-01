import { Button } from '@/components/custom/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { ReservationStatusGuestSection } from './reservation-status-guest-section'
import { ReservationStatusLogs } from './reservation-status-logs'
import { ReservationStatusActions } from './reservaton-status-actions'

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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations),
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2)
            })
        }
    })


    useShowLoadingModal([isUpdatePending])


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    CHange Status
                </DialogHeader>
                <div className=' flex'>
                    <div className="c c1 w-1/3">
                        <ReservationStatusGuestSection reservation={reservation} />
                    </div>
                    <div className="c c2 w-2/3">
                        <ReservationStatusLogs reservation={reservation} />
                        <ReservationStatusActions reservation={reservation} />
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}