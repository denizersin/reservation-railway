{/* <Tabs
onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
defaultValue={selectedRoom?.id.toString()}
value={selectedRoom?.id.toString()}
className="mt-5">
<TabsList>
    {roomsData?.map((room) => (
        <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
    ))}
</TabsList>
</Tabs> */}


import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/server/trpc/react';
import { TRoomWithTranslations } from '@/server/db/schema';

interface RoomTabsProps {
    selectedRoom: TRoomWithTranslations|undefined
    setSelectedRoom: (room: TRoomWithTranslations) => void
}

const RoomTabs: React.FC<RoomTabsProps> = ({ selectedRoom, setSelectedRoom }) => {

    const { data: roomsData } = api.room.getRooms.useQuery({})


    return (
        <Tabs
            onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value)!)}
            defaultValue={selectedRoom?.id.toString()}
            value={selectedRoom?.id.toString()}
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
