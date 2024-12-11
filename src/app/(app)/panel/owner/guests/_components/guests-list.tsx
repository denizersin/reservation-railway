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

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"


import { TGuest } from '@/server/db/schema/guest';
import { api } from '@/server/trpc/react';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import GuestCrudModal from './guest-crud-modal';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";
import TGuestValidator from "@/shared/validators/guest";
import { GuestsFilterModal } from './guests-filter-modal';
import { CustomPagination } from "@/components/custom-pagination";
import { DEFAULT_ROWS_PER_PAGE } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
type Props = {}

const GuestsList = (props: Props) => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const [updateGuestData, setUpdateGuestData] = useState<TGuest>()
    const [deleteGuestData, setDeleteGuestData] = useState<TGuest>()


    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

    const [queryInput, setQueryInput] = useState<TGuestValidator.GuestsPaginationSchema>({
        pagination: {
            page: 1,
            limit: DEFAULT_ROWS_PER_PAGE,
        },
        filters: {},
        global_search: ''
    })

    const {
        data: guestsPaginationData,
        isLoading,
        isError,
    } = api.guest.getGuestsPagination.useQuery(queryInput)




    const { mutate: deleteGuestMutation, isPending: deleteGuestIsPending } = api.guest.deleteGuest.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.guest.getGuestsPagination) })
            setIsDeleteModalOpen(false)
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

    const handleFilterModal = () => {
        setIsFilterModalOpen(true)
    }

    function removeFilters() {
        setQueryInput({
            pagination: {
                page: 1,
                limit: DEFAULT_ROWS_PER_PAGE
            },
            filters: {}
        })
    }

    const router = useRouter();

    const [searchText, setSearchText] = useState('')

    const debounced = useDebouncedCallback((searchVal) => {
        setQueryInput((prev) => ({ ...prev, global_search: searchVal, pagination: { ...prev.pagination, page: 1 } }))
    }, 500)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
        debounced(e.target.value)
    }


    return (
        <Card className="w-full my-5">
            <CardHeader className="flex flex-row items-center  gap-2 ">
                <CardTitle className="">Guests</CardTitle>
                <Button variant="outline" onClick={() => router.push('/panel/owner/guests/companies')}>Guest Companies</Button>
                <div className="mb-2 flex flex-col items-start justify-start gap-2 ml-auto">
                    <Button className="ml-auto" onClick={handleAddNewGuest}>Add New Guest</Button>
                    <div className="flex gap-2">

                        <Button onClick={handleFilterModal}>Advanced Filter</Button>
                        <Input className="w-[300px]" placeholder="Search name phone or email"
                            value={searchText}
                            onChange={handleSearch}
                        />
                        <Button variant="outline" onClick={removeFilters}>Remove Filters</Button>
                    </div>

                </div>

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
                        {guestsPaginationData?.data?.map((guest) => (
                            <TableRow key={guest.id}>
                                <TableCell>{guest.name}</TableCell>
                                <TableCell>{guest.surname}</TableCell>
                                <TableCell>{guest.email}</TableCell>
                                <TableCell>{guest.phone}</TableCell>
                                <TableCell>{guest.company?.companyName}</TableCell>
                                <TableCell>{guest.isVip ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{guest.birthDate ? new Date(guest.birthDate).toLocaleDateString() : ''}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu
                                        modal={false}
                                    >
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
                {guestsPaginationData?.pagination
                    && <CustomPagination
                        paginationData={guestsPaginationData.pagination}
                        pagination={queryInput.pagination}
                        setPagination={(pagination) => setQueryInput(prev => ({ ...prev, pagination }))}
                    />}
            </CardContent>
            {isCreateModalOpen && (
                <GuestCrudModal
                    open={isCreateModalOpen}
                    setOpen={setIsCreateModalOpen}
                    onSucsesCreateGuest={() => {
                        setIsCreateModalOpen(false)
                    }}
                />
            )}
            {isUpdateModalOpen && updateGuestData && (
                <GuestCrudModal
                    open={isUpdateModalOpen}
                    setOpen={setIsUpdateModalOpen}
                    guestData={updateGuestData}
                    onSucsesUpdateGuest={() => {
                        setIsUpdateModalOpen(false)
                    }}
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

            {isFilterModalOpen && <GuestsFilterModal
                open={isFilterModalOpen}
                setOpen={setIsFilterModalOpen}
                queryInput={queryInput}
                setQueryInput={setQueryInput}
            />}
        </Card>
    )
}

export default GuestsList
