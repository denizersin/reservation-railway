import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { CircleCheck, Clock, EllipsisVertical, Users } from 'lucide-react'
import { TooltipText } from '@/components/custom/tooltip-text'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { api } from '@/server/trpc/react'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { StatusTableRowWithRelation } from './reservation-grid-status'

type Props = {
    statusTableRow: StatusTableRowWithRelation,
    isSelected: boolean,
    onClcikTable: (row: StatusTableRowWithRelation) => void
    disabled?: boolean
    className?: string,
    onCrud?: (row: StatusTableRowWithRelation) => void
}

export const GridStatusTableRowCard = ({
    statusTableRow,
    isSelected,
    onClcikTable,
    disabled,
    className,
    onCrud
}: Props) => {
    const queryClient = useQueryClient();
    const table = statusTableRow.table!
    const { isReserved, isReachedLimit, isAppliedLimit } = table
    const isAvailable = !isReserved && !isReachedLimit


    const isCanUnLinkReservation = statusTableRow.reservation?.linkedReservationId
    const isCanRemoveTable = Boolean(statusTableRow.reservation) && statusTableRow.group.length > 1 && !isCanUnLinkReservation
    const hasOptions = isCanRemoveTable || isCanUnLinkReservation

    const baseMutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.reservation.getAllAvailableReservation2)
            })
            onCrud?.(statusTableRow)
        }
    }

    const {
        mutate: removeTableFromReservation,
        isPending
    } = api.reservation.removeTableFromReservation.useMutation(baseMutationOptions)

    const {
        mutate: unlinkReservation,
        isPending: isPendingUnlinkReservation
    } = api.reservation.unlinkReservation.useMutation(baseMutationOptions)

    useShowLoadingModal([isPending, isPendingUnlinkReservation])

    function onRemoveTable() {
        removeTableFromReservation({
            reservationId: statusTableRow.reservation?.id!,
            reservationTableId: statusTableRow.reservation_tables?.id!
        })
    }
    function onUnLinkReservation() {
        unlinkReservation({ reservationId: statusTableRow.reservation?.id! })
    }


    const optionDropdown = hasOptions && (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className={cn('rounded-full px-1 py-1 size-6 ', {
                        'bg-primary': isReserved
                    })}
                    variant="outline">
                    <EllipsisVertical className={cn('size-4', {
                        'text-white': isSelected
                    })} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {
                    isCanRemoveTable && <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemoveTable()
                        }
                        }
                    >
                        Remove Table
                    </DropdownMenuItem>
                }
                {
                    isCanUnLinkReservation && <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation()
                            onUnLinkReservation()
                        }}
                    >
                        UnLink Reservation
                    </DropdownMenuItem>
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )




    return (
        <Card
            onClick={(() => !disabled && onClcikTable(statusTableRow))}
            key={statusTableRow.table?.id} className={cn(' w-full relative', {
                // 'bg-foreground text-background': isReserved,
                // 'cursor-pointer hover:bg-muted': isAvailable,
                // 'bg-gray-300 cursor-pointer hover:bg-muted': (!isAvailable && !isReserved),
            }, className)}>
            <CardContent className="p-4 flex flex-col gap-y-1 text-xs">
                <div className="r r1 flex justify-between">
                    <div className="text-sm font-bold flex-1 text-center">{statusTableRow.table?.no}</div>
                    {optionDropdown}
                </div>
                <div className=" flex">
                    <div>{isReserved ? statusTableRow.guest?.name : '-'}</div>
                </div>
                <div className="flex items-center text-xs mt-1">
                    <Clock className="w-3 h-3 mr-1" /> {statusTableRow.reservation?.hour}
                </div>
                <div className="flex items-center text-xs ">
                    {isReserved && <div className='flex'>
                        <Users className="w-3 h-3 mr-1" />
                        {statusTableRow.reservation?.guestCount}/{statusTableRow.table?.avaliableGuestWithLimit}

                    </div>}
                </div>

            </CardContent>

            {
                isSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
            }

        </Card>
    )
}