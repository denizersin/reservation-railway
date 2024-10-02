import { api } from '@/server/trpc/react';
import React from 'react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
    currentLanguageId: number | undefined
    setCurrentLanguageId: (id: number) => void
}

export const LanguageTab = ({
    currentLanguageId,
    setCurrentLanguageId
}: Props) => {
    const { data: restaurantLanguages } = api.restaurant.getLanguages.useQuery();

    return (
        <Tabs
        className='mt-6 mb-2'
            value={String(currentLanguageId)}
            onValueChange={(value) => {
                setCurrentLanguageId(Number(value))
            }}>
            <TabsList>
                {restaurantLanguages?.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.languageId.toString()}>{lang.language.name}</TabsTrigger>
                ))}
            </TabsList>


        </Tabs>
    )
}