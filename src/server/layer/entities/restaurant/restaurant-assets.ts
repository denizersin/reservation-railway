import { db } from '@/server/db';
import { tblRestaurantLanguage, TRestaurantLanguages } from '@/server/db/schema/restaurant';
import { tblRestaurantMealDays, tblRestaurantMeals, TRestaurantMealDaysCrud } from '@/server/db/schema/restaurant-assets';
import { getEnumValues } from '@/server/utils/server-utils';
import { EnumDays } from '@/shared/enums/predefined-enums';
import { and, eq, inArray } from 'drizzle-orm';

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