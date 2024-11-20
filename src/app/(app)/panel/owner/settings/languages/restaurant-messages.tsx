import React, { useEffect, useState } from 'react'
import { LanguageTab } from './_components/language-tab'
import { api } from '@/server/trpc/react';
import { ReservationMessages } from './_components/reservation-messages';
import { ProvisionMessages } from './_components/provision-messages';
import { WaitlistMessages } from './_components/waitlist-messages';
import { PrepaymentMessages } from './_components/prepayment-messages';
import { RestaurantTexts } from './_components/restaurant-texts';

type Props = {}

export const RestaurantMessages = (props: Props) => {
    const { data: restaurantLanguages, isLoading } = api.restaurant.getRestaurantLanguages.useQuery();

    const [currentLanguageId, setcurrentLanguageId] = useState<number | undefined>(undefined)
    useEffect(() => {
        if (restaurantLanguages) {
            setcurrentLanguageId(restaurantLanguages[0]?.languageId)
        }
    }, [restaurantLanguages])

    if (isLoading || !currentLanguageId) return <div>Loading...</div>

    return (
        <div className='max-w-[1000px]'>
            <LanguageTab currentLanguageId={currentLanguageId} setCurrentLanguageId={setcurrentLanguageId} />
            <RestaurantTexts currentLanguageId={currentLanguageId} />
            <LanguageTab currentLanguageId={currentLanguageId} setCurrentLanguageId={setcurrentLanguageId} />
            <ReservationMessages currentLanguageId={currentLanguageId} />
            <LanguageTab currentLanguageId={currentLanguageId} setCurrentLanguageId={setcurrentLanguageId} />
            <ProvisionMessages currentLanguageId={currentLanguageId} />
            <LanguageTab currentLanguageId={currentLanguageId} setCurrentLanguageId={setcurrentLanguageId} />
            <WaitlistMessages currentLanguageId={currentLanguageId} />
            <LanguageTab currentLanguageId={currentLanguageId} setCurrentLanguageId={setcurrentLanguageId} />
            <PrepaymentMessages currentLanguageId={currentLanguageId} />
        </div>
    )
}