"use client"
import { ClientComponent } from '@/components/client-component';
import RestaurantLanguagesMultiSelect from './_components/restaurant-languages-multi-select';
import { RestaurantMessages } from './restaurant-messages';


type Props = {}

const Page = (props: Props) => {

    if (typeof window === 'undefined') return null

    return (
        <div>
            <ClientComponent>
                <RestaurantLanguagesMultiSelect />
                <RestaurantMessages />
            </ClientComponent>
        </div>

    )
}

export default Page