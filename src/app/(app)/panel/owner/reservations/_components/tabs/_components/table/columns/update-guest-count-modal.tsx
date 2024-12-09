'use client'
import { Button } from '@/components/custom/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useMutationCallback } from '@/hooks/useMutationCallback';
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal';
import { TReservationRow } from '@/lib/reservation';
import { api } from '@/server/trpc/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    reservation: TReservationRow
}

export const UpdateGuestCountModal = ({
    isOpen,
    setOpen,
    reservation
}: Props) => {
    const [guestCount, setGuestCount] = useState<number>(reservation.guestCount)
    const [withEmail, setWithEmail] = useState(true)
    const [withSms, setWithSms] = useState(true)

    const { onSuccessReservationUpdate } = useMutationCallback()

    // Update mutation
    const { mutate: updateGuestCount, isPending: updateGuestCountPending } =
        api.reservation.updateReservationGuestCount.useMutation({
            onSuccess: () => {
                onSuccessReservationUpdate(reservation.id)
                setOpen(false)
            }
        })

    // Handle update
    const handleUpdateGuestCount = () => {
        updateGuestCount({
            reservationId: reservation.id,
            guestCount,
            notificationOptions: { withEmail, withSms }
        })
    }

    console.log(reservation,'res')

    // Loading states
    useShowLoadingModal([updateGuestCountPending])

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Update Guest Count
                    </DialogTitle>
                    <div className="text-lg flex flex-wrap gap-2">
                        <div className='font-medium'>
                            {reservation.guest.name} {reservation.guest.surname}
                        </div>
                        <div>
                            {reservation.reservationDate.toLocaleString('tr-TR', { day: '2-digit', month: 'long', weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Guest Count</Label>
                        <div className="flex gap-2">
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                                <div
                                    key={num}
                                    onClick={() => setGuestCount(num)}
                                    className={cn(
                                        'w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:opacity-80',
                                        {
                                            'bg-primary text-primary-foreground': guestCount === num,
                                            'bg-secondary': guestCount !== num
                                        }
                                    )}
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                checked={withSms}
                                onCheckedChange={(s) => setWithSms(s as boolean)}
                            />
                            <Label>Send SMS</Label>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                checked={withEmail}
                                onCheckedChange={(s) => setWithEmail(s as boolean)}
                            />
                            <Label>Send Email</Label>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        loading={updateGuestCountPending}
                        onClick={handleUpdateGuestCount}
                    >
                        Update Guest Count
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 