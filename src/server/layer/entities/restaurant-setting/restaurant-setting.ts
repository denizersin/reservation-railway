import { db } from '@/server/db';
import { tblRestaurant } from '@/server/db/schema/restaurant';
import { tblRestaurantGeneralSetting, TUpdateGeneralSetting } from '@/server/db/schema/restaurant-general-setting';
import { eq } from 'drizzle-orm';
import { updateRestaurantMeals } from '../restaurant/restaurant';

export const getGeneralSettings = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId),
        with: {
            meals: { with: { meal: true } },
            defaultCountry: true,
            defaultLanguage: true,
            newReservationState: true,
        }
    })

    console.log(restaurantGeneralSetting, '12restaurantGeneralSetting')

    if (!restaurantGeneralSetting) {
        return
    }

    const { meals } = restaurantGeneralSetting

    return {
        ...restaurantGeneralSetting,
        meals: meals.map((m) => m.meal)
    }
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
        meals,

        ...fields } = generalSetting


    console.log(fields, 'fields')
    console.log(meals, 'meals')


    //update general settings

    if (Object.keys(fields).length !== 0) {
        await db.update(tblRestaurantGeneralSetting).set(fields)
            .where(eq(tblRestaurantGeneralSetting.id, generalSettingID))
    }

    if (Array.isArray(meals)) {
        await updateRestaurantMeals({ generalSettingID, meals })
    }









}



export const getGeneralSettingsToUpdate = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId),
        with: {
            meals: { with: { meal: true } },
        }
    })

    console.log(restaurantGeneralSetting, '12restaurantGeneralSetting')

    if (!restaurantGeneralSetting) {
        return
    }

    const { meals } = restaurantGeneralSetting

    return {
        ...restaurantGeneralSetting,
        meals: meals.map((m) => m.meal.id)
    }
}
