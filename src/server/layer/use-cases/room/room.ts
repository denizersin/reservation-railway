import { db } from "@/server/db"
import { tblTable, TRoomWithTranslations, TTableInsert } from "@/server/db/schema/room"
import TRoomValidator from "@/shared/validators/room"
import { TRPCError } from "@trpc/server"
import { RoomEntities } from "../../entities/room"
import { TUseCaseLayer } from "@/server/types/types"




export const createTables = async ({
    roomId,
    data
}: TRoomValidator.createRoomTableSchema
) => {


    const newTables = new Array(data.tableCount).fill(0).map((_, index) => {
        const order = data.orderStartAt + index
        const startLetter = data.startLetter ? (data.startLetter + '-') : ''
        const endLetter = data.endLetter ? ('-' + data.endLetter) : '';
        const tableNumber = data.tableNumberStartAt + index
        const tableNo = `${startLetter + tableNumber + endLetter}`

        return {
            roomId,
            order,
            no: tableNo,
            capacity: data.capacity,
            minCapacity: data.minCapacity,
            maxCapacity: data.maxCapacity,
            shape: data.shape,
        } as TTableInsert

    })

    await RoomEntities.createTables({ tables: newTables })


    //create table

}



export const getRooms = async ({ ctx }: TUseCaseLayer<undefined>)
    : Promise<TRoomWithTranslations[]> => {
    return await RoomEntities.getRooms({
        restaurantId: ctx.session.user.restaurantId!,
        languageId: ctx.userPrefrences.language.id
    })
}