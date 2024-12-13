import { RouterOutputs } from "@/server/trpc/react"



export type TReservationRow = RouterOutputs['reservation']['getReservations'][0]

export type TReservationDetail = RouterOutputs['reservation']['getReservationDetail']



export type TTableStatuesRow = RouterOutputs['reservation']['getTableStatues'][0]['tables'][0]

export const groupTableStatues = (tables: TTableStatuesRow[]): TTableStatuesRow[][] => {
    // const reservatedTables = tables.filter((table) => table.reservation)

    const groupedTables = groupBy(tables, (table) => table.reservation?.id!)

    const removeIndex: number[] = []

    Object.values(groupedTables).forEach((g,i) => {
        g.forEach(t => {
            if (t.reservation?.linkedReservationId &&
                !g.find(row => row?.reservation?.id === t?.reservation?.linkedReservationId)
            ) {
                const table = groupedTables[t.reservation.linkedReservationId]!
                table?.push(...g)
                removeIndex.push(i)
            }
        })
    })

    
    
    const grouped = Object.values(groupedTables).filter((_,i) => !removeIndex.includes(i))

    console.log(grouped, 'grouped')

    return grouped
}



function groupBy<T, K extends keyof any>(arr: T[], getKey: (item: T) => K): Record<K, T[]> {
    return arr.reduce((acc, item) => {
        const key = getKey(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<K, T[]>);
}



export type TReservationWaitingTableRow = RouterOutputs['reservation']['getReservationWaitingTables'][0]
