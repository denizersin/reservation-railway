import { groupTableStatues, TReservationRow, TStatusTableRow } from '@/lib/reservation'
import { TReservation, TRoomWithTranslations, TTable } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import React, { useEffect, useMemo, useState } from 'react'
import { ShapeType, RelationType } from 'react-archer/lib/types';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import "/node_modules/react-grid-layout/css/styles.css"
import "/node_modules/react-resizable/css/styles.css"
import { ArcherContainer, ArcherElement, } from 'react-archer';
import { cn } from '@/lib/utils';
import { EnumTableShape } from '@/shared/enums/predefined-enums';
import { GridStatusTableRowCard } from './grid-status-table-row-card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TSelectionRowState } from './reservation-grid-status-modal';
import { Button } from '@/components/ui/button';

const colors = ['blue', 'red', 'green', 'purple', 'pink', 'orange', 'gray', 'indigo', 'teal', 'cyan', 'lime', 'amber', 'brown', 'lightBlue', 'lightGreen', 'deepOrange', 'deepPurple', 'blueGray']

type Props = {}

export type StatusTableRowWithRelation = TStatusTableRow & {
    layout: Layout
    relations?: RelationType[],
    isCurrentReservation: boolean
    group: TStatusTableRow[]
}

export const ReservationGridStatus = ({
    reservation,
    selectedRoom,
    setSelectedRoom,
    setSelectionRowState,
    onSucessCrudTable,
    selectionRowState
}: {
    reservation: TReservationRow,
    selectedRoom: TRoomWithTranslations|undefined,
    setSelectedRoom: (room: TRoomWithTranslations|undefined) => void,
    selectionRowState: TSelectionRowState,
    setSelectionRowState: (state: TSelectionRowState) => void,
    onSucessCrudTable: () => void
}) => {

    const { data: roomsData } = api.room.getRooms.useQuery({})
    const [statusTableRow, setStatusTableRow] = useState<TStatusTableRow | undefined>(undefined)
    const [count, setCount] = useState(0)


    const { deSelectedRows, selectedRows } = selectionRowState

    const [thisTableRows, setThisTableRows] = useState<TStatusTableRow[]>([])



    const queryDate = useMemo(() => {
        const date = new Date(reservation.reservationDate)
        date.setHours(0, 0, 0, 0)
        return date.toISOString()
    }, [reservation.reservationDate])
    const { data: availableTableData } = api.reservation.getAllAvailableReservation2.useQuery({
        date: queryDate,
        mealId: reservation.mealId
    })

    const [groupData, gridData] = useMemo(() => {
        const tableStatues = availableTableData?.tableStatues.find(r => r.roomId === selectedRoom?.id)
            ?.statues.find((hour) => hour.hour === statusTableRow?.reservation?.hour)?.tables
        const groups = groupTableStatues(tableStatues ?? [])
        console.log(tableStatues, 'tableStatues')
        const tablesWithRelationMap: Record<number, StatusTableRowWithRelation> = {}

        groups.forEach((group) => {
            if (group.length < 1) return;
            const isRestTables = group.every(r => !Boolean(r.reservation))

            if (group.length === 1 || isRestTables) {

                group.forEach((table) => {
                    tablesWithRelationMap[table?.table?.id!] = {
                        ...table,
                        layout: getLayoutOfTable(table.table!),
                        relations: [],
                        group,
                        isCurrentReservation: table.reservation?.id === reservation.id
                    }
                })

                // tablesWithRelationMap[group[0]?.table?.id!] = {
                //     ...group[0],
                //     layout: getLayoutOfTable(group[0].table!),
                //     relations: [],
                //     group
                // }
                return;
            }

            //two or more tables 
            // [t,t,linked] ,[t,t,t] ,[t,linked,linked]


            //reservation tables
            const unlinkedTables = group.filter(t => !(t?.reservation?.linkedReservationId))

            if (unlinkedTables.length > 1) {
                //multi tables
                const firstTable = unlinkedTables[0]!
                const firstTableWithRelation: StatusTableRowWithRelation = {
                    ...firstTable,
                    layout: getLayoutOfTable(firstTable.table!),
                    relations: unlinkedTables.slice(1).map((table) => ({
                        targetId: table?.table?.id.toString()!,
                        targetAnchor: 'middle',
                        sourceAnchor: 'middle',
                    })),
                    group,
                    isCurrentReservation: firstTable.reservation?.id === reservation.id
                }
                tablesWithRelationMap[firstTable?.table?.id!] = firstTableWithRelation

                unlinkedTables.slice(1).forEach((table) => {
                    tablesWithRelationMap[table?.table?.id!] = {
                        ...table,
                        layout: getLayoutOfTable(table.table!),
                        relations: [],
                        group,
                        isCurrentReservation: table.reservation?.id === reservation.id
                        // relations: [{
                        //     targetId: firstTable.table?.id?.toString()!,
                        //     targetAnchor: 'right',
                        //     sourceAnchor: 'left',
                        // }]
                    }
                })

            }

            const linkedTables = group.filter(t => (t?.reservation?.linkedReservationId))

            //main table of linked tables
            const unLinkedTables = group.filter(t => !(t?.reservation?.linkedReservationId))

            linkedTables.forEach((table) => {
                const linkedReservationRow = group.find(t => t.reservation?.id === table?.reservation?.linkedReservationId)

                const { sourceAnchor, targetAnchor } = determineAnchors(
                    table!.table!.x!,
                    table!.table!.y!,
                    linkedReservationRow!.table!.x!,
                    linkedReservationRow!.table!.y!
                )

                tablesWithRelationMap[table?.table?.id!] = {
                    ...table,
                    layout: getLayoutOfTable(table.table!),
                    relations: [{
                        targetId: linkedReservationRow?.table?.id.toString()!,
                        targetAnchor,
                        sourceAnchor,
                    }],
                    group,
                    isCurrentReservation: table.reservation?.id === reservation.id
                }
            })

            // unLinkedTables.forEach((table) => {
            //     if(tablesWithRelationMap[table?.table?.id!]) return;
            //     tablesWithRelationMap[table?.table?.id!] = {
            //         ...table,
            //         layout: getLayoutOfTable(table.table!),
            //         relations: [],
            //         group,
            //         isCurrentReservation: table.reservation?.id === reservation.id
            //     }
            // })



        })


        const gridData = Object.values(tablesWithRelationMap)

        // let lastColorIndex = 0
        // gridData.forEach((r, index) => {
        //     if (r.relations?.length) {
        //         r.relations?.forEach(r => {
        //             r.style = {
        //                 strokeColor: colors[lastColorIndex]
        //             }
        //         })
        //     }
        //     lastColorIndex++
        // })

        return [groups, gridData]
    }, [availableTableData, selectedRoom])

    console.log(groupData, 'groupData')
    console.log(gridData, 'gridData')


    useEffect(() => {
        if (roomsData) {
            setSelectedRoom(roomsData.find((room) => room.id === statusTableRow?.reservation?.roomId))
        }
    }, [roomsData, statusTableRow])

    useEffect(() => {
        if (availableTableData) {
            const r = availableTableData.tableStatues
                .find(r => r.roomId === reservation.roomId)?.statues
                .find(h => h.hour === reservation.hour)?.tables
                .find(t => t.reservation?.id === reservation.id)

            setStatusTableRow(r)
        }
    }, [availableTableData])

    const layout = useMemo(() => {
        return gridData.map((r, index) => r.layout)
    }, [gridData])

    useEffect(() => {

        const rows = groupData.find((group) => group.some((t) => t.reservation?.id === reservation.id))
        console.log(rows, 'rows')
        setThisTableRows(rows ?? [])
    }, [groupData])






    function onClickTable(row: StatusTableRowWithRelation) {
        const isCurrentReservationTable = row.reservation?.id === reservation.id
        const isSelected = selectedRows.some((r) => r.table?.id === row.table?.id)
        const isDeSelected = deSelectedRows.some((r) => r.table?.id === row.table?.id)



        if (isCurrentReservationTable) {
            if (isDeSelected) {
                // setdeSelectedRows(deSelectedRows.filter((r) => r.table?.id !== row.table?.id))
                setSelectionRowState({
                    ...selectionRowState,
                    deSelectedRows: deSelectedRows.filter((r) => r.table?.id !== row.table?.id)
                })
            }
            if (!isDeSelected) {
                // setdeSelectedRows([...deSelectedRows, row])
                setSelectionRowState({
                    ...selectionRowState,
                    deSelectedRows: [...deSelectedRows, row]
                })
            }
        }
        else {
            if (isSelected) {
                // setSelectedTableRows(selectedRows.filter((r) => r.table?.id !== row.table?.id))
                setSelectionRowState({
                    ...selectionRowState,
                    selectedRows: selectedRows.filter((r) => r.table?.id !== row.table?.id)
                })
            }
            if (!isSelected) {
                // setSelectedTableRows([...selectedRows, row])
                setSelectionRowState({
                    ...selectionRowState,
                    selectedRows: [...selectedRows, row]
                })
            }
        }




    }

    useEffect(() => {
        // OnChangeSelectedRows({
        //     deSelectedRows,
        //     selectedRows: selectedRows
        // })

        setSelectionRowState({
            deSelectedRows,
            selectedRows: selectedRows
        })

    }, [selectedRows, deSelectedRows])

    const [latoutKey, setLatoutKey] = useState(0)
    if (!selectedRoom) return null
    const { layoutRowHeight, layoutWidth } = selectedRoom!
    const cols = Math.round(layoutWidth / (layoutRowHeight + (layoutRowHeight * .2)));


    return (
        <div>
            <div className='flex items-center justify-between'>
                <Button
                    onClick={() => { setLatoutKey(latoutKey + 1) }}
                >Rest layout</Button>
            </div>
            <ArcherContainer
                className='w-max h-max'
                svgContainerStyle={{ opacity: 0.3 }}
                endShape={{ arrow: { arrowLength: 1, } }}
                strokeColor="red">
                <ReactGridLayout
                    key={latoutKey}
                    className="layout  border-black border-4"
                    layout={layout}
                    cols={cols}
                    rowHeight={layoutRowHeight}
                    style={{
                        width: layoutWidth,
                        minHeight: 600
                    }}

                    onLayoutChange={() => {
                        setTimeout(() => {
                            setCount(count + 1)
                        }, 300);
                    }}
                    width={layoutWidth}
                    verticalCompact={false}
                    compactType={null}
                    preventCollision={true}
                    isDraggable={true}

                >
                    {gridData.map(r => {
                        const { layout, relations, table } = r
                        const hasReservation = r.reservation
                        const isCurrentReservationTable = r.isCurrentReservation
                        const isDeSelected = deSelectedRows.some((r) => r.table?.id === table?.id)
                        const isSelected = selectedRows.some((r) => r.table?.id === table?.id)
                        return (
                            <div
                                key={layout.i}
                                id={layout.i}
                                className={cn('border   flex items-center justify-center', {
                                    'rounded-full': table?.shape === EnumTableShape.round,

                                })}
                            >

                                <ArcherElement
                                    key={layout.i}
                                    id={layout.i}
                                    relations={relations}
                                >
                                    <div key={table?.id} className={cn(' max-w-full w-[130px] min-h-[120px] max-h-full flex ', {
                                        'rounded-full': table?.shape === EnumTableShape.round,

                                    })}>
                                        <GridStatusTableRowCard
                                            isSelected={selectedRows.some((r) => r.table?.id === table?.id)}
                                            onClcikTable={onClickTable}
                                            statusTableRow={r}
                                            className={cn({
                                                'rounded-full': table?.shape == EnumTableShape.round,
                                                'bg-primary text-white': isCurrentReservationTable,
                                                'bg-secondary': (!isCurrentReservationTable && hasReservation),
                                                "bg-white border-2 border-black text-black": isDeSelected,
                                                "bg-black text-white": isSelected
                                            })}
                                            onCrud={() => {
                                                onSucessCrudTable()
                                            }}

                                        />
                                    </div>
                                </ArcherElement>
                            </div>

                        )

                    })}

                </ReactGridLayout>
            </ArcherContainer>
        </div>
    )
}


function getLayoutOfTable(table: TTable): Layout {
    return {
        h: table.h!,
        i: table.id.toString(),
        w: table.w!,
        shape: table.shape,
        x: table.x!,
        y: table.y!,
        tableId: table.id

    }
}


function determineAnchors(sourceX: number, sourceY: number, targetX: number, targetY: number) {
    let sourceAnchor: 'left' | 'right' | 'top' | 'bottom' | 'middle';
    let targetAnchor: 'left' | 'right' | 'top' | 'bottom' | 'middle';

    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Yatay yönde daha fazla mesafe var
        if (dx > 0) {
            sourceAnchor = 'right';
            targetAnchor = 'left';
        } else {
            sourceAnchor = 'left';
            targetAnchor = 'right';
        }
    } else {
        // Dikey yönde daha fazla mesafe var
        if (dy > 0) {
            sourceAnchor = 'bottom';
            targetAnchor = 'top';
        } else {
            sourceAnchor = 'top';
            targetAnchor = 'bottom';
        }
    }

    return { sourceAnchor, targetAnchor };
}