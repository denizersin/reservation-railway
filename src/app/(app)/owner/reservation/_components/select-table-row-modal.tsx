import { groupTableStatues, TStatusTableRow, TStatusTableRows } from '@/lib/reservation'
import { TReservation, TRoomWithTranslations } from '@/server/db/schema'
import { api, RouterOutputs } from '@/server/trpc/react'
import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusTableRowCard } from './status-table-row-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'


type Props = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    onSelect: (statusTableRow: TStatusTableRow[]) => void
    disabled?: (statusTableRow: TStatusTableRow) => boolean
    availableTableData: RouterOutputs['reservation']['getAllAvailableReservation2'],
    reservation: TReservation,
    description?: string
}

export const SelectTableRowModal = ({
    isOpen,
    setOpen,
    onSelect,
    disabled,
    availableTableData,
    reservation,
    description

}: Props) => {
    const { data: roomsData } = api.room.getRooms.useQuery({})
    const { data: mealHours } = api.restaurant.getRestaurantMealHours.useQuery({
        // mealId: selectedMeal.id,

    }, {
        select: (data) => data.find((d) => d.meal.id === reservation.mealId)?.mealHours
    })

    const [selectedRoom, setSelectedRoom] = useState<TRoomWithTranslations | undefined>(roomsData?.[0])
    const [selectedHour, setSelectedHour] = useState('')

    const [selectedTables, setSelectedTables] = useState<TStatusTableRow[]>([])


    const tableStatues = availableTableData?.tableStatues
    const roomTableStatues = tableStatues?.find(r => r.roomId === selectedRoom?.id)
    const hourTables = roomTableStatues?.statues.find((hour) => hour.hour === selectedHour)?.tables

    // const groupedTables = useMemo(()=>{
    //     return groupTableStatues(availableTableData!)
    // },[availableTableData])

    useEffect(() => {
        if (mealHours) {
            setSelectedHour(mealHours[0]?.hour!)
        }

    }, [mealHours])

    useEffect(() => {
        if (roomsData) {
            setSelectedRoom(roomsData.find((room) => room.id === reservation.roomId))
        }
    }, [roomsData])
    console.log('rrrr')

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='max-w-[90vw]'>
                <DialogHeader>
                    <DialogTitle>Select Tables to {description}</DialogTitle>
                </DialogHeader>
                <Tabs
                    onValueChange={(value) => setSelectedRoom(roomsData?.find((room) => room.id.toString() === value))}
                    defaultValue={selectedRoom?.id.toString()} className="mt-5">
                    <TabsList>
                        {roomsData?.map((room) => (
                            <TabsTrigger key={room.id} value={room.id.toString()}>{room.translations[0]?.name}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className='flex flex-wrap gap-x-2 gap-y-2'>
                    {
                        hourTables?.map((data) =>
                            <StatusTableRowCard
                                statusTableRow={data}
                                isSelected={
                                    Boolean(selectedTables?.some((r) => r.table?.id === data.table?.id))
                                }
                                disabled={disabled?.(data)}
                                onClcikTable={(r) => {
                                    if (
                                        Boolean(selectedTables?.some((r) => r.table?.id === data.table?.id))
                                    ) {
                                        setSelectedTables(selectedTables?.filter((r) => r.table?.id !== data.table?.id))
                                    } else {
                                        setSelectedTables([...selectedTables!, r])
                                    }
                                }}
                            />
                        )
                    }
                </div>
                <div>
                    <Button onClick={() => {
                        setSelectedTables([])
                        onSelect(selectedTables!)
                    }}>Select</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}