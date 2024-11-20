import { api } from '@/server/trpc/react';
import { DEFAULT_LANGUAGE_DATA } from '@/shared/data/predefined';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useEffect } from 'react';


export function useLanguage() {
    const { data: userPreferences, isLoading } = api.user.getUserPreferences.useQuery()

    const languageCode = userPreferences?.language.languageCode || DEFAULT_LANGUAGE_DATA.languageCode

    const queryClient = useQueryClient()

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: getQueryKey(api.restaurant.getTags)})
        
    }, [languageCode])


    return {
        language: languageCode,
        isLoading

    }

}