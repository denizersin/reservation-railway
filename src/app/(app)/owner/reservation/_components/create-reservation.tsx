'use client'

import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets'
import { api } from '@/server/trpc/react'
import { useMemo, useState } from 'react'
import { ReservationList2 } from './ReservationList2'
import { TRoomWithTranslations } from '@/server/db/schema/room'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReservationDateCalendar } from './reservation-date-calendar'
import { TableStatues } from './table-statues'
import { CustomComboSelect } from '@/components/custom/custom-combo-select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { localHourToUtcHour } from '@/server/utils/server-utils'


type Props = {}

export const CreateReservation = (props: Props) => {
    const queryClient=useQueryClient();


    const { data: meals } = api.restaurant.getRestaurantMeals.useQuery()

    const { data: roomsData } = api.room.getRooms.useQuery()

    const { data } = api.guest.getAllGuests.useQuery({
        page: 1,
        limit: 100,
    })

    const guestToSelect = useMemo(() => {
        return data?.data.map((guest) => ({
            value: String(guest.id),
            label: guest.name
        })) ?? []
    }, [data])

    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null)



    const [date, setDate] = useState<Date>(new Date())
    const [selectedMeal, setSelectedMeal] = useState<TRestaurantMeal | undefined>(meals?.[0])
    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>(roomsData?.[0])
    const [selectedTableId, setSelectedTableId] = useState<number | undefined>(undefined)
    const [guestCount, setGuestCount] = useState<number>(0)


    const [selectedHour, setSelectedHour] = useState<string | undefined>(undefined)

    const {
        mutate: createReservation,
        isPending: createReservationPending,
    } = api.reservation.createMockReservation.useMutation({
        onSuccess: () => queryClient.invalidateQueries({
            queryKey:getQueryKey(api.reservation.getReservations)
        })
    })

    const handleCreateReservation = () => {
        if (!selectedGuestId || !selectedRoom || !selectedMeal || !selectedTableId || !selectedHour || !guestCount) {
            return
        }
        date.setHours(
            Number(selectedHour.split(':')[0]),
            Number(selectedHour.split(':')[1]),
            0,
            0
        )

        createReservation({
            guestId: selectedGuestId,
            roomId: selectedRoom.id,
            tableId: selectedTableId,
            guestCount: guestCount,
            reservationDate: date,
            reservationTime: selectedHour,
            mealId: selectedMeal.mealId
        }
        )
    }

    return (
        <div>
            <div>
                <CustomComboSelect
                    isFormSelect={false}
                    data={guestToSelect}
                    value={selectedGuestId?.toString()}
                    onValueChange={(value) => setSelectedGuestId(Number(value))}
                />
            </div>


            <ReservationDateCalendar date={date} setDate={setDate} />

            <Tabs
                onValueChange={(value) => setSelectedMeal(meals?.find((meal) => meal.id.toString() === value))}
                defaultValue={selectedMeal?.id.toString()} className="w-[400px]">
                <TabsList>
                    {meals?.map((meal) => (
                        <TabsTrigger key={meal.id} value={meal.id.toString()}>{meal.meal.name}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Tabs
                onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
                defaultValue={selectedRoom?.id.toString()} className="mt-5">
                <TabsList>
                    {roomsData?.map((room) => (
                        <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>


            <TableStatues
                selectedTableId={selectedTableId}
                setSelectedTableId={setSelectedTableId}
                date={date}
                selectedRoom={selectedRoom!}
                selectedMeal={selectedMeal!}
                selectedHour={selectedHour}
                setSelectedHour={setSelectedHour}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
            />

            <Button
                loading={createReservationPending}
                onClick={handleCreateReservation}
            >
                Create Reservation
            </Button>


            <ReservationList2 date={date} />
        </div>
    )
}