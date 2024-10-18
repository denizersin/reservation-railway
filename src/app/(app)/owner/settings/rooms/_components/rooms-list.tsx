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
import { RoomCrudModal } from './room-crud-modal';



const RoomsList = () => {

    const updateButtonRef = React.useRef<HTMLButtonElement>(null)

    const router = useRouter();
    const { data: restaurantRooms } = api.room.getRooms.useQuery({ withWaitingRooms: true })

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
        router.push(`/owner/settings/rooms/${room.id}`)
    }


    return (
        <>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Ayarlar / Alanlar</CardTitle>
                    <Button onClick={handleAddNewArea}>Yeni Alan Ekle</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Restoran</TableHead>
                                <TableHead>Başlık</TableHead>
                                <TableHead>Aciklama</TableHead>
                                <TableHead>Sıra</TableHead>
                                <TableHead>Tur</TableHead>
                                <TableHead>Masa Sayisi</TableHead>
                                <TableHead>Kapasite</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {restaurantRooms?.map((room, index) => (
                                <TableRow
                                    onClick={(e) => {
                                        const target = e.target as HTMLElement
                                        if (target.dataset?.type == "action") return
                                        onRoomDetail(room)
                                    }}
                                    key={index} className='cursor-pointer hover:bg-muted'>
                                    <TableCell>Restaurant Name</TableCell>
                                    <TableCell>{room.translations[0]?.name}</TableCell>
                                    <TableCell>{room.translations[0]?.description}</TableCell>
                                    <TableCell>{room.order}</TableCell>
                                    <TableCell>{room.isWaitingRoom ? "Bekleme Alani" : ""}</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>1</TableCell>
                                    <TableCell>
                                        <Button
                                            data-type="action"
                                            ref={updateButtonRef}
                                            onClick={() => onUpdateRoom(room)}>Update</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {isRoomModalOpen && <RoomCrudModal
                isOpen={isRoomModalOpen}
                setOpen={setIsRoomModalOpen}
                room={updateRoomData}
            />}
        </>

    );
};

export default RoomsList;