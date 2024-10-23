'use client'

import { Button } from '@/components/custom/button'
import { CustomComboSelect } from '@/components/custom/custom-combo-select'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets'
import { TRoomWithTranslations } from '@/server/db/schema/room'
import { api } from '@/server/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect, useMemo, useState } from 'react'
import GuestCrudModal from '../../guests/_components/guest-crud-modal'
import { ReservationDateCalendar } from './reservation-date-calendar'
import { ReservationList2 } from './ReservationList2'
import { TableStatues } from './table-statues'
import { table } from 'console'
import { EnumReservationPrepaymentType } from '@/shared/enums/predefined-enums'
import { ReservationTableUpdateModal } from './reservation-table-update-modal'


type Props = {}

export const CreateReservation = (props: Props) => {


    const queryClient = useQueryClient();

    const [isCreateGuestModalOpen, setIsCreateGuestModalOpen] = useState(false)


    const { data: meals } = api.restaurant.getRestaurantMeals.useQuery()

    const { data: roomsData } = api.room.getRooms.useQuery({})

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


    const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false)

    const {
        mutate: createReservation,
        isPending: createReservationPending,
    } = api.reservation.createMockReservation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getReservations)
            })
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2)
            })
            setSelectedTableId(undefined)
        }
    })

    const handleCreateReservation = () => {
        if (!selectedGuestId || !selectedRoom || !selectedMeal || !selectedTableId || !selectedHour || !guestCount) {
            return
        }
        const newDate = new Date(date)
        newDate.setHours(
            Number(selectedHour.split(':')[0]),
            Number(selectedHour.split(':')[1]),
            0,
            0
        )

        createReservation({
            guestId: selectedGuestId,
            roomId: selectedRoom.id,
            guestCount: guestCount,
            reservationDate: newDate,
            hour: selectedHour,
            mealId: selectedMeal.mealId,
            prePaymentType: EnumReservationPrepaymentType.prepayment,
            tableIds: [selectedTableId],
        }
        )
    }


    const queryDate = useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate.toISOString()
    }, [date])

    const { data: newData } = api.reservation.getAllAvailableReservation2.useQuery({
        date: queryDate,
        mealId: selectedMeal?.mealId!
    })

    console.log(queryDate, 'queryDate')

    useEffect(() => {
        
    }, [])
    



    return (
        <div>
            <div className='flex'>
                <CustomComboSelect
                    isFormSelect={false}
                    data={guestToSelect}
                    value={selectedGuestId?.toString()}
                    onValueChange={(value) => setSelectedGuestId(Number(value))}
                />
                <Button variant={'link'} onClick={() => setIsCreateGuestModalOpen(true)}>Create Guest</Button>
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

            {

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
            }

            <Button
                loading={createReservationPending}
                onClick={handleCreateReservation}
            >
                Create Reservation
            </Button>


            <ReservationList2 date={date} />



            {isCreateGuestModalOpen && <GuestCrudModal
                open={isCreateGuestModalOpen}
                setOpen={setIsCreateGuestModalOpen}
            />}


  


        </div>
    )
}