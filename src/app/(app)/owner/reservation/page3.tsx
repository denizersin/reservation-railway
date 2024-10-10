// "use client";
// import { CustomComboSelect } from '@/components/custom/custom-combo-select';
// import { Calendar } from '@/components/ui/calendar';
// import { api } from '@/server/trpc/react';
// import { useMemo, useState } from 'react';
// import { ReservationList2 } from './_components/ReservationList2';
// import { useRoomSelectData } from '@/hooks/predefined/predfined';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/custom/button';

// type Props = {}

// const ReservationPage = (props: Props) => {

//     const [date, setDate] = useState(new Date())
//     const [selectedGuest, setSelectedGuest] = useState<string | null>(null)

//     const [roomId, setRoomId] = useState<number | null>(null)
//     const [tableId, setTableId] = useState<number | null>(null)
//     const [guestCount, setGuestCount] = useState<number | null>(null)
//     const [reservationTime, setReservationTime] = useState<string | null>(null)

//     const { data } = api.guest.getAllGuests.useQuery({
//         page: 1,
//         limit: 100,
//     })

//     const guestToSelect = useMemo(() => {
//         return data?.data.map((guest) => ({
//             value: String(guest.id),
//             label: guest.name
//         })) ?? []
//     }, [data])




//     const { data: availableInfo } = api.reservation.getAllAvailableReservation.useQuery({
//         date: date
//     })

//     console.log(availableInfo,'availableInfo')

//     const { selectData: roomToSelect, isLoading: isRoomLoading } = useRoomSelectData()
//     const {
//         data: tablesData,
//     } = api.room.getTables.useQuery({
//         roomId: roomId!,
//     }, { enabled: !!roomId })


//     const tablesToSelect = useMemo(() => {
//         return tablesData?.map((table) => ({
//             value: String(table.id),
//             label: table.no + `min-max: ${table.minCapacity}-${table.maxCapacity}`
//         })) ?? []
//     }, [tablesData])


//     const {
//         data: mealHoursData,
//     }=api.restaurant.getRestaurantMealHours.useQuery({})

//     const mealHoursToSelect = useMemo(() => {
//         return mealHoursData?.[0]?.mealHours?.map((mealHour) => ({
//             value: mealHour.hour,
//             label: mealHour.hour
//         })) ?? []
//     }, [mealHoursData])


//     const { mutate: createMockReservation } = api.reservation.createMockReservation.useMutation()


//     const handleCreateReservation = () => {
//         createMockReservation({
//             roomId: roomId!,
//             tableId: tableId!,
//             reservationDate: date,
//             guestCount: guestCount!,
//             guestId: Number(selectedGuest!),
//             reservationTime: reservationTime!,
//         })
//     }

//     return (
//         <div>
//             <CustomComboSelect
//                 isFormSelect={false}
//                 data={guestToSelect}
//                 value={selectedGuest}
//                 onValueChange={setSelectedGuest}
//             />

//             <Calendar
//                 mode="single"
//                 selected={date}
//                 onDayClick={setDate}
//                 className="rounded-md border"
//             />

//             <CustomComboSelect
//                 isFormSelect={false}
//                 data={roomToSelect}
//                 value={String(roomId)}
//                 onValueChange={(value) => setRoomId(Number(value))}
//             />

//             <CustomComboSelect
//                 isFormSelect={false}
//                 data={tablesToSelect}
//                 value={String(tableId)}
//                 onValueChange={(value) => setTableId(Number(value))}
//             />

//             <CustomComboSelect
//                 isFormSelect={false}
//                 data={mealHoursToSelect}
//                 value={reservationTime}
//                 onValueChange={setReservationTime}
//             />

//             <Input
//                 type="number"
//                 value={guestCount}
//                 onChange={(e) => setGuestCount(Number(e.target.value))}
//             />

//             <Button onClick={handleCreateReservation}>Create Reservation</Button>

//             <ReservationList2 date={date} />
//         </div>
//     )
// }

// export default ReservationPage