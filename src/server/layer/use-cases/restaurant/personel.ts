import { TUseCaseOwnerLayer } from "@/server/types/types"
import { restaurantEntities } from "../../entities/restaurant"
import TPersonelValidator from "@/shared/validators/user/personel"

export const createPersonel = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TPersonelValidator.CreatePersonelSchema>) => {
    await restaurantEntities.createPersonel({
        personelData: {
            ...input,
            restaurantId: ctx.session.user.restaurantId
        }
    })
}

export const deletePersonel = async ({
    input
}: TUseCaseOwnerLayer<TPersonelValidator.DeletePersonelSchema>) => {
    await restaurantEntities.deletePersonelById({
        personelId: input.id
    })
}

export const getPersonel = async ({ ctx }: TUseCaseOwnerLayer<undefined>) => {
    return await restaurantEntities.getPersonel({
        restaurantId: ctx.session.user.restaurantId
    })
}

export const updatePersonel = async ({
    input
}: TUseCaseOwnerLayer<TPersonelValidator.UpdatePersonelSchema>) => {
    await restaurantEntities.updatePersonel({
        personelId: input.id,
        personelData: input.data
    })
}