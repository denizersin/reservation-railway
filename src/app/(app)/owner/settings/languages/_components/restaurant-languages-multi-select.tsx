"use client"
import React, { useMemo } from 'react'
import { MultiSelect } from "@/components/custom/multi-select";
import { api } from '@/server/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
type Props = {}

const RestaurantLanguagesMultiSelect = (props: Props) => {

    const queryCLient = useQueryClient()



    const restauranLanguageMutation = api.restaurant.updateRestaurantLanguages.useMutation({
        onSuccess: () => {
            queryCLient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getLanguages) })
        }
    })

    const {
        data: languages
    } = api.predefiend.getLanguages.useQuery()


    const languageOptions = useMemo(() => {
        return languages?.map((language) => ({
            label: language.name,
            value: String(language.id),
            icon: undefined
        })) || []
    }, [languages])

    const {
        data: restaurantLanguages
    } = api.restaurant.getLanguages.useQuery()

    const selectedLanguages = restaurantLanguages?.map((language) => String(language.languageId)) || []

    const onChange = (selectedLanguages: string[]) => {
        const newLanguages = selectedLanguages.map((languageId) => Number(languageId))
        restauranLanguageMutation.mutate({
            languages: newLanguages
        })
    }

    return (
        <MultiSelect
            options={languageOptions}
            onValueChange={onChange}
            placeholder="Select frameworks"
            variant="inverted"
            defaultValue={selectedLanguages}
            animation={2}
            // maxCount={3}
            disabled={restauranLanguageMutation.isPending}
        />

    )
}

export default RestaurantLanguagesMultiSelect