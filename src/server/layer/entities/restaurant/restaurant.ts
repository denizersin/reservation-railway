import { db } from '@/server/db';
import { tblResturant, tblRestaurantTranslations, TResturant, TResturantInsert } from '@/server/db/schema/restaurant';
import { tblRestaurantSetting, tblRestaurantSettingToMeal } from '@/server/db/schema/restaurant-setting';
import { EnumLanguage, tblRefreshToken } from '@/server/db/schema/user';
import { eq, and } from 'drizzle-orm';

export const createRestaurant = ({
    restaurant,
}: {
    restaurant: TResturantInsert
}) => {

    const { translations, ...tblRestaurantValues } = restaurant

    db.transaction(async (trx) => {
        const [result] = await trx.insert(tblResturant).values(tblRestaurantValues).$returningId()
        if (!result?.id) return;
        const ids = await trx.insert(tblRestaurantTranslations).values(translations).$returningId()
        

    })




}


export const getRestaurantSettingMeals = async ({
    restaurantId,
    languageCode
}: {
    restaurantId: number,
    languageCode: EnumLanguage
}) => {

    const restaurantSetting = await db.query.tblRestaurantSetting.findFirst({
        where: eq(tblRestaurantSetting.restaurantId, restaurantId)
    })

    if (!restaurantSetting) {
        throw new Error('Restaurant setting not found')
    }
    const restaurantSettingId = restaurantSetting.id

    const result = await db.query.tblRestaurantSettingToMeal.findMany({
        where: eq(tblRestaurantSettingToMeal.restaurantSettingId, restaurantSettingId),
        with: {
            meal: {
                with: {
                    translations: {
                        where: eq(tblRestaurantTranslations.languageCode, languageCode)
                    }
                }
            }
        }
    })

    const meals = result.map(settingToMeal => {
        const { meal, ...rest } = settingToMeal
        return {
            ...rest,
            ...meal.translations[0]!
        }
    })

    return meals

}


export const restaurantSettingEntities = {
    getRestaurantSettingMeals
}