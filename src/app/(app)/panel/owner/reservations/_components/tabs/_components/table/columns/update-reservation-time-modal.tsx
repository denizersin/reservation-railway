'use client'
import { ReservationDateCalendar } from '@/app/(app)/panel/owner/reservation/_components/reservation-date-calendar';
import { TableStatues2 } from '@/app/(app)/panel/owner/reservation/_components/v2/table-statues2';
import { Button } from '@/components/custom/button';
import MealTabs from '@/components/meal-tabs';
import RoomTabs from '@/components/room-tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutationCallback } from '@/hooks/useMutationCallback';
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal';
import { TReservationRow } from '@/lib/reservation';
import { api } from '@/server/trpc/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    reservation: TReservationRow
}

export const UpdateReservationTmeModal = ({
    isOpen,
    setOpen,
    reservation
}: Props) => {
    // State for reservation data
    const [date, setDate] = useState<Date>(reservation.reservationDate)
    const [guestCount, setGuestCount] = useState<number>(reservation.guestCount)
    const [selectedHour, setSelectedHour] = useState<string | undefined>(reservation.hour)
    const [selectedTableId, setSelectedTableId] = useState<number | undefined>(reservation.tables[0]?.tableId)
    const [selectedMealId, setSelectedMealId] = useState<number | undefined>(reservation.mealId)
    const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(reservation.roomId)

    const [withEmail, setWithEmail] = useState(true)
    const [withSms, setWithSms] = useState(true)


    const { onSuccessReservationUpdate } = useMutationCallback()

    // Fetch meals
    const { data: meals } = api.restaurant.getRestaurantMeals.useQuery()

    //Fetch Rooms
    const { data: roomsData } = api.room.getRooms.useQuery({})


    // Update mutation
    const { mutate: updateReservationTime, isPending: updateReservationTimePending } =
        api.reservation.updateReservationTime.useMutation({
            onSuccess: () => {
                onSuccessReservationUpdate(reservation.id)
                setOpen(false)
            }
        })


    const { toast } = useToast()
    // Handle update
    const handleUpdateReservation = () => {

        if (isDateChanged && !selectedTableId) {
            toast({
                title: 'Lütfen masa seçiniz',
                description: 'Masa seçimi yapmadan tarih güncelleme yapılamaz',
                variant: 'destructive'
            })
            return
        }

        const hour = selectedHour || reservation.hour
        const newDate = new Date(date)
        newDate.setHours(
            Number(hour.split(':')[0]),
            Number(hour.split(':')[1]),
            0,
            0
        )

        updateReservationTime({
            reservationId: reservation.id,
            data: {
                guestCount,
                reservationDate: newDate,
                hour,
                tableId: selectedTableId!,
                roomId: selectedRoomId!
            },
            notificationOptions: { withEmail, withSms }
        })
    }





    // Loading states
    useShowLoadingModal([updateReservationTimePending])
    const isDateChanged = format(date, 'dd-MM-yyyy') !== format(reservation.reservationDate, 'dd-MM-yyyy')


 



    useEffect(() => {
        if (isDateChanged) {
            setSelectedTableId(undefined)
        }
    }, [isDateChanged])


    useEffect(() => {
        if (selectedRoomId === reservation.roomId && 
            
            format(date, 'dd-MM-yyyy') === format(reservation.reservationDate, 'dd-MM-yyyy')) {
            setSelectedTableId(reservation.tables[0]?.tableId)
        } else {
            setSelectedTableId(undefined)
        }
    }, [date, selectedMealId, selectedRoomId])

    // Find current room and meal for TableStatues2
    const currentRoom = roomsData?.find(r => r.id === selectedRoomId)
    const currentMeal = meals?.find(m => m.id === selectedMealId)

    console.log(currentRoom, currentMeal, 'currentRoom, currentMeal')


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    <DialogTitle>{reservation?.guest?.name}</DialogTitle>
                    <DialogTitle>{format(date, 'dd MMMM yyyy')}</DialogTitle>
                </DialogHeader>
                <div>

                    <ReservationDateCalendar date={date} setDate={setDate} />

                    {/* Meal Selection */}
                    <MealTabs
                        selectedMealId={selectedMealId}
                        setSelectedMealId={setSelectedMealId}
                    />
                    <RoomTabs
                        selectedRoomId={selectedRoomId}
                        setSelectedRoomId={setSelectedRoomId}
                    />

                    {/* Hour Selection */}
                    {selectedMealId && selectedRoomId && <TableStatues2
                        selectedTableId={selectedTableId}
                        setSelectedTableId={setSelectedTableId}
                        date={date}
                        selectedRoomId={selectedRoomId}
                        selectedMealId={selectedMealId}
                        selectedHour={selectedHour}
                        setSelectedHour={setSelectedHour}
                        guestCount={guestCount}
                        setGuestCount={setGuestCount}
                    />}

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

                    {/* Guest Count and Submit */}
                    <div>


                        <Button
                            // disabled={!isChangedAndisAvailable}
                            loading={updateReservationTimePending}
                            onClick={handleUpdateReservation}
                        >
                            UPDATE
                        </Button>
                    </div>

                </div>



            </DialogContent>
        </Dialog>
    )
}