import { TStatusTableRow } from '@/lib/reservation'
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

type Props = {
    statusTableRow: TStatusTableRow,
    isSelected: boolean,
    onClcikTable: (row: TStatusTableRow) => void
    disabled?: boolean

    //dropdown
    removeTable?: (row: TStatusTableRow) => void
    unLinkReservation?: (row: TStatusTableRow) => void
}

export const StatusTableRowCard = ({
    statusTableRow,
    isSelected,
    onClcikTable,
    unLinkReservation,
    removeTable,
    disabled
}: Props) => {

    const table = statusTableRow.table!
    const { isReserved, isReachedLimit, isAppliedLimit } = table
    const isAvailable = !isReserved && !isReachedLimit


    const hasOptions = removeTable || unLinkReservation

    const optionDropdown = hasOptions && (
        <DropdownMenu modal={false}>
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
                    removeTable && <DropdownMenuItem
                        onClick={() => removeTable(statusTableRow)}
                    >
                        Remove Table
                    </DropdownMenuItem>
                }
                {
                    unLinkReservation && <DropdownMenuItem
                        onClick={() => unLinkReservation(statusTableRow)}
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
            key={statusTableRow.table?.id} className={cn(' size-[150px] relative', {
                'bg-foreground text-background': isReserved,
                'cursor-pointer hover:bg-muted': isAvailable,
                'bg-gray-300 cursor-pointer hover:bg-muted': (!isAvailable && !isReserved),
            })}>
            <CardContent className="p-4 flex flex-col gap-y-1">
                <div className="r r1 flex justify-between">
                    <div className="text-xl font-bold">{statusTableRow.table?.no}</div>
                    {optionDropdown}


                </div>
                <div className="text-sm flex">
                    <div>{isReserved ? statusTableRow.guest?.name : '-'}</div>
                </div>
                <div className="flex items-center text-xs mt-2">
                    <Clock className="w-3 h-3 mr-1" /> {statusTableRow.reservation?.hour}
                </div>
                <div className="flex items-center text-xs ">
                    {isReserved && <div className='flex'>
                        <Users className="w-3 h-3 mr-1" />
                        {statusTableRow.reservation?.guestCount}/{statusTableRow.table?.avaliableGuestWithLimit}

                    </div>}
                    <div className='flex ml-auto'>
                        {table.minCapacity} - {table.avaliableGuestWithLimit}
                        {isAppliedLimit && <TooltipText infoIcon tooltip='limit applied'>
                            <span className='line-through ml-1'>{table.maxCapacity}</span>
                        </TooltipText>}
                    </div>

                </div>
                {(!isReserved && isReachedLimit) && <div className="flex justify-end">
                    <Badge className='text-[9px] p-[.5px] px-1 bg-primary-foreground text-primary'>exceeding limit</Badge>
                </div>}
            </CardContent>

            {
                isSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
            }

        </Card>
    )
}