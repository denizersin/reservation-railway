import { TableStatuesRowCard } from '@/app/(app)/panel/owner/reservation/_components/v2/table-statues-row-card'
import { TTableStatuesRow } from '@/lib/reservation'

type Props = {
    selectedTableId: number | undefined
    setSelectedTableId: (id: number | undefined) => void,
    currentTables: TTableStatuesRow[]
}

export const TableSelect = ({
    selectedTableId,
    setSelectedTableId,
    currentTables
}: Props) => {





    const onClcikTable = (row: TTableStatuesRow) => {
        setSelectedTableId(row.table?.id)
    }


    return (
        <div>

            <div className='flex flex-wrap gap-x-2 gap-y-2'>
                {
                    currentTables?.map((data) =>
                        <TableStatuesRowCard
                            statusTableRow={data}
                            isSelected={selectedTableId === data.table?.id}
                            onClcikTable={onClcikTable}
                            disabled={Boolean(data?.reservation)}
                        />
                    )
                }
            </div>

        </div >
    )
}