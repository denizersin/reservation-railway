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

import { TGuestCompany } from '@/server/db/schema/guest';
import { api } from '@/server/trpc/react';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";
import { Input } from "@/components/ui/input";
import { CustomPagination } from "@/components/custom-pagination";
import { DEFAULT_ROWS_PER_PAGE } from "@/lib/constants";
import GuestCompanyCrudModal from "./guest-company-crud-modal";
import TGuestValidator from "@/shared/validators/guest";

export const GuestCompaniesList = () => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [updateCompanyData, setUpdateCompanyData] = useState<TGuestCompany>();
    const [deleteCompanyData, setDeleteCompanyData] = useState<TGuestCompany>();

    const [queryInput, setQueryInput] = useState<TGuestValidator.GuestCompanyPaginationSchema>({
        pagination: {
            page: 1,
        limit: DEFAULT_ROWS_PER_PAGE,
        },
        global_search: '',
    });

    const {
        data: companiesPaginationData,
        isLoading,
    } = api.guest.getGuestCompaniesPagination.useQuery(queryInput);

    const { mutate: deleteCompanyMutation, isPending: deleteCompanyIsPending } = 
    api.guest.deleteGuestCompany.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: getQueryKey(api.guest.getGuestCompaniesPagination) 
            });
            setIsDeleteModalOpen(false);
        }
    });

    const handleAddNewCompany = () => {
        setIsCreateModalOpen(true);
    };

    const handleUpdateCompany = (companyData: TGuestCompany) => {
        setUpdateCompanyData(companyData);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteCompany = (companyData: TGuestCompany) => {
        setDeleteCompanyData(companyData);
        setIsDeleteModalOpen(true);
    };

    function removeFilters() {
        setQueryInput({
            pagination: {
                page: 1,
                limit: DEFAULT_ROWS_PER_PAGE,
            },
            global_search: '',
        });
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Guest Companies</CardTitle>
                <div className="mb-2 flex flex-col items-start justify-start gap-2">
                    <Button className="ml-auto" onClick={handleAddNewCompany}>
                        Add New Company
                    </Button>
                    <div className="flex gap-2">
                        <Input 
                            className="w-[300px]" 
                            placeholder="Search company name"
                            value={queryInput.global_search}
                            onChange={(e) => {
                                setQueryInput((prev) => ({ 
                                    ...prev, 
                                    global_search: e.target.value,
                                    pagination: {
                                        page: 1,
                                        limit: DEFAULT_ROWS_PER_PAGE,
                                    }
                                }));
                            }} 
                        />
                        <Button variant="outline" onClick={removeFilters}>
                            Remove Filters
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Company Name</TableHead>
                            <TableHead>Company Email</TableHead>
                            <TableHead>Company Phone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companiesPaginationData?.data?.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>{company.companyName}</TableCell>
                                <TableCell>{company.email}</TableCell>
                                <TableCell>{company.phone}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem 
                                                onClick={() => handleUpdateCompany(company)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteCompany(company)}
                                            >
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
                {companiesPaginationData?.pagination && (
                    <CustomPagination
                        paginationData={companiesPaginationData.pagination}
                        pagination={queryInput.pagination       }
                        setPagination={(pagination) => setQueryInput({
                            ...queryInput,
                            pagination
                        })}
                    />
                )}
            </CardContent>

            {isCreateModalOpen && (
                <GuestCompanyCrudModal
                    isOpen={isCreateModalOpen}
                    setIsOpen={setIsCreateModalOpen}
                />
            )}
            {isUpdateModalOpen && updateCompanyData && (
                <GuestCompanyCrudModal
                    isOpen={isUpdateModalOpen}
                    setIsOpen={setIsUpdateModalOpen}
                    guestCompany={updateCompanyData}
                />
            )}
            {deleteCompanyData && (
                <ConfirmationDialog
                    open={isDeleteModalOpen}
                    setOpen={setIsDeleteModalOpen}
                    title="Delete Company"
                    description="Are you sure you want to delete this company?"
                    type="delete"
                    isLoading={deleteCompanyIsPending}
                    onClickActionButton={() => {
                        deleteCompanyMutation({ guestCompanyId: deleteCompanyData.id });
                    }}
                />
            )}
        </Card>
    );
};