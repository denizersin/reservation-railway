"use client"
import React, { useMemo, useState } from 'react'
import { MultiSelect } from "@/components/custom/multi-select";
import { api } from '@/server/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { Button } from '@/components/custom/button';
type Props = {}

const RestaurantLanguagesMultiSelect = (props: Props) => {

    const queryCLient = useQueryClient()

    const [isDisabled, setIsDisabled] = useState(true)

    const restauranLanguageMutation = api.restaurant.updateRestaurantLanguages.useMutation({
        onSuccess: () => {
            queryCLient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getRestaurantLanguages) })
        }
    })

    const {
        data: languages
    } = api.restaurant.getLanguages.useQuery()

    


    const languageOptions = useMemo(() => {
        return languages?.map((language) => ({
            label: language.name,
            value: String(language.id),
            icon: undefined
        })) || []
    }, [languages])

    const {
        data: restaurantLanguages
    } = api.restaurant.getRestaurantLanguages.useQuery()

    console.log(restaurantLanguages, 'restaurantLanguages')


    const selectedLanguages = restaurantLanguages?.map((language) => String(language.languageId)) || []

    const onChange = (selectedLanguages: string[]) => {
        const newLanguages = selectedLanguages.map((languageId) => Number(languageId))
        restauranLanguageMutation.mutate({
            languages: newLanguages
        })
    }

    return (
        <div>
            <Button
                onClick={() => setIsDisabled(!isDisabled)}
                variant={'link'}
                children={"Resotran Dil Ayarlarını Düzenle"}
            />
            <MultiSelect
                options={languageOptions}
                onValueChange={onChange}
                placeholder="Select frameworks"
                variant="inverted"
                defaultValue={selectedLanguages}
                animation={2}
                // maxCount={3}
                disabled={restauranLanguageMutation.isPending || isDisabled}
            />

        </div>


    )
}

export default RestaurantLanguagesMultiSelect