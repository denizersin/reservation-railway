import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TReservationLimitation } from '@/server/db/schema/resrvation_limitation';
import { api } from '@/server/trpc/react';
import { MoreVertical, PauseCircle, Pencil, PlayCircle, Trash } from 'lucide-react';
import { useState } from 'react';
import LimitationCrudModal from './limitation-crud-modal';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";

type Props = {}

const LimitationsList = (props: Props) => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const [updateLimitationData, setUpdateLimitationData] = useState<TReservationLimitation>()
    const [deleteLimitationData, setDeleteLimitationData] = useState<TReservationLimitation>()

    const {
        data: reservationLimitations
    } = api.reservation.getReservationLimitations.useQuery()

    const { mutate: deleteLimitationMutation, isPending: deleteLimitationIsPending } = api.reservation.deleteReservationLimitation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationLimitations) })
            setIsDeleteModalOpen(false)
        }
    })

    const {
        mutate: updateLimitationMutation,
        isPending: updateLimitationIsPending
    } = api.reservation.updateReservationLimitation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getReservationLimitations) })
            setIsUpdateModalOpen(false)
        }
    })

    const handleAddNewLimitation = () => {
        setIsCreateModalOpen(true)
    }

    const handleUpdateLimitation = (limitationData: TReservationLimitation) => {
        setUpdateLimitationData(limitationData)
        setIsUpdateModalOpen(true)
    }

    const handleDeleteLimitation = (limitationData: TReservationLimitation) => {
        setDeleteLimitationData(limitationData)
        setIsDeleteModalOpen(true)
    }

    const handleUpdateOpenStatus = (limitationData: TReservationLimitation) => {
        updateLimitationMutation({
            limitationId: limitationData.id,
            data: { isActive: !limitationData.isActive, }
        })
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reservation Limitations</CardTitle>
                <Button onClick={handleAddNewLimitation}>Add New Limitation</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Meal</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Hour</TableHead>
                            <TableHead>Max Table Count</TableHead>
                            <TableHead>Max Guest Count</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservationLimitations?.map((limitation) => (
                            <TableRow key={limitation.id}>
                                <TableCell>
                                    <Button
                                        loading={updateLimitationIsPending}
                                        tooltip="Update Active Status"
                                        tooltipPosition="right"
                                        onClick={() => handleUpdateOpenStatus(limitation)}
                                        variant={'ghost'}
                                        size={'icon'}
                                    >
                                        {limitation.isActive ?
                                            <PlayCircle className="text-green-500" /> :
                                            <PauseCircle className="text-red-500" />
                                        }
                                    </Button>
                                </TableCell>
                                <TableCell>{limitation.day || "Her gun"}</TableCell>
                                <TableCell>{limitation.meal?.name}</TableCell>
                                <TableCell>{limitation.room?.translations[0]?.name}</TableCell>
                                <TableCell>{limitation.hour}</TableCell>
                                <TableCell>{limitation.maxTableCount}</TableCell>
                                <TableCell>{limitation.maxGuestCount}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUpdateLimitation(limitation)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteLimitation(limitation)}>
                                                <Trash className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {isCreateModalOpen && (
                <LimitationCrudModal
                    isOpen={isCreateModalOpen}
                    setOpen={setIsCreateModalOpen}
                />
            )}
            {isUpdateModalOpen && updateLimitationData && (
                <LimitationCrudModal
                    isOpen={isUpdateModalOpen}
                    setOpen={setIsUpdateModalOpen}
                    limitationData={updateLimitationData}
                />
            )}
            {deleteLimitationData && (
                <ConfirmationDialog
                    open={isDeleteModalOpen}
                    setOpen={setIsDeleteModalOpen}
                    title="Delete Reservation Limitation"
                    description="Are you sure you want to delete this reservation limitation?"
                    type="delete"
                    isLoading={deleteLimitationIsPending}
                    onClickActionButton={() => {
                        deleteLimitationMutation({ limitationId: deleteLimitationData.id })
                    }}
                />
            )}
        </Card>
    )
}

export default LimitationsList