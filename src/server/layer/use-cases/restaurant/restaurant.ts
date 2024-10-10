import { TMealHoursAdd, TRestaurantMealDaysCrud } from "@/server/db/schema/restaurant-assets"
import { restaurantEntities } from "../../entities/restaurant"
import { restaurantSettingEntities } from "../../entities/restaurant-setting"
import TRestaurantAssetsValidator from "@/shared/validators/restaurant/restauran-assets"
import { DEFAULT_UTC_OFFSET } from "@/server/utils/server-constants"
import { formatimeWithSeconds, localHourToUtcHour } from "@/server/utils/server-utils"




export const updateRestaurantMeals = async ({
    restaurantId,
    mealIds
}: {
    restaurantId: number,
    mealIds: number[]
}) => {
    await restaurantEntities.updateRestaurantMeals({ mealIds: mealIds, restaurantId: restaurantId })

}

export const updateRestaurantMealDays = async ({
    restaurantId,
    mealDays
}: {
    restaurantId: number,
    mealDays: TRestaurantMealDaysCrud['mealDays']
}) => {

    await restaurantEntities.updateRestaurantMealDays({ mealDays: mealDays, restaurantId: restaurantId })


}

export const createRestaurantMealHours = async ({
    restaurantId,
    mealHours
}: {
    restaurantId: number,
    mealHours: TMealHoursAdd['mealHours']
}) => {

    mealHours.forEach(mealHour=>{
        console.log('qweqwe')
        mealHour.hour=localHourToUtcHour(mealHour.hour)
        mealHour.hour=formatimeWithSeconds(mealHour.hour)
    })

    await restaurantEntities.createMealHours({ mealHours: mealHours, restaurantId })
}

export const deleteRestaurantMealHour = async ({
    mealHourId
}: {
    mealHourId: number
}) => {
    await restaurantEntities.deleteMealHourById({ mealHourId })
}

export const updateMealHour = async ({
    data,
    utcOffset = DEFAULT_UTC_OFFSET
}: {
    data: TRestaurantAssetsValidator.restaurantMealHoursUpdateSchema
    utcOffset?: number

}) => {
    if(data.data.hour){
        data.data.hour=localHourToUtcHour(data.data.hour,utcOffset)
        data.data.hour=formatimeWithSeconds(data.data.hour)
    }
    if (Object.keys(data.data).length === 0) return;
    await restaurantEntities.updateMealHour({  data })
}

export const getMealHours = async ({
    restaurantId,
    mealId
}: {
    restaurantId: number,
    mealId?: number
}) => {
    return await restaurantEntities.getMealHours({ restaurantId, mealId })
}