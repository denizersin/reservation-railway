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
import { TPermanentLimitation, TReservationLimitation } from '@/server/db/schema/resrvation_limitation';
import { api } from '@/server/trpc/react';
import { MoreVertical, Trash } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@/components/custom/button";
import CreatePermanentLimitationModal from "./create-permanent-limitation-modal";

const PermanentLimitationsList = () => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLimitationData, setDeleteLimitationData] = useState<TPermanentLimitation>();

    const {
        data: permanentLimitations
    } = api.reservation.getPermanentLimitations.useQuery();

    const { mutate: deleteLimitationMutation, isPending: deleteLimitationIsPending } = api.reservation.deletePermanentLimitation.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.reservation.getPermanentLimitations) });
            setIsDeleteModalOpen(false);
        }
    });

    const handleAddNewLimitation = () => {
        setIsCreateModalOpen(true);
    };

    const handleDeleteLimitation = (limitationData: TPermanentLimitation) => {
        setDeleteLimitationData(limitationData);
        setIsDeleteModalOpen(true);
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Permanent Reservation Limitations</CardTitle>
                <Button onClick={handleAddNewLimitation}>Add New Permanent Limitation</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permanentLimitations?.map((limitation) => (
                            <TableRow key={limitation.id}>
                                <TableCell>{limitation.room?.translations[0]?.name}</TableCell>
                                <TableCell>{new Date(limitation.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(limitation.endDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
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
                <CreatePermanentLimitationModal
                    isOpen={isCreateModalOpen}
                    setOpen={setIsCreateModalOpen}
                />
            )}
            {deleteLimitationData && (
                <ConfirmationDialog
                    open={isDeleteModalOpen}
                    setOpen={setIsDeleteModalOpen}
                    title="Delete Permanent Reservation Limitation"
                    description="Are you sure you want to delete this permanent reservation limitation?"
                    type="delete"
                    isLoading={deleteLimitationIsPending}
                    onClickActionButton={() => {
                        deleteLimitationMutation({ limitationId: deleteLimitationData.id });
                    }}
                />
            )}
        </Card>
    );
};

export default PermanentLimitationsList;

