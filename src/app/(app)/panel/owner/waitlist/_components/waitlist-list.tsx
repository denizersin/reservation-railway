'use client'

import { Button } from "@/components/custom/button";
import { ConfirmModalGlobal } from "@/components/modal/confirm-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api, RouterOutputs } from "@/server/trpc/react";
import { EnumWaitlistStatus } from "@/shared/enums/predefined-enums";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarRange, Loader2, MoreVertical, Trash, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReservationDateCalendar } from "../../reservation/_components/reservation-date-calendar";
import { CreateWaitlistReservModal } from "./create-waitlist-reserv-modal";
import { getQueryKey } from "@trpc/react-query";
import { useToast } from "@/hooks/use-toast";

export type WaitlistRecord = RouterOutputs['waitlist']['getWaitlists'][number]
export type WaitlistAvailabilityRecord = RouterOutputs['waitlist']['queryWaitlistAvailability']

export const WaitlistList = () => {
    const queryClient = useQueryClient()
    const [date, setDate] = useState<Date>(new Date())
    const [openCreateReservationModal, setOpenCreateReservationModal] = useState(false)
    const [selectedWaitlist, setSelectedWaitlist] = useState<{
        waitlist: WaitlistRecord,
        queryResult: RouterOutputs['waitlist']['queryWaitlistAvailability'] | undefined
    } | null>(null)

    const queryAvalibilityMapRef = useRef<Record<number, WaitlistAvailabilityRecord>>({})

    const queryDate = useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate
    }, [date])

    const { data: waitlists } = api.waitlist.getWaitlists.useQuery({
        date: queryDate
    },{
        staleTime:0
    })

    // const { mutate: deleteWaitlist } = api.waitlist.deleteWaitlist.useMutation({
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({
    //             queryKey: getQueryKey(api.waitlist.getWaitlists)
    //         })
    //     }
    // })


    const { mutateAsync: deleteWaitlist } = api.waitlist.deleteWaitlist.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.waitlist.getWaitlists)
            })
        },

    })


    const onDeleteWaitlist = (waitlist: WaitlistRecord) => {
        ConfirmModalGlobal.show({
            title: "Delete Waitlist Entry?",
            type: "delete",
            onConfirm: async () => {
                await deleteWaitlist({ waitlistId: waitlist.id })
            }
        })
    }

    const { toast } = useToast()

    const onCreateReservation = (waitlist: WaitlistRecord) => {
        const queryWaitlistAvailabilityData = queryAvalibilityMapRef.current[waitlist.id]
        if (!queryWaitlistAvailabilityData?.isAvaliable) {
            toast({
                title: "Not Available",
                description: "The selected waitlist is not available for reservation",
                variant: "destructive"
            })

        }

        setSelectedWaitlist({
            waitlist,
            queryResult: queryWaitlistAvailabilityData
        })

        setOpenCreateReservationModal(true)


    }

    const onChangeModalOpen = (open: boolean) => {
        if (!open) {
            setOpenCreateReservationModal(false)
            setSelectedWaitlist(null)
        }
    }


    return (
        <div>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex space-x-2">
                        <ReservationDateCalendar
                            date={date}
                            setDate={setDate}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Waitlist Date</TableHead>
                                <TableHead>Guest Count</TableHead>
                                <TableHead>Guest Note</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Availability</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {waitlists?.map((waitlist) => (
                                <TableRow key={waitlist.id}>
                                    <TableCell>{waitlist.status}</TableCell>
                                    <TableCell>{waitlist.guest.name + ' ' + waitlist.guest.surname}</TableCell>
                                    <TableCell>{format(waitlist.waitlistDate, 'dd MMM yyyy')}</TableCell>
                                    <TableCell>{waitlist.guestCount}</TableCell>
                                    <TableCell>{waitlist.guestNote}</TableCell>
                                    <TableCell>{format(waitlist.updatedAt, 'dd MMM yyyy')}</TableCell>
                                    <TableCell>
                                        <WaitlistAvailability
                                            waitlist={waitlist}
                                            queryAvalibilityMapRef={queryAvalibilityMapRef}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {waitlist.status === EnumWaitlistStatus.created && (
                                                    <DropdownMenuItem onClick={() => onCreateReservation(waitlist)}>
                                                        <CalendarRange className="mr-2 h-4 w-4" />
                                                        <span>Create Reservation</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => onDeleteWaitlist(waitlist)}>
                                                    <Trash className="mr-2 h-4 w-4 text-destructive" />
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
            </Card>

            {openCreateReservationModal && selectedWaitlist && (
                <CreateWaitlistReservModal
                    open={openCreateReservationModal}
                    setOpen={onChangeModalOpen}
                    waitlistData={selectedWaitlist.waitlist}
                    initialHour={selectedWaitlist.queryResult?.hour}
                    initialRoomId={selectedWaitlist.queryResult?.roomId}
                    initialTableId={selectedWaitlist.queryResult?.tableId}
                />
            )}
        </div>
    )
}


function WaitlistAvailability({ waitlist, queryAvalibilityMapRef }: {
    waitlist: WaitlistRecord,
    queryAvalibilityMapRef: React.MutableRefObject<Record<number, WaitlistAvailabilityRecord>>
}) {

    const [waitlistAvailability, setWaitlistAvailability] = useState<WaitlistAvailabilityRecord | null>(null)

    const { data: queryWaitlistAvailabilityData, mutate: queryWaitlistAvailability, isPending: isQueryWaitlistAvailabilityPending } = api.waitlist.queryWaitlistAvailability.useMutation({
        onSuccess: (data) => {
            setWaitlistAvailability(data)
            queryAvalibilityMapRef.current[waitlist.id] = data
        },
    })

    function onQueryWaitlistAvailability() {
        queryWaitlistAvailability({
            waitlistId: waitlist.id
        })
    }

    useEffect(() => {
        if (!waitlistAvailability) {
            onQueryWaitlistAvailability()
        }
    }, [waitlist])


    return <div className="flex items-center space-x-2">
        {
            waitlistAvailability?.isAvaliable ? (
                <div>Available</div>
            ) : (
                <div>Not Available</div>
            )
        }
        {
            isQueryWaitlistAvailabilityPending && <Loader2 className="h-4 w-4 animate-spin" />
        }
        <Button
            variant="outline"
            onClick={onQueryWaitlistAvailability}
        >Query Availability</Button>
    </div>
}