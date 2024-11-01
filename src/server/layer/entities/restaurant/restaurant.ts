import { db } from '@/server/db';
import { tblMeal } from '@/server/db/schema/predefined';
import { tblRestaurant, tblRestaurantLanguage, tblRestaurantTranslations, TRestaurantInsert, TRestaurantLanguages } from '@/server/db/schema/restaurant';
import { tblMealHours, tblRestaurantMealDays, tblRestaurantMeals, TMealHoursAdd, TRestaurantMealDaysCrud } from '@/server/db/schema/restaurant-assets';
import { tblRestaurantGeneralSetting } from '@/server/db/schema/restaurant-general-setting';
import { formatTimeWithoutSeconds, getEnumValues, utcHourToLocalHour } from '@/server/utils/server-utils';
import { EnumDays, EnumLanguage, EnumMeals, EnumReservationStatus } from '@/shared/enums/predefined-enums';
import TRestaurantAssetsValidator from '@/shared/validators/restaurant/restauran-assets';
import { and, eq, inArray } from 'drizzle-orm';
import { predefinedEntities } from '../predefined';
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
            newReservationStatusId: (await predefinedEntities.getReservationStatusByStatus({ status: EnumReservationStatus.reservation }))?.id!,
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
        await db.insert(tblRestaurantMeals).values([{
            mealId: dinner.id,
            restaurantId: restaurantId
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

        //restaurant meal days
        const days = getEnumValues(EnumDays);

        await db.insert(tblRestaurantMealDays).values(
            days.map(day => ({
                mealId: dinner.id,
                restaurantId: restaurantId,
                day: day,
                isOpen: true
            }))
        )

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
    mealIds
}: {
    restaurantId: number,
    mealIds: number[]
}) => {
    const restaurantMeals = await getRestaurantMealIds({ restaurantId })
    const newMeals = mealIds.filter(mealId => !restaurantMeals.includes(mealId))
    const deletedMeals = restaurantMeals.filter(mealId => !mealIds.includes(mealId))

    //delete meals
    if (deletedMeals.length > 0) {
        await db.delete(tblRestaurantMeals)
            .where(and(
                eq(tblRestaurantMeals.restaurantId, restaurantId),
                inArray(tblRestaurantMeals.mealId, deletedMeals)
            ))
    }

    if (newMeals.length > 0) {
        await db.insert(tblRestaurantMeals)
            .values(newMeals.map(mealId => ({ mealId, restaurantId: restaurantId })))
        const days = getEnumValues(EnumDays)

        //add meal days
        await db.insert(tblRestaurantMealDays)
            .values(newMeals.flatMap(mealId => days.map(day => ({
                mealId,
                restaurantId,
                day,
                isOpen: true
            })))
            )
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


export const getRestaurantMealIds = async ({
    restaurantId
}: { restaurantId: number }) => {
    const restaurantMeals = await db.query.tblRestaurantMeals.findMany({
        where: eq(tblRestaurantMeals.restaurantId, restaurantId),
        with: {
            meal: true
        }
    })

    const mealIds = restaurantMeals.map(({ meal }) => meal.id)

    return mealIds
}
export const getRestaurantMeals = async ({
    restaurantId
}: { restaurantId: number }) => {
    const restaurantMeals = await db.query.tblRestaurantMeals.findMany({
        where: eq(tblRestaurantMeals.restaurantId, restaurantId),
        with: {
            meal: true
        }
    })



    return restaurantMeals
}


export const updateRestaurantMealDays = async ({
    restaurantId,
    mealDays
}: {
    restaurantId: number,
    mealDays: TRestaurantMealDaysCrud['mealDays']
}) => {

    //update meal days

    const promises = mealDays.map(async mealDay => {
        //update without deleting
        await db.update(tblRestaurantMealDays).set(mealDay)
            .where(and(
                eq(tblRestaurantMealDays.mealId, mealDay.mealId),
                eq(tblRestaurantMealDays.day, mealDay.day))
            )

    })

    await Promise.all(promises)

}


export const getRestaurantMealDays = async ({
    restaurantId
}: { restaurantId: number }) => {
    const restaurantMealDays = await db.query.tblRestaurantMealDays.findMany({
        where: eq(tblRestaurantMealDays.restaurantId, restaurantId),
        with: {
            meal: true
        }
    })

    return restaurantMealDays
}

export const createMealHours = async ({
    restaurantId,
    mealHours
}: {
    restaurantId: number,
    mealHours: TMealHoursAdd['mealHours']
}) => {

    const parsedMealHours = mealHours.map(mealHour => ({
        ...mealHour,
    }))

    if (parsedMealHours.length === 0) return;

    const existingMealHours = await db.query.tblMealHours.findMany({
        where: and(eq(tblMealHours.restaurantId, restaurantId),
            eq(tblMealHours.mealId, parsedMealHours[0]!.mealId))
    })

    const filteredMealHours = parsedMealHours.filter(mealHour => !existingMealHours.some(existingMealHour => (existingMealHour.hour) === mealHour.hour))

    if (filteredMealHours.length === 0) return;

    await db.insert(tblMealHours).values(
        filteredMealHours.map(mealHour => ({
            ...mealHour,
            restaurantId
        }))
    )
}

export const deleteMealHourById = async ({
    mealHourId
}: {
    mealHourId: number
}) => {
    await db.delete(tblMealHours).where(eq(tblMealHours.id, mealHourId))
}

export const getMealHours = async ({
    restaurantId,
    mealId
}: {
    restaurantId: number,
    mealId?: number
}) => {
    const mealHours = await db.query.tblMealHours.findMany({
        where: and(
            eq(tblMealHours.restaurantId, restaurantId),
            // mealId ? eq(tblMealHours.mealId, mealId) : undefined
        ),
        with: {
            meal: true
        },

    })

    const formattedMealHours = mealHours.map(mealHour => ({
        ...mealHour,
        hour: utcHourToLocalHour(formatTimeWithoutSeconds(mealHour.hour))
    }))

    const restaurantMeal = await db.query.tblRestaurantMeals.findMany({
        where: eq(tblRestaurantMeals.restaurantId, restaurantId),
        with: {
            meal: true
        }
    })


    const groupByMealId = formattedMealHours.reduce((acc, mealHour) => {
        acc[mealHour.mealId] = acc[mealHour.mealId] || []
        acc[mealHour.mealId]!.push(mealHour)
        return acc
    }, {} as { [key: number]: typeof formattedMealHours })


    const Data = restaurantMeal.map((restaurantMeal) => ({
        meal: restaurantMeal.meal,
        mealHours: groupByMealId[restaurantMeal.mealId]
    }))


    return Data
}

export const updateMealHour = async ({
    data
}: {
    data: TRestaurantAssetsValidator.restaurantMealHoursUpdateSchema
}) => {

    const {
        mealHourId,
        data: mealHourData
    } = data


    await db.update(tblMealHours).set(mealHourData).where(eq(tblMealHours.id, mealHourId))
}




