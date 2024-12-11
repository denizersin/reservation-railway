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
import { ReservationStatusFooter } from './reservation-status-footer'
import { useToast } from '@/hooks/use-toast'
import { useMutationCallback } from '@/hooks/useMutationCallback'

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
    const { onSuccessReservationUpdate } = useMutationCallback()
    const {
        mutate: updateReservationStatus,
        isPending: isUpdatePending
    } = api.reservation.updateReservationStatus.useMutation({
        onSuccess: () => {
            onSuccessReservationUpdate(reservation.id)
        }
    })


    useShowLoadingModal([isUpdatePending])

    const { toast } = useToast()

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='md:max-w-[70vw] flex max-h-[90vh] overflow-y-auto'>
                {/* <DialogHeader>
                    CHange Status
                </DialogHeader> */}
                <div className=' flex w-full '>
                    <div className="c c1 w-1/4">
                        <ReservationStatusGuestSection reservation={reservation} />
                    </div>
                    <div className="c c2 w-full flex-1  flex flex-col">
                        <ReservationStatusLogs reservation={reservation} />
                        <ReservationStatusActions reservation={reservation} />
                        <ReservationStatusFooter reservation={reservation} />
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}