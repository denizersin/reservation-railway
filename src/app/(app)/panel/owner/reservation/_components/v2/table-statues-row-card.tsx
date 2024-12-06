import { Card, CardContent } from "@/components/ui/card"
import { TTableStatuesRow } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import { EnumReservationStatusNumeric } from '@/shared/enums/predefined-enums'
import { CircleCheck, Clock, Users } from 'lucide-react'

type Props = {
    statusTableRow: TTableStatuesRow,
    isSelected: boolean,
    onClcikTable: (row: TTableStatuesRow) => void
    disabled?: boolean

}

export const TableStatuesRowCard = ({
    statusTableRow,
    isSelected,
    onClcikTable,
    disabled
}: Props) => {

    const table = statusTableRow.table!
    const isReserved = Boolean(statusTableRow.reservation)
    const isAvailable = !isReserved



    const isHolding = statusTableRow.reservation?.reservationStatusId === EnumReservationStatusNumeric.holding


    return (
        <Card
            onClick={(() => !disabled && onClcikTable(statusTableRow))}
            key={statusTableRow.table?.id} className={cn(' size-[80px] relative', {
                'bg-foreground text-background': isReserved,
                'cursor-pointer hover:bg-muted': isAvailable,
                'bg-gray-300 cursor-pointer hover:bg-muted': (!isAvailable && !isReserved),
                "bg-orange-300": isHolding
            })}>
            <CardContent className="p-2 flex flex-col  ">
                <div className="r r1 flex justify-between">
                    <div className="text-base font-bold">{statusTableRow.table?.no}</div>
                </div>
                <div className="text-sm flex">
                    {/* <div>{(isReserved && !isHolding) ? statusTableRow.guest?.name : '-'}</div> */}
                </div>
                <div className="flex items-center text-xs ">
                    <Clock className="w-3 h-3 mr-1" /> {statusTableRow.reservation?.hour}
                </div>
                <div className="flex items-center text-xs ">
                    {isReserved && <div className='flex'>
                        <Users className="w-3 h-3 mr-1" />
                        {statusTableRow.reservation?.guestCount}
                    </div>}


                </div>

            </CardContent>

            {
                isSelected && <CircleCheck className='absolute top-0 right-0 h-6 w-6 text-background fill-foreground' />
            }

        </Card>
    )
}