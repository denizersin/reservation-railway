import React, { useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, RouterOutputs } from '@/server/trpc/react';

interface RoomTabsProps {
    selectedRoomId: number | undefined;
    setSelectedRoomId: (roomId: number | undefined) => void;
    withWaitingRooms?: boolean
    isWaitingRoom?: boolean
    setIsWaitingRoom?: (isWaitingRoom: boolean) => void
}

const RoomTabs: React.FC<RoomTabsProps> = ({ selectedRoomId, setSelectedRoomId, withWaitingRooms, setIsWaitingRoom }) => {
    const { data: roomsData } = api.room.getRooms.useQuery({
        withWaitingRooms
    });


    useEffect(() => {
        if (roomsData && !selectedRoomId) {
            onChangeRoomId(roomsData[0]?.id.toString() || "")

        }
    }, [roomsData])

    const onChangeRoomId = (value: string) => {
        const newSelectedRoomId = Number(value)
        setSelectedRoomId(newSelectedRoomId)
        const newIsWaitingRoom = roomsData?.find((room) => room.id === newSelectedRoomId)?.isWaitingRoom || false
        setIsWaitingRoom?.(newIsWaitingRoom)
    }

    return (
        <Tabs
            onValueChange={onChangeRoomId}
            defaultValue={selectedRoomId?.toString()}
            value={selectedRoomId?.toString()}
            className="mt-0"
        >
            <TabsList>
                {roomsData?.map((room) => (
                    <TabsTrigger key={room.id} value={room.id.toString()}>
                        {room.translations[0]?.name}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};

export default RoomTabs;
