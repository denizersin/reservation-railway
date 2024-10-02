import { LanguageEntity } from "../../entities/language"
import { TRestaurantTextsInsert } from "@/server/db/schema/restaurant-texts"

export const getReservationMessages = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}
) => {
    console.log(restaurantId,languageId,'23sad')
    const data = await LanguageEntity.getReservationMessagesByLang({ restaurantId, languageId })
    if (!data) {
        console.log('createdd')
        const newData=await LanguageEntity.createReservationMessages({ restaurantId, languageId })
        return newData
    }
    return data
}

export const getProvisionMessages = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}
) => {
    console.log(restaurantId,languageId,'provision_message')
    const data = await LanguageEntity.getProvisionMessagesByLang({ restaurantId, languageId })
    if (!data) {
        console.log('created provision message')
        const newData = await LanguageEntity.createProvisionMessages({ restaurantId, languageId })
        return newData
    }
    return data
}




export const getWaitlistMessages = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}
) => {
    console.log(restaurantId,languageId,'waitlist_message')
    const data = await LanguageEntity.getWaitlistMessagesByLang({ restaurantId, languageId })
    if (!data) {
        console.log('created waitlist message')
        const newData = await LanguageEntity.createWaitlistMessages({ restaurantId, languageId })
        return newData
    }
    return data
}

export const getPrepaymentMessages = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}
) => {
    console.log(restaurantId,languageId,'prepayment_message')
    const data = await LanguageEntity.getPrepaymentMessagesByLang({ restaurantId, languageId })
    if (!data) {
        console.log('created prepayment message')
        const newData = await LanguageEntity.createPrepaymentMessages({ restaurantId, languageId })
        return newData
    }
    return data
}

export const getRestaurantTexts = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {
    const restaurantTexts = await LanguageEntity.getRestaurantTextsByLang({
        restaurantId,
        languageId
    })

    if (!restaurantTexts) {
        const newData=await LanguageEntity.createRestaurantTexts({
            restaurantId,
            languageId
        })
        return newData
    }
    return restaurantTexts

}

