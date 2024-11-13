import { db } from '@/server/db';
import { tblRestaurantGeneralSetting, TUpdateGeneralSetting } from '@/server/db/schema/restaurant-general-setting';
import { eq } from 'drizzle-orm';

export const getGeneralSettings = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId),
        with: {
            defaultCountry: true,
            defaultLanguage: true,
            newReservationState: true,
        }
    })

    console.log(restaurantGeneralSetting, '12restaurantGeneralSetting')

    if (!restaurantGeneralSetting) {
        return
    }


    return restaurantGeneralSetting
}




export const updateRestaurantGeneralSettings = async ({
    generalSetting,
    generalSettingID
}: {
    generalSetting: TUpdateGeneralSetting,
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

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId),

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
    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId)
    })

    if (!restaurantGeneralSetting) {
        throw new Error('Restaurant general setting not found')
    }

    return restaurantGeneralSetting
}