import { api } from "@/server/trpc/react"
import { useMemo } from "react"

export const useCountriesSelectData = () => {
    const { data } = api.predefiend.getCountries.useQuery()
    const selectData = useMemo(() => data?.map((country) => ({
        label: country.name,
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


