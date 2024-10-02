"use client"
import RestaurantLanguagesMultiSelect from './_components/restaurant-languages-multi-select';
import { RestaurantMessages } from './restaurant-messages';
type Props = {}

const Page = (props: Props) => {



    return (
        <div>
            <RestaurantLanguagesMultiSelect/>
            <RestaurantMessages/>
        </div>

    )
}

export default Page