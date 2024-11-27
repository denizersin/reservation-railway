import { TTableStatuesRow } from '@/lib/reservation'
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { CircleCheck, Clock, EllipsisVertical, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    statusTableRow: TTableStatuesRow
}

export const TableViewRowCard = ({
    statusTableRow
}: Props) => {

    const isReserved = Boolean(statusTableRow.reservation)

    return (
        <Card
            key={statusTableRow.table?.id} className={cn(' w-full relative', {
                'bg-foreground text-background': isReserved,
            })}>
            <CardContent className="p-4 flex flex-col gap-y-1">
                <div className="r r1 flex justify-between">
                    <div className="text-xl font-bold">{statusTableRow.table?.no}</div>


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
                        {statusTableRow.reservation?.guestCount}

                    </div>}
                    <div className='flex ml-auto'>
                        {statusTableRow?.table?.minCapacity} - {statusTableRow?.table?.maxCapacity}
                    </div>

                </div>
            </CardContent>



        </Card>
    )
}