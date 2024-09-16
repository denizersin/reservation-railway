import { db } from '@/server/db';
import { tblRestaurantTranslations, tblResturant, TResturantInsert } from '@/server/db/schema/restaurant';
import { tblRestaurantGeneralSetting, tblRestaurantGeneralSettingToMeal, TRestaurantGeneralSettingInsert } from '@/server/db/schema/restaurant-general-setting';
import { EnumLanguage, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import { and, eq } from 'drizzle-orm';
import { predefinedEntities } from '../predefined';
import { TMeal } from '@/server/db/schema/predefined';

export const createRestaurant = async ({
    restaurant,
}: {
    restaurant: TResturantInsert
}) => {
    const { translations, ...tblRestaurantValues } = restaurant
    const [newRestaurant] = await db.insert(tblResturant).values(tblRestaurantValues).$returningId()
    if (!newRestaurant?.id) return;

    if (translations && translations.length > 0) {
        await db.insert(tblRestaurantTranslations).values(translations)
    }

    return newRestaurant.id
}






export const getRestaurant = async ({
    restaurantId,
    languageCode
}: {
    restaurantId: number,
    languageCode: EnumLanguage
}) => {

    const restaurant = await db.query.tblResturant.findFirst({
        where: eq(tblResturant.id, restaurantId),
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
    db.transaction(async (trx) => {

        //default settings
        try {
            const generalSetting = await trx.insert(tblRestaurantGeneralSetting).values({
                defaultCountryId: (await predefinedEntities.getCountryByName({ countryName: 'turkey' }))?.id!,
                defaultLanguageId: (await predefinedEntities.getLanguageByCode({ languageCode: EnumLanguage.tr }))?.id!,
                newReservationStatusId: (await predefinedEntities.getReservationStatusByStatus({ status: EnumReservationStatus.confirmation }))?.id!,
                restaurantId: restaurantId

            })
        }
        catch (e) {
            console.log(e)
            trx.rollback()
        }


    })
}


export const getGeneralSettings = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurantGeneralSetting = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblResturant.id, restaurantId),
        with: {
            meals: { with: { meal: true } },
            defaultCountry: true,
            defaultLanguage: true,
            newReservationState: true,
        }
    })

    if (!restaurantGeneralSetting) {
        return
    }

    const { meals } = restaurantGeneralSetting

    return {
        ...restaurantGeneralSetting,
        meals: meals.map((m) => m.meal)
    }
}

export const updateGeneralSettings = async ({
    restaurantId,
    generalSettings,
    meals
}: {
    restaurantId: number,
    generalSettings?: Partial<TRestaurantGeneralSettingInsert>
    meals?: TMeal[]
}) => {

    db.transaction(async (trx) => {

        //update general settings
        try {
            await trx.update(tblRestaurantGeneralSetting).set({ ...generalSettings })
                .where(eq(tblRestaurantGeneralSetting.restaurantId, restaurantId))


            //update meals
            await trx.delete(tblRestaurantGeneralSettingToMeal).where(eq(tblRestaurantGeneralSettingToMeal.restaurantSettingId, restaurantId))

            if (meals && meals.length > 0) {
                await trx.insert(tblRestaurantGeneralSettingToMeal).values(
                    meals.map((meal) => ({
                        mealId: meal.id,
                        restaurantSettingId: restaurantId
                    }))
                );
            }
        }

        catch (e) {
            console.log(e)
            trx.rollback()
        }

    })

}


export const getRestaurantWithSettings = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurantWithSettings = await db.query.tblResturant.findFirst({
        where: eq(tblResturant.id, restaurantId),
    })

    const generalSettings = await getGeneralSettings({ restaurantId })

    return {
        ...restaurantWithSettings,
        generalSettings
    }
}









