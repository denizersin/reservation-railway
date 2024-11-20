import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/custom/button";

import React, { useContext, useState } from 'react'
import { RoomDetailContext } from '../[id]/page'
import CreateTableModal from './create-table-modal'
import { api } from "@/server/trpc/react";
import { TTable } from "@/server/db/schema/room";
import UpdateTableModal from "./update-table-modal";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { MoreVertical, PauseCircle, Pencil, PlayCircle, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Props = {}

export const RoomTablesList = (props: Props) => {
    const queryClinet = useQueryClient()
    const { roomId,roomData } = useContext(RoomDetailContext)

    const { data: tables } = api.room.getTables.useQuery({ roomId })

    const onSuccessCrud = () => {
        queryClinet.invalidateQueries({
            queryKey: getQueryKey(api.room.getTables)
        })
        setcreateTableModalOpen(false)
        setUpdateTableModalOpen(false)
    }

    const { mutate: updateTable,isPending:updateTablePending } = api.room.updateTable.useMutation({
        onSuccess: onSuccessCrud
    })
    const { mutate: deleteTable } = api.room.deleteTable.useMutation({
        onSuccess: onSuccessCrud
    })

    const [createTableModalOpen, setcreateTableModalOpen] = useState(false)
    const [updateTableModalOpen, setUpdateTableModalOpen] = useState(false)

    const [modalUpdateTable, setModalUpdateTable] = useState<TTable>()



    const onCreateTable = () => {
        setcreateTableModalOpen(true)
    }

    const onUpdateTable = (table: TTable) => {
        setModalUpdateTable(table)
        setUpdateTableModalOpen(true)
    }

    const onUpdateTableActivity = (table: TTable) => {
        updateTable({ tableId: table.id, data: { isActive: !table.isActive } })
    }

    const onDeleteTable = (table: TTable) => {
        deleteTable({ tableId: table.id })
    }

    return (
        <div>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex space-x-2">
                        <Button onClick={onCreateTable} >Yeni Masa(lar) Ekle</Button>
                    </div>
                    {/* <CardTitle>{restaurantMealHour.meal.name} Hours</CardTitle> */}
                </CardHeader>
                <CardContent>
                    <Table className="">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Durum</TableHead>
                                <TableHead>Masa No </TableHead>
                                <TableHead>Kapasite</TableHead>
                                <TableHead>Min Kapasite</TableHead>
                                <TableHead>Max Kapasite</TableHead>
                                <TableHead>Sira</TableHead>

                                {/* <TableHead>Başlık</TableHead> */}
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                tables?.map((tableItem) =>
                                    <TableRow >

                                        <TableCell>
                                            <Button
                                                // loading={updateTablePending}
                                                disabled={updateTablePending}
                                                tooltip="Update Open Status"
                                                tooltipPosition="right"
                                                onClick={() => { onUpdateTableActivity(tableItem) }}
                                                variant={'ghost'}
                                                size={'icon'}>
                                                {tableItem.isActive ?
                                                    <PlayCircle className="text-green-500" /> :
                                                    <PauseCircle className="text-red-500" />
                                                }
                                            </Button>
                                        </TableCell>
                                        <TableCell>{tableItem.no}</TableCell>
                                        <TableCell>{tableItem.capacity}</TableCell>
                                        <TableCell>{tableItem.minCapacity}</TableCell>
                                        <TableCell>{tableItem.maxCapacity}</TableCell>
                                        <TableCell>{tableItem.order}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        onUpdateTable(tableItem)
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Düzenle</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        onDeleteTable(tableItem)
                                                    }}>
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Sil</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            }

                        </TableBody>
                    </Table>
                </CardContent>
            </Card>



            {createTableModalOpen && <CreateTableModal
                isOpen={createTableModalOpen}
                setOpen={setcreateTableModalOpen}
            />}
            {updateTableModalOpen && <UpdateTableModal
                isOpen={updateTableModalOpen}
                setOpen={setUpdateTableModalOpen}
                table={modalUpdateTable!}
            />}
        </div>
    )
}