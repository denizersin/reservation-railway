"use client";
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { RoomDetailContext } from '../page'
import { api } from '@/server/trpc/react'
import ReactGridLayout, { Layout } from 'react-grid-layout'
import "/node_modules/react-grid-layout/css/styles.css"
import "/node_modules/react-resizable/css/styles.css"
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { EnumTableShape } from '@/shared/enums/predefined-enums'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getEnumValues } from '@/server/utils/server-utils'
type Props = {}
// { i: "a", x: 0, y: 0, w: 1, h: 1, minW: 1, maxW: 1 },

export const TableGridLayout = (props: Props) => {
    const { roomId, roomData } = useContext(RoomDetailContext)
    const [count, setCount] = useState(0)

    const [width, setWidth] = useState(roomData.layoutWidth)
    const [rowHeight, setrowHeight] = useState(roomData.layoutRowHeight)

    const { data: tables, isLoading } = api.room.getTables.useQuery({ roomId })

    const [layout, setLayout] = useState<Layout[]>()
    const [initialLayout, setInitialLayout] = useState<Layout[]>([])
    const queryClient = useQueryClient()



    const baseMutationOptions = {
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: getQueryKey(api.room.getTables)
        })
    }


    const { mutate: updateTables,
        isPending: isPendingUpdateTables
    } = api.room.updateMultipleTables.useMutation(baseMutationOptions)

    const {
        mutate: updateTable,
        isPending: isPendingUpdateTable
    } = api.room.updateTable.useMutation(baseMutationOptions)

    const {
        mutate: updateRoom,
        isPending: isPendingUpdateRoom
    } = api.room.updateRoom.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.room.getRoomDataById)
            })
            baseMutationOptions.onSuccess()
        }
    })

    const onLayoutChange = (newLayout: any) => {
        setLayout(newLayout);
        setTimeout(() => {
            setCount(count + 1)
        }, 400);
    };
    useEffect(() => {

        if (!tables) return

        const newLayout = tables.map((table, index) => {
            return {
                i: table.id.toString(),
                x: table.x ?? 0,
                y: table.y ?? 0,
                w: table.w ?? 1,
                h: table.h ?? 1,
                shape: table.shape,
                tableId: table.id,
            } as Layout
        })
        setInitialLayout(newLayout)
        setLayout(newLayout)

    }, [tables])


    function resetLayout() {
        setLayout(initialLayout)
        setrowHeight(roomData.layoutRowHeight)
        setWidth(roomData.layoutWidth)
    }

    function updateLayout() {
        if (!layout) return
        updateTables({
            data: layout.map((l) => {
                return {
                    tableId: Number(l.i),
                    data: {
                        x: l.x,
                        y: l.y,
                        w: l.w,
                        h: l.h,
                    }
                }
            })
        })
        updateRoomWidthAndRowH()
    }

    function updateRoomWidthAndRowH() {
        updateRoom({
            roomId: roomId,
            data: {
                layoutWidth: width,
                layoutRowHeight: rowHeight,

            }
        })
    }

    useShowLoadingModal([isPendingUpdateTables, isLoading, isPendingUpdateRoom, isPendingUpdateTable])
    const shapesArray = useMemo(() => getEnumValues(EnumTableShape), [])

    if (!roomData || !tables) return;

    const cols = Math.round(width / (rowHeight + (rowHeight * .2)));

    console.log(cols, 'cols')


    return (
        <div>

            <div className="flex gap-x-4 my-3">

                <div className="">
                    {width}
                    <Input
                        id='layoutWidth'
                    />
                </div>
                <div className="">
                    {rowHeight}
                    <Input
                        id='layoutRowHeight'
                    />
                </div>

                <Button
                    className='mt-auto'
                onClick={() => {
                    const layoutWidth = (document.getElementById('layoutWidth') as HTMLInputElement).value
                    const layoutRowHeight = (document.getElementById('layoutRowHeight') as HTMLInputElement).value
                    setWidth(Number(layoutWidth||width))
                    setrowHeight(Number(layoutRowHeight||rowHeight))
                }}>
                    Apply
                </Button>
            </div>

            <div className='flex gap-x-3 my-3'>
                <Button
                    onClick={updateLayout}
                >
                    Update Layout
                </Button>
                <Button
                    onClick={resetLayout}
                >
                    Reset Layout
                </Button>
            </div>
            <div className='w-full border-4 border-red-300 overflow-auto'>
                <ReactGridLayout
                    className="layout  border-black border-4"
                    layout={layout}
                    cols={cols}
                    rowHeight={rowHeight}
                    width={width}
                    style={{
                        width: width,
                        minHeight: 1200
                    }}
                    onLayoutChange={onLayoutChange}
                    verticalCompact={false}
                    compactType={null}
                    isResizable={true}
                    preventCollision={true}
                >

                    {
                        tables.map((table) => (
                            <div key={table.id} className={cn('border border-red-400 flex ', {
                                'rounded-full': table.shape === EnumTableShape.round,

                            })}>
                                <div className="flex flex-col">
                                    
                                    <div className="scale-75">

                                    
                                    <DropdownMenu >
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size={'sm'}
                                                disabled={isPendingUpdateTable}
                                                variant="outline">
                                                {table.shape}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <DropdownMenuSeparator />
                                            <DropdownMenuRadioGroup value={table.shape} onValueChange={(val) => updateTable({
                                                data: { shape: val as EnumTableShape },
                                                tableId: table.id
                                            })}>
                                                {
                                                    shapesArray.map((shape) => (
                                                        <DropdownMenuRadioItem value={shape} key={shape}>{shape}</DropdownMenuRadioItem>
                                                    ))
                                                }
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </div>

                                    <div className="flex-1 flex items-center justify-center">
                                        {table.no}
                                    </div>
                                </div>

                            </div>
                        ))
                    }

                </ReactGridLayout>
            </div>
        </div>
    )
}