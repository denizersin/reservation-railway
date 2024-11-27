import React, { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/custom/button';
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation';
import { LocalNameFilter } from '../table/local-name-filter';
import { api } from '@/server/trpc/react';
import { useReservationsContext } from '../../../../page';
import RoomTabs from '@/components/room-tabs';
import { EnumMealNumeric } from '@/shared/enums/predefined-enums';
import { TableViewRowCard } from './table-view-row-card';
import { WaitingTableStatus } from './waitin-table-status';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { EnumTableShape } from '@/shared/enums/predefined-enums';
import { cn } from '@/lib/utils';
import { TTable } from '@/server/db/schema';
import { HourTabs } from '@/components/hour-tabs';

const dummyData = {
    "Ana Salon": [
        { id: 10, name: "Emir Dereli", time: "19:15", guests: "4/4" },
        { id: 11, name: "Gizem Yalınkılıç", time: "20:30", guests: "2/2" },
        { id: 12, name: "Erik Van Dooren", time: "18:30", guests: "2/2" },
        { id: 20, name: "Can Güneysu", time: "20:00", guests: "4/4" },
        { id: 21, name: "Cenk Demiroğlu", time: "20:00", guests: "2/2" },
        { id: 22, name: "Aydın Alıc", time: "19:30", guests: "2/2" },
        { id: 30, name: "Aziz Abdullah", time: "18:30", guests: "2/5" },
        { id: 31, name: "Heidi Tam", time: "18:30", guests: "2/2" },
        { id: 32, name: "Alec Mercer", time: "19:30", guests: "2/3" },
        { id: 40, name: "Francene Noel", time: "19:30", guests: "4/5" },
        { id: 41, name: "Manon Fisher", time: "18:30", guests: "2/2" },
        { id: 42, name: "Constantin Bertoli", time: "20:15", guests: "2/3" },
    ],
    "Chef Table": [
        { id: 10, name: "Emir Dereli", time: "19:15", guests: "4/4" },
        { id: 11, name: "Gizem Yalınkılıç", time: "20:30", guests: "2/2" },
        { id: 12, name: "Erik Van Dooren", time: "18:30", guests: "2/2" },
        { id: 20, name: "Can Güneysu", time: "20:00", guests: "4/4" },
    ],
    "Teras": []
};

const smallTables = ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6", "A-7"];





const TablesView = () => {

    const { queryDate, reservationsData } = useReservationsContext()

    const { data: avaliableTablesData } = api.reservation.getTableStatues.useQuery({
        date: queryDate,
        mealId: EnumMealNumeric.dinner
    })



    const updateQueryParam = useUpdateQueryParams({ replace: true })

    const globalFilter = useSearchParams().get('globalFilter') || ''

    const reset = () => {
        updateQueryParam({ globalFilter: '' })
    }
    const { data: roomsData } = api.room.getRooms.useQuery({ withWaitingRooms: true })

    const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(undefined)
    const [isWaitingRoom, setIsWaitingRoom] = useState(false)


    const currentTables = useMemo(() => {
        const globalFilterLower = globalFilter.toLowerCase()
        if (!avaliableTablesData) return []
        const tables = avaliableTablesData?.find((t) => t.roomId === selectedRoomId)?.tables
        if (!globalFilter) return tables

        const filteredTables = tables?.filter((t) => {
            const guestName = t.guest?.name.toLowerCase() ?? ''
            const guestSurname = t.guest?.surname.toLowerCase() ?? ''
            const phone = t.guest?.phone.toLowerCase() ?? ''
            return guestName.includes(globalFilterLower) || guestSurname.includes(globalFilterLower) || phone.includes(globalFilterLower)
        })


        return filteredTables
    }, [avaliableTablesData, selectedRoomId, globalFilter])

    const getLayoutOfTable = (table: TTable): Layout => {
        return {
            h: table.h!,
            i: table.id.toString(),
            w: table.w!,
            x: table.x!,
            y: table.y!,
            shape: table.shape,
            tableId: table.id
        }
    }

    const gridLayout = useMemo(() => {
        if (!currentTables) return [];
        return currentTables.map(table => getLayoutOfTable(table.table!));
    }, [currentTables]);

    const selectedRoom = roomsData?.find(room => room.id === selectedRoomId);
    const { layoutRowHeight = 100, layoutWidth = 800 } = selectedRoom || {};
    const cols = Math.round(layoutWidth / (layoutRowHeight + (layoutRowHeight * 0.2)));

    return (
        <div className="p-4">
            <div className='flex items-center gap-x-2 '>
                <RoomTabs
                    selectedRoomId={selectedRoomId}
                    setSelectedRoomId={setSelectedRoomId}
                    withWaitingRooms={true}
                    setIsWaitingRoom={setIsWaitingRoom}
                />
                <div className='flex items-center gap-x-2'>
                    <div className='w-[200px]'>
                        <LocalNameFilter />
                    </div>
                    {globalFilter && (
                        <Button variant='ghost' onClick={reset} className='h-8 px-2 lg:px-3'>
                            Reset
                            <Cross2Icon className='ml-2 h-4 w-4' />
                        </Button>
                    )}
                </div>
            </div>


            {isWaitingRoom ? (
                <WaitingTableStatus />
            ) : (
                <div className="mt-4 ">
                    <ReactGridLayout
                        className="layout border-black border-2 py-4"
                        layout={gridLayout}
                        cols={cols}
                        rowHeight={layoutRowHeight}
                        width={layoutWidth}
                        style={{
                            minHeight: 600
                        }}
                        verticalCompact={false}
                        compactType={null}
                        preventCollision={true}
                        isDraggable={false}
                        isResizable={false}
                    >
                        {currentTables?.map((tableStatus) => {
                            const table = tableStatus.table!;
                            return (
                                <div
                                    key={table.id.toString()}
                                    className={cn('border flex items-center justify-center', {
                                        'rounded-full': table.shape === EnumTableShape.round,
                                    })}
                                >
                                    <TableViewRowCard
                                        key={table.id}
                                        statusTableRow={tableStatus}
                                    />
                                </div>
                            );
                        })}
                    </ReactGridLayout>
                </div>
            )}
        </div>
    );
};

export default TablesView;