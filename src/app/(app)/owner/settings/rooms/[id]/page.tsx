"use client"
import { api } from "@/server/trpc/react"
import { createContext } from "react";
import { RoomTablesList } from "../_components/room-tables-list";
interface RoomDetailContextProps {
    roomId: number;
}

export const RoomDetailContext = createContext<RoomDetailContextProps>({ roomId: 0 });

export default function Page({ params }: { params: { id: string } }) {

    const roomId = Number(params.id)
    const { data: roomData, isLoading } = api.room.getRoomDataById.useQuery({ roomId })

    if (isLoading) {
        return <div>Loading</div>
    }

    return <RoomDetailContext.Provider value={{ roomId }}>
        <div>
            General Informations
            <div>{roomData?.translations[0]?.name}</div>

            <RoomTablesList />
        </div>
    </RoomDetailContext.Provider>
}