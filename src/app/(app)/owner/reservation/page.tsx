import { api } from "@/server/trpc/server"
import { ReservationDataProvider } from "./reservation-data-provider"
import { CreateReservation } from "./_components/create-reservation"

export default async function Page() {

    const reservationMeals = await api.restaurant.getRestaurantMeals()
    const restaurantRooms = await api.room.getRooms({})

    return (
        <ReservationDataProvider
            reservationMeals={reservationMeals}
            restaurantRooms={restaurantRooms}
        >
            <CreateReservation/>
        </ReservationDataProvider>
    )
}