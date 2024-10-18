import { TRoomWithTranslations, TTableInsert } from "@/server/db/schema/room"
import { TUseCaseOwnerLayer } from "@/server/types/types"
import TRoomValidator from "@/shared/validators/room"
import { RoomEntities } from "../../entities/room"




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



export const getRooms = async ({ ctx,input }: TUseCaseOwnerLayer<{
    withWaitingRooms?: boolean
}>)
    : Promise<TRoomWithTranslations[]> => {
    return await RoomEntities.getRooms({
        restaurantId: ctx.session.user.restaurantId,
        languageId: ctx.userPrefrences.language.id,
        withWaitingRooms: input.withWaitingRooms
    })
}

export const createRoomWithTranslations = async ({ ctx, input }: TUseCaseOwnerLayer<TRoomValidator.createRoomSchema>) => {

    return await RoomEntities.createRoomWithTranslations({
        restaurantId: ctx.session.user.restaurantId,
        ...input
    })



}