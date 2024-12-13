import { db } from '@/server/db';
import { tblMeal } from '@/server/db/schema/predefined';
import { tblRestaurant, tblRestaurantLanguage, tblRestaurantTranslations, TRestaurantInsert, TRestaurantLanguages } from '@/server/db/schema/restaurant';
import { tblMealHours, tblRestaurantMealDays, tblRestaurantMeals, TMealHoursAdd, TRestaurantMealDaysCrud } from '@/server/db/schema/restaurant-assets';
import { formatTimeWithoutSeconds, getEnumValues, utcHourToLocalHour } from '@/server/utils/server-utils';
import { EnumDays, EnumLanguage, EnumMeals, EnumReservationStatus, EnumReservationStatusNumeric, EnumReviewSendDay, EnumReviewSendType } from '@/shared/enums/predefined-enums';
import TRestaurantAssetsValidator from '@/shared/validators/restaurant/restauran-assets';
import { and, eq, inArray } from 'drizzle-orm';
import { predefinedEntities } from '../predefined';
import { tblRestaurantGeneralSetting, tblRestaurantPaymentSetting, tblRestaurantReviewSettings, tblRestaurantTag, tblRoom, tblRoomTranslation } from '@/server/db/schema';
import { serverData } from '@/server/data';
import { languagesData } from '@/shared/data/predefined';
import TReviewSettingsValidator from '@/shared/validators/restaurant-setting/review';
import { restaurantTagEntities } from '../restaurant-tag';
import { restaurantGeneralSettingEntities, reviewSettingEntities } from '../restaurant-setting';
import { tblRestaurantCalendarSetting } from '@/server/db/schema/restaurant-setting/calendar-setting';

export const createRestaurant = async ({
    restaurant,
}: {
    restaurant: Omit<TRestaurantInsert, 'paymentSettingId' | 'restaurantGeneralSettingId'>
}) => {

    const result = await db.transaction(async (tx) => {


        const enLanguage = await predefinedEntities.getLanguageByCode({ languageCode: EnumLanguage.en })

        const [unclaimedRestaurantGeneralSetting] = await db.insert(tblRestaurantGeneralSetting).values({
            defaultLanguageId: enLanguage?.id!,
            defaultCountryId: (await predefinedEntities.getCountryByName({ countryName: 'turkey' }))?.id!,
            newReservationStatusId: EnumReservationStatusNumeric.reservation,

        }).$returningId()

        const newGeneralSettingId = unclaimedRestaurantGeneralSetting?.id!



        const [paymentSetting] = await db.insert(tblRestaurantPaymentSetting).values({
            prePaymentPricePerGuest: 2000,
        }).$returningId()

        const newPaymentSettingId = paymentSetting?.id!

        const [calendarSetting] = await db.insert(tblRestaurantCalendarSetting).values({
            maxAdvanceBookingDays: 130,
            closedMonths: []
        }).$returningId()

        const newCalendarSettingId = calendarSetting?.id!


        const { translations, ...tblRestaurantValues } = restaurant
        const [newRestaurant] = await db.insert(tblRestaurant).values({
            ...tblRestaurantValues,
            paymentSettingId: newPaymentSettingId,
            restaurantGeneralSettingId: newGeneralSettingId,
            restaurantCalendarSettingId: newCalendarSettingId
        }).$returningId()

        if (!newRestaurant?.id) {
            console.log('restaurant not created')
            throw new Error('Restaurant not created')
        };

        if (translations && translations.length > 0) {
            await db.insert(tblRestaurantTranslations).values(translations)
        }

        await setDefaultsToRestaurant({ restaurantId: newRestaurant.id })

        return newRestaurant.id
    })

    return result

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
export const getRestaurantById = async ({
    restaurantId
}: {
    restaurantId: number
}) => {
    const restaurant = await db.query.tblRestaurant.findFirst({ where: eq(tblRestaurant.id, restaurantId) })
    if (!restaurant) throw new Error('Restaurant not found')
    return restaurant
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
            days.map((day, index) => ({
                mealId: dinner.id,
                restaurantId: restaurantId,
                day: day,
                isOpen: [0, 6].includes(index) ? false : true
            }))
        )

        //review settings
        await db.insert(tblRestaurantReviewSettings).values({
            restaurantId: restaurantId,
            isReviewEnabled: true,
            reviewSendTime: '14:00',
            reviewSendType: EnumReviewSendType.SMS_AND_EMAIL,
            reviewSendDay: EnumReviewSendDay.CHECK_OUT_DAY
        })

        //review categories
        const reviews = serverData.reviewCategories.map((category, index) => ({
            review: {
                isActive: true,
                order: index + 1,
            },
            translations: languagesData.map(lang => ({
                title: lang.languageCode === 'tr' ? category.tr.title : category.en.title,
                description: lang.languageCode === 'tr' ? category.tr.description : category.en.description,
                languageId: lang.id
            }))
        })) as TReviewSettingsValidator.TCreateReviewSchema[]

        await Promise.all(reviews.map(review => reviewSettingEntities.createReview({
            review: {
                ...review.review,
                restaurantId
            },
            translations: review.translations
        })))

        console.log('serverData.reservationTags', restaurantId, 'restaurantId')
        await Promise.all(serverData.reservationTags.map(tag => restaurantTagEntities.createRestaurantTag({
            tag: { restaurantId, color: tag.color, isAvailable: tag.isAvailable },
            translations: tag.translations
        })))

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

    const generalSettings = await restaurantGeneralSettingEntities.getGeneralSettings({ restaurantId })

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
export const getRestaurantMealDaysByMealId = async ({
    restaurantId,
    mealId
}: { restaurantId: number, mealId: number }) => {
    const restaurantMealDays = await db.query.tblRestaurantMealDays.findMany({
        where: and(
            eq(tblRestaurantMealDays.restaurantId, restaurantId),
            eq(tblRestaurantMealDays.mealId, mealId)
        )
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
            mealId ? eq(tblMealHours.mealId, mealId) : undefined
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



export const getRestaurantRoomsWithTranslations = async ({
    restaurantId,
    languageId
}: {
    restaurantId: number,
    languageId: number
}) => {
    const rooms = await db.query.tblRoom.findMany({
        where: eq(tblRoom.restaurantId, restaurantId),
        with: {
            translations: {
                where: eq(tblRoomTranslation.languageId, languageId)
            }
        }
    })

    return rooms
}

export const getRestaurantSettings = async ({
    restaurantId
}: { restaurantId: number }) => {

    const restaurant = await db.query.tblRestaurant.findFirst({
        where: eq(tblRestaurant.id, restaurantId),
        with: {
            restaurantGeneralSetting: true,
            paymentSetting: true
        }
    })

    if (!restaurant) throw new Error('Restaurant settings not found')
    return restaurant
}

export const getRestaurantUserPreferences = async ({
    restaurantId
}: { restaurantId: number }) => {


    const restaurantGeneralSetting = await restaurantGeneralSettingEntities.getGeneralSettings({ restaurantId })

    const { defaultLanguageId } = restaurantGeneralSetting
    return {
        defaultLanguageId
    }

}

