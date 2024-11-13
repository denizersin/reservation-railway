import { RouterOutputs } from "@/server/trpc/react"

export type TStatusTableRows = RouterOutputs['reservation']['getAllAvailableReservation2']['tableStatues'][0]['statues'][0]['tables']
export type TStatusTableRow = TStatusTableRows[0]

export type TReservationRow = RouterOutputs['reservation']['getReservations'][0]

export type TReservationDetail = RouterOutputs['reservation']['getReservationDetail']

export type GroupedTables = TStatusTableRows[]

export const groupTableStatues = (tables: TStatusTableRows): TStatusTableRow[][] => {
    // const reservatedTables = tables.filter((table) => table.reservation)
    const reservatedTables = tables
    const groupedTables = groupBy(reservatedTables, (table) => table.reservation?.id!)
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


// export type TStatusTableRows = RouterOutputs['reservation']['getAllAvailableReservation2']['tableStatues'][0]['statues'][0]['tables']

export type TReservationWaitingTableRow = RouterOutputs['reservation']['getReservationWaitingTables'][0]
