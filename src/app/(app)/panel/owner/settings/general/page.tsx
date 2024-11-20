import { db } from '@/server/db'
import { GeneralSettings } from './general-setting'
import { restaurantEntities } from '@/server/layer/entities/restaurant'
import { jwtEntities } from '@/server/layer/entities/jwt'
import { eq } from 'drizzle-orm'
import { tblRestaurant } from '@/server/db/schema/restaurant'
import MaxWidthWrapper from '@/components/layout/max-width-wrapper'

type Props = {}

const Page = async (props: Props) => {

  

    return (
        <GeneralSettings/>
    )
}


export default Page