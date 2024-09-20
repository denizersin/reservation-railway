import { db } from '@/server/db';
import { tblRestaurantLanguage, tblRestaurantTranslations, tblRestaurant, TRestaurantInsert, TRestaurantLanguages } from '@/server/db/schema/restaurant';
import { tblRestaurantGeneralSetting, tblRestaurantGeneralSettingToMeal, TRestaurantGeneralSettingInsert, TUpdateGeneralSetting } from '@/server/db/schema/restaurant-general-setting';
import { EnumLanguage, EnumMeals, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { and, eq } from 'drizzle-orm';
import { predefinedEntities } from '../predefined';
import { tblMeal, TMeal } from '@/server/db/schema/predefined';
import { restaurantSettingEntities } from '../restaurant-setting';

export const createRestaurant = async ({
    restaurant,
}: {
    restaurant: TRestaurantInsert
}) => {
    const { translations, ...tblRestaurantValues } = restaurant
    const [newRestaurant] = await db.insert(tblRestaurant).values(tblRestaurantValues).$returningId()
    if (!newRestaurant?.id) {
        console.log('restaurant not created')
        throw new Error('Restaurant not created')
    };

    if (translations && translations.length > 0) {
        await db.insert(tblRestaurantTranslations).values(translations)
    }

    await setDefaultsToRestaurant({ restaurantId: newRestaurant.id })

    return newRestaurant.id
}






export const getRestaurant = async ({
    restaurantId,
    languageCode
}: {
    restaurantId: number,
    languageCode: EnumLanguage
}) => {

    const restaurant = await db.query.tblRestaurant.findFirst({
        where: eq(tblRestaurant.id, restaurantId),
        with: {
            translations: {
                where: eq(tblRestaurantTranslations.languageCode, languageCode)
            },

        }
    })

    if (!restaurant) {
        throw new Error('Restaurant not found')
    }

    const translations = await db.query.tblRestaurantTranslations.findFirst({
        where: and(
            eq(tblRestaurantTranslations.restaurantId, restaurantId),
            eq(tblRestaurantTranslations.languageCode, languageCode)
        )
    })
    if (!translations) return;

    const { translations: _, ...restaurantFields } = restaurant

    return {
        ...restaurantFields,
        ...translations
    }

}

export const setDefaultsToRestaurant = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    //default settings
    try {


        const trLanguage = await predefinedEntities.getLanguageByCode({ languageCode: EnumLanguage.tr })
        const enLanguage = await predefinedEntities.getLanguageByCode({ languageCode: EnumLanguage.en })

        const [generalSetting] = await db.insert(tblRestaurantGeneralSetting).values({
            defaultCountryId: (await predefinedEntities.getCountryByName({ countryName: 'turkey' }))?.id!,
            newReservationStatusId: (await predefinedEntities.getReservationStatusByStatus({ status: EnumReservationStatus.confirmation }))?.id!,
            defaultLanguageId: trLanguage?.id!,
            restaurantId: restaurantId
        }).$returningId()

        if (!generalSetting) {
            return
        }

        const dinner = (await db.query.tblMeal.findFirst({
            where: eq(tblMeal.name, EnumMeals.dinner)
        }))!

        //add default meal to restaurant
        await db.insert(tblRestaurantGeneralSettingToMeal).values([{
            mealId: dinner.id,
            restaurantSettingId: generalSetting.id
        },])


        //restaurant languages
        await db.insert(tblRestaurantLanguage).values([
            {
                restaurantId: restaurantId,
                languageId: trLanguage?.id!
            },
            {
                restaurantId: restaurantId,
                languageId: enLanguage?.id!
            }

        ])

    }
    catch (e) {
        console.log(e)
    }


}






export const getRestaurantWithSettings = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurantWithSettings = await db.query.tblRestaurant.findFirst({
        where: eq(tblRestaurant.id, restaurantId),
    })

    const generalSettings = await restaurantSettingEntities.getGeneralSettings({ restaurantId })

    return {
        ...restaurantWithSettings,
        generalSettings
    }
}


export const getRestaurantLanguages = async ({
    restaurantId
}: {
    restaurantId: number
}): Promise<TRestaurantLanguages> => {

    const restaurantLanguages = await db.query.tblRestaurantLanguage.findMany({
        where: eq(tblRestaurantLanguage.restaurantId, restaurantId),
        with: {
            language: true
        }
    })

    return restaurantLanguages
}





export const updateRestaurantMeals = async ({
    restaurantId,
    meals
}: {
    restaurantId: number,
    meals?: number[]
}) => {

    console.log(restaurantId, meals, 'restaurantId, meals')

    //update meals
    if (meals && meals.length > 0) {
        await db.delete(tblRestaurantGeneralSettingToMeal)
            .where(eq(tblRestaurantGeneralSettingToMeal.restaurantSettingId, restaurantId))
        await db.insert(tblRestaurantGeneralSettingToMeal)
            .values(meals.map(mealId => ({ mealId, restaurantSettingId: restaurantId })))
    }

}




export const updateRestaurantLanguages = async ({
    restaurantId,
    languages
}: {
    restaurantId: number,
    languages: number[]
}) => {

    //update languages
    if (languages && languages.length > 0) {
        await db.delete(tblRestaurantLanguage)
            .where(eq(tblRestaurantLanguage.restaurantId, restaurantId))
        await db.insert(tblRestaurantLanguage)
            .values(languages.map(languageId => ({ languageId, restaurantId })))
    }
}
