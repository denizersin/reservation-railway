import { DEFAULT_LANGUAGE } from '@/server/data';
import { api } from '@/server/trpc/react';
import { useEffect } from 'react';


export function useLanguage() {
    const { data: userPreferences, isLoading } = api.user.getUserPreferences.useQuery()

    const languageCode = userPreferences?.language.languageCode || DEFAULT_LANGUAGE.languageCode


    useEffect(() => {
    }, [languageCode])


    return {
        language: languageCode,
        isLoading

    }

}