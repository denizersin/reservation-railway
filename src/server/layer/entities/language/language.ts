import { db } from "@/server/db"
import { tblRestaurant } from "@/server/db/schema/restaurant"
import { and, eq } from "drizzle-orm"
import { tblPrepaymentMessage, tblProvisionMessage, tblReservationMessage, tblRestaurantTexts, tblWaitlistMessage, TPrepaymentMessageInsert, TProvisionMessageInsert, TReservationMessageInsert, TRestaurantTextsInsert, TWaitlistMessageInsert } from "@/server/db/schema/restaurant-texts"

export const getReservationMessagesByLang = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {

    const reservationMessage = await db.query.tblReservationMessage.findFirst({
        where: and(
            eq(tblReservationMessage.restaurantId, restaurantId),
            eq(tblReservationMessage.languageId, languageId)
        )
    })

    return reservationMessage

}


export const createReservationMessages = async ({
    restaurantId,
    languageId,

}: {
    restaurantId: number,
    languageId: number,

}) => {
    await db.insert(tblReservationMessage).values({
        restaurantId,
        languageId: languageId,
    })
    const reservationMessage = getReservationMessagesByLang({ restaurantId, languageId })
    return reservationMessage
}




export const updateReservationMessages = async ({
    restaurantId,
    languageId,
    ...data
}: TReservationMessageInsert) => {

    await db.update(tblReservationMessage).set({
        ...data,
    }).where(
        and(
            eq(tblReservationMessage.restaurantId, restaurantId),
            eq(tblReservationMessage.languageId, languageId)
        )
    )
}



export const getProvisionMessagesByLang = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {
    const provisionMessage = await db.query.tblProvisionMessage.findFirst({
        where: and(
            eq(tblProvisionMessage.restaurantId, restaurantId),
            eq(tblProvisionMessage.languageId, languageId)
        )
    })

    return provisionMessage
}

export const createProvisionMessages = async ({
    restaurantId,
    languageId,
}: {
    restaurantId: number,
    languageId: number,
}) => {
    await db.insert(tblProvisionMessage).values({
        restaurantId,
        languageId: languageId,
    })
    const provisionMessage = getProvisionMessagesByLang({ restaurantId, languageId })
    return provisionMessage
}

export const updateProvisionMessages = async ({
    restaurantId,
    languageId,
    ...data
}: TProvisionMessageInsert) => {
    console.log(restaurantId, languageId, 'provision_update')
    console.log(data, 'data')

    await db.update(tblProvisionMessage).set({
        ...data,
    }).where(
        and(
            eq(tblProvisionMessage.restaurantId, restaurantId),
            eq(tblProvisionMessage.languageId, languageId)
        )
    )
}




export const getWaitlistMessagesByLang = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {
    const waitlistMessage = await db.query.tblWaitlistMessage.findFirst({
        where: and(
            eq(tblWaitlistMessage.restaurantId, restaurantId),
            eq(tblWaitlistMessage.languageId, languageId)
        )
    })

    return waitlistMessage
}

export const createWaitlistMessages = async ({
    restaurantId,
    languageId,
}: {
    restaurantId: number,
    languageId: number,
}) => {
    await db.insert(tblWaitlistMessage).values({
        restaurantId,
        languageId: languageId,
    })
    const waitlistMessage = getWaitlistMessagesByLang({ restaurantId, languageId })
    return waitlistMessage
}

export const updateWaitlistMessages = async ({
    restaurantId,
    languageId,
    ...data
}: TWaitlistMessageInsert) => {
    console.log(restaurantId, languageId, 'waitlist_update')
    console.log(data, 'data')

    await db.update(tblWaitlistMessage).set({
        ...data,
    }).where(
        and(
            eq(tblWaitlistMessage.restaurantId, restaurantId),
            eq(tblWaitlistMessage.languageId, languageId)
        )
    )
}

export const getPrepaymentMessagesByLang = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {
    const prepaymentMessage = await db.query.tblPrepaymentMessage.findFirst({
        where: and(
            eq(tblPrepaymentMessage.restaurantId, restaurantId),
            eq(tblPrepaymentMessage.languageId, languageId)
        )
    })

    return prepaymentMessage
}

export const createPrepaymentMessages = async ({
    restaurantId,
    languageId,
}: {
    restaurantId: number,
    languageId: number,
}) => {
    await db.insert(tblPrepaymentMessage).values({
        restaurantId,
        languageId: languageId,
    })
    const prepaymentMessage = getPrepaymentMessagesByLang({ restaurantId, languageId })
    return prepaymentMessage
}

export const updatePrepaymentMessages = async ({
    restaurantId,
    languageId,
    ...data
}: TPrepaymentMessageInsert) => {
    console.log(restaurantId, languageId, 'prepayment_update')
    console.log(data, 'data')

    await db.update(tblPrepaymentMessage).set({
        ...data,
    }).where(
        and(
            eq(tblPrepaymentMessage.restaurantId, restaurantId),
            eq(tblPrepaymentMessage.languageId, languageId)
        )
    )
}

export const getRestaurantTextsByLang = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {
    const restaurantTexts = await db.query.tblRestaurantTexts.findFirst({
        where: and(
            eq(tblRestaurantTexts.restaurantId, restaurantId),
            eq(tblRestaurantTexts.languageId, languageId)
        )
    })

    return restaurantTexts
}

export const createRestaurantTexts = async ({
    restaurantId,
    languageId,
}: {
    restaurantId: number,
    languageId: number,
}) => {
    await db.insert(tblRestaurantTexts).values({
        restaurantId,
        languageId: languageId,
    })
    const restaurantTexts = getRestaurantTextsByLang({ restaurantId, languageId })
    return restaurantTexts
}

export const updateRestaurantTexts = async ({
    restaurantId,
    languageId,
    ...data
}: TRestaurantTextsInsert) => {

    console.log(data,'data')
    console.log(restaurantId, languageId, 'restaurant_update')
    await db.update(tblRestaurantTexts).set({
        ...data,
    }).where(
        and(
            eq(tblRestaurantTexts.restaurantId, restaurantId),
            eq(tblRestaurantTexts.languageId, languageId)
        )
    )
}

