// import { api } from '@/server/trpc/react';
// import { EnumMeals } from '@/shared/enums/predefined-enums';
// import React, { useEffect, useMemo, useState } from 'react'

// type Props = {}

// export const CreateMockReservation = (props: Props) => {


//     const [selectedRoomId, setSelectedRoomId] = useState<undefined | number>(undefined)

//     const { data: rooms } = api.room.getRooms.useQuery();

//     const { data: tables } = api.room.getTables.useQuery({ roomId: selectedRoomId! }, {
//         enabled: Boolean(selectedRoomId)
//     })

//     const { data: mealHoursData } = api.restaurant.getRestaurantMealHours.useQuery({})


//     const {
//         mutate: createMockReservation,
//         isPending
//     } = api.reservation.createMockReservation.useMutation();


//     useEffect(() => {

//         if (rooms && rooms.length > 0) {
//             setSelectedRoomId(rooms[0]?.id)
//         }

//     }, [rooms])

//     const hours = mealHoursData?.find((hourData) => hourData.meal.name === EnumMeals.dinner)?.mealHours || [];

//     return (
//         <div>
//             <h1>Create Mock Reservation</h1>
//             <form id="create-mock-reservation">
//                 <div className="grid grid-cols-2 gap-4">
//                     <select
//                         name="roomId"
//                         value={selectedRoomId}
//                         onChange={(e) => setSelectedRoomId(Number(e.target.value))}
//                     >
//                         <option value={undefined}>Select Room</option>
//                         {rooms?.map((room) => (
//                             <option key={room.id} value={room.id}>
//                                 {room.translations[0]?.name}
//                             </option>
//                         ))}
//                     </select>
//                     <select name="tableId">
//                         <option>Select Table</option>
//                         {tables?.map((table) => (
//                             <option key={table.id} value={table.id}>
//                                 {`id: ${table.id}, max: ${table.maxCapacity}, min: ${table.minCapacity}`}
//                             </option>
//                         ))}
//                     </select>
//                     <input type="date" name="date" />
//                     <input type="number" name="number" />

//                     <select name="time">
//                         <option>Select Time</option>
//                         {hours.map((hour) => (
//                             <option key={hour.id} value={hour.hour}>
//                                 {hour.hour}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <button
//                     onClick={(e) => {
//                         e.preventDefault();
//                         const element = document.getElementById('create-mock-reservation') as HTMLFormElement;
//                         const formData = new FormData(element);
//                         const data = Object.fromEntries(formData.entries());
//                         console.log(data)
//                         createMockReservation({
//                             roomId: Number(data.roomId),
//                             tableId: Number(data.tableId),
//                             reservationDate: new Date(data.date as any),
//                             reservationTime: String(data.time),
//                             guestCount: Number(data.number)
//                         })

//                     }}
//                 >
//                     Create Mock Reservation
//                     {
//                         isPending && <span>Loading...</span>
//                     }
//                 </button>
//             </form>
//         </div>
//     )
// }