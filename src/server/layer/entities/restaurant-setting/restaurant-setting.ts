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
        where: eq(tblRestaurant.id, restaurantId),
        with: {
            meals: { with: { meal: true } },
            defaultCountry: true,
            defaultLanguage: true,
            newReservationState: true,
        }
    })

    console.log(restaurantGeneralSetting, 'restaurantGeneralSetting')

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
    restaurantId
}: {
    restaurantId: number,
    generalSetting: TUpdateGeneralSetting
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
            .where(eq(tblRestaurantGeneralSetting.restaurantId, restaurantId))
    }

    await updateRestaurantMeals({ restaurantId, meals })








}