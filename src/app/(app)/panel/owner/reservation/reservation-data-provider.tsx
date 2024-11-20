"use client";
import { TMeal } from '@/server/db/schema/predefined'
import { TRestaurantMeal } from '@/server/db/schema/restaurant-assets'
import { TRoomInsertWithTranslations, TRoomWithTranslations } from '@/server/db/schema/room'
import { api } from '@/server/trpc/react'
import React from 'react'

type Props = {
    children: React.ReactNode
    reservationMeals: TRestaurantMeal[]
    restaurantRooms: TRoomWithTranslations[]
}

export const ReservationDataProvider = ({
    reservationMeals,
    restaurantRooms,
    children
}: Props) => {

    const { data: roomsData } = api.room.getRooms.useQuery({}, {
        initialData: restaurantRooms
    })

    const { data: mealsData } = api.restaurant.getRestaurantMeals.useQuery(undefined, {
        initialData: reservationMeals
    })

    return children

}