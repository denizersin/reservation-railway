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
import { api } from '@/server/trpc/react';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import PersonelCrudModal from './personel-crud-modal';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";
import { TPersonel } from "@/server/db/schema/guest";

type Props = {}

const PersonelsList = (props: Props) => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const [updatePersonelData, setUpdatePersonelData] = useState<TPersonel>()
    const [deletePersonelData, setDeletePersonelData] = useState<TPersonel>()

    const {
        data: personels
    } = api.restaurant.getPersonels.useQuery()

    const { mutate: deletePersonelMutation, isPending: deletePersonelIsPending } = api.restaurant.deletePersonel.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getPersonels) })
            setIsDeleteModalOpen(false)
        }
    })

    const handleAddNewPersonel = () => {
        setIsCreateModalOpen(true)
    }

    const handleUpdatePersonel = (personelData: TPersonel) => {
        setUpdatePersonelData(personelData)
        setIsUpdateModalOpen(true)
    }

    const handleDeletePersonel = (personelData: TPersonel) => {
        setDeletePersonelData(personelData)
        setIsDeleteModalOpen(true)
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personels</CardTitle>
                <Button onClick={handleAddNewPersonel}>Add New Personel</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Birth Date</TableHead>
                            <TableHead>Special ID</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personels?.map((personel) => (
                            <TableRow key={personel.id}>
                                <TableCell>{personel.fullName}</TableCell>
                                <TableCell>{personel.email}</TableCell>
                                <TableCell>{personel.phone}</TableCell>
                                <TableCell>{personel.birthDate ? new Date(personel.birthDate).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>{personel.specialId}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleUpdatePersonel(personel)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeletePersonel(personel)}>
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
                <PersonelCrudModal
                    open={isCreateModalOpen}
                    setOpen={setIsCreateModalOpen}
                />
            )}
            {isUpdateModalOpen && updatePersonelData && (
                <PersonelCrudModal
                    open={isUpdateModalOpen}
                    setOpen={setIsUpdateModalOpen}
                    personelData={updatePersonelData}
                />
            )}
            {deletePersonelData && (
                <ConfirmationDialog
                    open={isDeleteModalOpen}
                    setOpen={setIsDeleteModalOpen}
                    title="Delete Personel"
                    description="Are you sure you want to delete this personel?"
                    type="delete"
                    isLoading={deletePersonelIsPending}
                    onClickActionButton={() => {
                        deletePersonelMutation({ id: deletePersonelData.id })
                    }}
                />
            )}
        </Card>
    )
}

export default PersonelsList

