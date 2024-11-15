'use client'
import { ReservationDateCalendar } from '@/app/(app)/owner/reservation/_components/reservation-date-calendar';
import { Button } from '@/components/custom/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMutationCallback } from '@/hooks/useMutationCallback';
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal';
import { TReservationRow, TStatusTableRow } from '@/lib/reservation';
import { cn } from '@/lib/utils';
import { api } from '@/server/trpc/react';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRestaurantMeal, TRoomWithTranslations } from '@/server/db/schema';
import RoomTabs from '@/components/room-tabs';
import MealTabs from '@/components/meal-tabs';
import { useToast } from '@/hooks/use-toast';
import { TableStatues2 } from '@/app/(app)/owner/reservation/_components/v2/table-statues2';

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
    const [selectedMeal, setSelectedMeal] = useState<TRestaurantMeal | undefined>(undefined)
    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>()


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
                roomId: selectedRoom!.id
            }
        })
    }


    useEffect(() => {
        if (meals) {
            setSelectedMeal(meals?.find(m => m.mealId === reservation.mealId))
        }
    }, [meals, reservation.mealId])


    // Loading states
    useShowLoadingModal([updateReservationTimePending])
    const isDateChanged = format(date, 'dd-MM-yyyy') !== format(reservation.reservationDate, 'dd-MM-yyyy')


    useEffect(() => {
        setSelectedRoom(roomsData?.find(r => r.id === reservation.roomId))
    }, [roomsData, reservation.roomId])

    useEffect(() => {
        setSelectedMeal(meals?.[0]);
    }, [meals])

    useEffect(() => {
        if (isDateChanged) {
            setSelectedTableId(undefined)
        }
    }, [isDateChanged])


    useEffect(() => {
        if (selectedRoom?.id === reservation.roomId && date === reservation.reservationDate) {
            setSelectedTableId(reservation.tables[0]?.tableId)
        } else {
            setSelectedTableId(undefined)
        }
    }, [date, selectedMeal, selectedRoom])


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
                        selectedMeal={selectedMeal}
                        setSelectedMeal={setSelectedMeal}
                    />
                    <RoomTabs
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                    />

                    {/* Hour Selection */}
                    {selectedMeal && selectedRoom && <TableStatues2
                        selectedTableId={selectedTableId}
                        setSelectedTableId={setSelectedTableId}
                        date={date}
                        selectedRoom={selectedRoom!}
                        selectedMeal={selectedMeal}
                        selectedHour={selectedHour}
                        setSelectedHour={setSelectedHour}
                        guestCount={guestCount}
                        setGuestCount={setGuestCount}
                    />}

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