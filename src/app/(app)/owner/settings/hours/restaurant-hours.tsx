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
import { TMealHour } from '@/server/db/schema/restaurant-assets';
import { api } from '@/server/trpc/react';
import { MoreVertical, PauseCircle, Pencil, PlayCircle, Trash } from 'lucide-react';
import { useState } from 'react';
import { CreateHourModal } from './_components/create-hour-modal';
import { UpdateHourModal } from './_components/update-hour-modal';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";

type Props = {}

export const RestaurantMealHours = (props: Props) => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const [updateHourData, setUpdateHourData] = useState<TMealHour>()
    const [deleteHourData, setDeleteHourData] = useState<TMealHour>()


    const {
        data: restaurantMealHours
    } = api.restaurant.getRestaurantMealHours.useQuery()

    const { mutate: deleteMealHourMutation, isPending: deleteMealHourIsPending } = api.restaurant.deleteRestaurantMealHourById.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getRestaurantMealHours) })
            setIsDeleteModalOpen(false)
        }
    })

    const {
        mutate: updateMealHourMutation,
        isPending: updateMealHourIsPending
    } = api.restaurant.updateMealHour.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getRestaurantMealHours) })
            setIsDeleteModalOpen(false)
        }
    })

    const handleAddNewTime = () => {
        setIsCreateModalOpen(true)
    }

    const handleUpdateHour = (hourData: TMealHour) => {
        setUpdateHourData(hourData)
        setIsUpdateModalOpen(true)
    }

    const handleDeleteHour = (hourData: TMealHour) => {
        setDeleteHourData(hourData)
        setIsDeleteModalOpen(true)
    }

    const handleUpdateOpenStatus = (hourData: TMealHour) => {
        updateMealHourMutation({
            mealHourId: hourData.id,
            data: { isOpen: !hourData.isOpen }
        })
    }


    return (
        <div>

            {restaurantMealHours?.map((restaurantMealHour) => {
                const hours = restaurantMealHour.mealHours
                return <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex space-x-2">
                            <Button onClick={handleAddNewTime} >Yeni Saat Ekle</Button>
                        </div>
                        <CardTitle>{restaurantMealHour.meal.name} Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead>Saat</TableHead>
                                    {/* <TableHead>Başlık</TableHead> */}
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    hours?.map((hourItem) =>
                                        <TableRow >

                                            <TableCell>
                                                <Button
                                                    loading={updateMealHourIsPending}
                                                    tooltip="Update Open Status"
                                                    tooltipPosition="right"
                                                    onClick={() => { handleUpdateOpenStatus(hourItem) }}
                                                    variant={'ghost'}
                                                    size={'icon'}>
                                                    {hourItem.isOpen ?
                                                        <PlayCircle className="text-green-500" /> :
                                                        <PauseCircle className="text-red-500" />
                                                    }
                                                </Button>

                                            </TableCell>
                                            <TableCell>{restaurantMealHour.meal.name}</TableCell>
                                            <TableCell>{hourItem.hour}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            handleUpdateHour(hourItem)
                                                        }}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Düzenle</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            handleDeleteHour(hourItem)
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
            })}
            {isCreateModalOpen && <CreateHourModal
                open={isCreateModalOpen}
                setOpen={setIsCreateModalOpen}
            />}
            {isUpdateModalOpen && <UpdateHourModal
                hourData={updateHourData!}
                open={isUpdateModalOpen}
                setOpen={setIsUpdateModalOpen}
            />}

            {deleteHourData && <ConfirmationDialog
                open={isDeleteModalOpen}
                setOpen={setIsDeleteModalOpen}
                title="Delete Meal Hour"
                description="Are you sure you want to delete this meal hour?"
                type="delete"
                isLoading={deleteMealHourIsPending}

                onClickActionButton={() => {
                    deleteMealHourMutation({ mealHourId: deleteHourData.id })
                }}

            />}
        </div>

    )
}