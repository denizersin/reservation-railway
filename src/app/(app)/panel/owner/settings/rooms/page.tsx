"use client"
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from '@/server/trpc/react';
import { TRoomWithTranslations } from '@/server/db/schema/room';
import { useRouter } from 'next/navigation';
import { RoomCrudModal } from './_components/room-crud-modal';
import RoomsList from './_components/rooms-list';
import LimitationsList from './_components/limitations-list';
// import { CreateMockReservation } from './create-mock-reservation';
import PermanentLimitationsList from './_components/permanent-limitations-list';



const RestaurantAreasTable = () => {

    const updateButtonRef = React.useRef<HTMLButtonElement>(null)

    const router = useRouter();
    const { data: restaurantRooms } = api.room.getRooms.useQuery({})

    const handleAddNewArea = () => {
        setIsRoomModalOpen(true)
        setUpdateRoomData(undefined)
    };


    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
    const [updateRoomData, setUpdateRoomData] = useState<TRoomWithTranslations | undefined>()

    const onUpdateRoom = (room: TRoomWithTranslations) => {
        setUpdateRoomData(room)
        setIsRoomModalOpen(true)
    }

    const onRoomDetail = (room: TRoomWithTranslations) => {
        router.push(`/panel/owner/settings/rooms/${room.id}`)
    }


    return (
        <>
            <RoomsList />
            <LimitationsList />
            
            <PermanentLimitationsList />

            {/* <CreateMockReservation /> */}

        </>

    );
};

export default RestaurantAreasTable;