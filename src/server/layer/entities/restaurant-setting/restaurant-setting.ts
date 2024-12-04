import { db } from '@/server/db';
import { tblRestaurantGeneralSetting, TUpdateGeneralSetting } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { restaurantEntities } from '../restaurant';

export const getGeneralSettings = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurant = await restaurantEntities.getRestaurantById({ restaurantId })

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.id, restaurant.restaurantGeneralSettingId),
        with: {
            defaultCountry: true,
            defaultLanguage: true,
            newReservationState: true,
        }
    })


    if (!restaurantGeneralSetting) {
        throw new Error('Restaurant general setting not found')
    }


    return restaurantGeneralSetting!
}




export const updateRestaurantGeneralSettings = async ({
    generalSetting,
    generalSettingID
}: {
    generalSetting: Omit<Partial<TUpdateGeneralSetting>, 'restaurantId' | 'id'>,
    generalSettingID: number
}) => {

    //seperate many 
    const {

        ...fields } = generalSetting




    //update general settings

    if (Object.keys(fields).length !== 0) {
        await db.update(tblRestaurantGeneralSetting).set(fields)
            .where(eq(tblRestaurantGeneralSetting.id, generalSettingID))
    }










}



export const getGeneralSettingsToUpdate = async ({
    restaurantId
}: {
    restaurantId: number
}) => {
    const restaurant = await restaurantEntities.getRestaurantSettings({ restaurantId })

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.id, restaurant.restaurantGeneralSettingId),

    })


    if (!restaurantGeneralSetting) {
        return
    }


    return restaurantGeneralSetting
}


export const getGeneralSettingsByRestaurantId = async ({
    restaurantId
}: {
    restaurantId: number
}) => {
    const restaurant = await restaurantEntities.getRestaurantSettings({ restaurantId })

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.id, restaurant.restaurantGeneralSettingId)
    })

    if (!restaurantGeneralSetting) {
        throw new Error('Restaurant general setting not found')
    }

    return restaurantGeneralSetting
}

