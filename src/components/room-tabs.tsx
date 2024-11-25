import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/server/trpc/react';

interface RoomTabsProps {
    selectedRoomId: number | undefined;
    setSelectedRoomId: (roomId: number | undefined) => void;
}

const RoomTabs: React.FC<RoomTabsProps> = ({ selectedRoomId, setSelectedRoomId }) => {
    const { data: roomsData } = api.room.getRooms.useQuery({});

    useEffect(() => {
        if (roomsData && !selectedRoomId) {
            setSelectedRoomId(roomsData[0]?.id)
        }
    }, [roomsData])

    return (
        <Tabs
            onValueChange={(value) => setSelectedRoomId(Number(value))}
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
