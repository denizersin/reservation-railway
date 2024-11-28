import { Button } from '@/components/custom/button';
import RoomTabs from '@/components/room-tabs';
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams';
import { cn } from '@/lib/utils';
import { TTable } from '@/server/db/schema';
import { api } from '@/server/trpc/react';
import { EnumMealNumeric, EnumTableShape } from '@/shared/enums/predefined-enums';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { useReservationsContext } from '../../../../page';
import { LocalNameFilter } from '../table/local-name-filter';
import { TableViewRowCard } from './table-view-row-card';
import { WaitingTableStatus } from './waitin-table-status';
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";






const TablesView = () => {

    const { queryDate } = useReservationsContext()

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
            const phone = t.guest?.fullPhone.toLowerCase() ?? ''
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