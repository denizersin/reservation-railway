"use client"
import { api } from "@/server/trpc/react"
import { createContext } from "react";
import { RoomTablesList } from "../_components/room-tables-list";
import { TRoomWithTranslations } from "@/server/db/schema";
import { TableGridLayout } from "./_components/table-grid-layout";
interface RoomDetailContextProps {
    roomId: number;
    roomData: TRoomWithTranslations
}

export const RoomDetailContext = createContext<RoomDetailContextProps>({ roomId: 0 } as RoomDetailContextProps);

export default function Page({ params }: { params: { id: string } }) {

    const roomId = Number(params.id)
    const { data: roomData, isLoading } = api.room.getRoomDataById.useQuery({ roomId })

    if (isLoading) {
        return <div>Loading</div>
    }


    return <RoomDetailContext.Provider value={{ roomId, roomData: roomData! }}>
        <div>
            General Informations
            <div>{roomData?.translations[0]?.name}</div>
            <RoomTablesList />
            <TableGridLayout />
        </div>
    </RoomDetailContext.Provider>
}