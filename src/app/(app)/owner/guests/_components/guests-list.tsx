"use client";
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
import { TGuest } from '@/server/db/schema/guest';
import { api } from '@/server/trpc/react';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import GuestCrudModal from './guest-crud-modal';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";

type Props = {}

const GuestsList = (props: Props) => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const [updateGuestData, setUpdateGuestData] = useState<TGuest>()
    const [deleteGuestData, setDeleteGuestData] = useState<TGuest>()

    const {
        data: guests
    } = api.guest.getAllGuests.useQuery({
        page: 1,
        limit: 20
    })

    const { mutate: deleteGuestMutation, isPending: deleteGuestIsPending } = api.guest.deleteGuest.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.guest.getAllGuests) })
            setIsDeleteModalOpen(false)
        }
    })

    const {
        mutate: updateGuestMutation,
        isPending: updateGuestIsPending
    } = api.guest.updateGuest.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.guest.getAllGuests) })
            setIsUpdateModalOpen(false)
        }
    })

    const handleAddNewGuest = () => {
        setIsCreateModalOpen(true)
    }

    const handleUpdateGuest = (guestData: TGuest) => {
        setUpdateGuestData(guestData)
        setIsUpdateModalOpen(true)
    }

    const handleDeleteGuest = (guestData: TGuest) => {
        setDeleteGuestData(guestData)
        setIsDeleteModalOpen(true)
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Guests</CardTitle>
                <Button onClick={handleAddNewGuest}>Add New Guest</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Surname</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Is VIP</TableHead>
                            <TableHead>Birth Day</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guests?.data?.map((guest) => (
                            <TableRow key={guest.id}>
                                <TableCell>{guest.name}</TableCell>
                                <TableCell>{guest.surname}</TableCell>
                                <TableCell>{guest.email}</TableCell>
                                <TableCell>{guest.phone}</TableCell>
                                <TableCell>{guest.company?.companyName}</TableCell>
                                <TableCell>{guest.isVip ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{new Date(guest.birthDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUpdateGuest(guest)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteGuest(guest)}>
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
                <GuestCrudModal
                    open={isCreateModalOpen}
                    setOpen={setIsCreateModalOpen}
                />
            )}
            {isUpdateModalOpen && updateGuestData && (
                <GuestCrudModal
                    open={isUpdateModalOpen}
                    setOpen={setIsUpdateModalOpen}
                    guestData={updateGuestData}
                />
            )}
            {deleteGuestData && (
                <ConfirmationDialog
                    open={isDeleteModalOpen}
                    setOpen={setIsDeleteModalOpen}
                    title="Delete Guest"
                    description="Are you sure you want to delete this guest?"
                    type="delete"
                    isLoading={deleteGuestIsPending}
                    onClickActionButton={() => {
                        deleteGuestMutation({ guestId: deleteGuestData.id })
                    }}
                />
            )}
        </Card>
    )
}

export default GuestsList
