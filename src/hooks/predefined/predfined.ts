import { COLORS } from "@/lib/constants"
import { api } from "@/server/trpc/react"
import { getEnumValues } from "@/server/utils/server-utils"
import { MEAL_HOURS } from "@/shared/data/predefined"
import { EnumMonths, EnumMonthsNumeric } from "@/shared/enums/predefined-enums"
import { useMemo } from "react"

export const useCountriesSelectData = () => {
    const { data } = api.predefiend.getCountries.useQuery()
    const selectData = useMemo(() => data?.map((country) => ({
        label: country.name,
        value: String(country.id)
    })) || [], [data])
    return { selectData, isLoading: false }
}

export const usePhoneCodesSelectData = () => {
    const { data } = api.predefiend.getCountries.useQuery()
    const selectData = useMemo(() => data?.map((country) => ({
        label: country.phoneCode + '-' + country.name,
        value: String(country.id)
    })) || [], [data])
    return { selectData, isLoading: false }
}

export const useLanguagesSelectData = () => {
    const { data, isLoading } = api.restaurant.getLanguages.useQuery()
    const selectData = useMemo(() => data?.map((language) => ({
        label: language.name,
        value: String(language.id)
    })) || [], [data])
    return { selectData, isLoading }
}

export const useRestaurantLanguagesSelectData = () => {
    const { data, isLoading } = api.restaurant.getRestaurantLanguages.useQuery()
    const selectData = useMemo(() => data?.map((language) => ({
        label: language.language.name,
        value: String(language.languageId)
    })) || [], [data])
    return { selectData, isLoading }
}

export const useGuestCompanySelectData = () => {
    const { data, isLoading } = api.guest.getGuestCompaniesPagination.useQuery({
        pagination: {
            page: 1,
            limit: 100
        }
    })
    const selectData = useMemo(() => data?.data?.map((company) => ({
        label: company.companyName,
        value: String(company.id)
    })) || [], [data])
    return { selectData, isLoading: false }
}

export const useRestaurantTagsSelectData = () => {
    const { data, isLoading } = api.restaurant.getTags.useQuery()
    const selectData = useMemo(() => data?.data?.map((tag) => ({
        label: tag.translations?.[0]?.name || '',
        value: String(tag.id)
    })) || [], [data])
    return { selectData, isLoading }
}

export const useAvailableRestaurantTagsSelectData = () => {
    const { data, isLoading } = api.restaurant.getTags.useQuery()
    const selectData = useMemo(() => data?.data?.filter((tag) => tag.isAvailable).map((tag) => ({
        label: tag.translations?.[0]?.name || '',
        value: String(tag.id)
    })) || [], [data])
    return { selectData, isLoading }
}

export const useRoomSelectData = () => {
    const { data, isLoading } = api.room.getRooms.useQuery({})
    const selectData = useMemo(() => data?.map((room) => ({
        label: room.translations?.[0]?.name || '',
        value: String(room.id)
    })) || [], [data])
    return { selectData, isLoading }
}


export const usePersonalSelectData = () => {
    const { data, isLoading } = api.restaurant.getPersonels.useQuery()
    const selectData = useMemo(() => data?.map((personal) => ({
        label: personal.fullName,
        value: String(personal.id)
    })) || [], [data])

    const withNoneOption = useMemo(() => [
        {
            label: 'None',
            value: "none"
        },
        ...selectData
    ], [selectData])

    return { selectData: withNoneOption, isLoading }
}

export const useReservationTagsSelectData = () => {
    const { data, isLoading } = api.restaurant.getTags.useQuery()
    const selectData = useMemo(() => data?.data?.map((tag) => ({
        label: tag.translations?.[0]?.name || '',
        value: String(tag.id)
    })) || [], [data])
    return { selectData, isLoading }
}

export const useHoursSelectData = () => {
    const mealHoursToSelect = useMemo(() => MEAL_HOURS.map(hour => ({
        value: hour,
        label: hour,
    })), [])
    return { selectData: mealHoursToSelect, isLoading: false }
}

export const useMealHoursSelectData = ({ mealId }: { mealId: number }) => {
    const { data, isLoading } = api.restaurant.getRestaurantMealHours.useQuery({ mealId })
    const mealHours = useMemo(() => data?.[0]?.mealHours?.map((mealHour) => ({
        label: mealHour.hour,
        value: mealHour.hour
    })) || [], [data])
    return { selectData: mealHours, isLoading }
}

export const useColorsSelectData = () => {
    const colors = useMemo(() => COLORS, [])
    return { selectData: colors, isLoading: false }
}

export const useMonthsSelectData = () => {
    const months = useMemo(() => {
        return getEnumValues(EnumMonths).map((month) => ({
            label: month.toString(),
            value: EnumMonthsNumeric[month].toString()
        }))
    }, [])
    return { selectData: months, isLoading: false }
}


export const useAreSelectData = () => {
    const { data: restaurantRooms } = api.room.getRooms.useQuery({})
    const restaurantRoomsSelect = useMemo(() => restaurantRooms?.map(rsRoom => ({
        label: rsRoom.translations[0]?.name ?? '',
        value: String(rsRoom.id)
    })), [restaurantRooms]) || []
    return { selectData: restaurantRoomsSelect, isLoading: false }
}