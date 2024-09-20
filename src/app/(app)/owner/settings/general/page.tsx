import { db } from '@/server/db'
import { GeneralSettings } from './general-setting'
import { restaurantEntities } from '@/server/layer/entities/restaurant'
import { jwtEntities } from '@/server/layer/entities/jwt'
import { eq } from 'drizzle-orm'
import { tblRestaurant } from '@/server/db/schema/restaurant'
import MaxWidthWrapper from '@/components/layout/max-width-wrapper'

type Props = {}

const Page = async (props: Props) => {

    const session = (await jwtEntities.getServerSession())!

    const currentRestaurant = (await db.query.tblRestaurant.findFirst({
        where: eq(tblRestaurant.ownerId, session.user.userId)
    }))!


    const meals = await db.query.tblMeal.findMany()
    const countries = await db.query.tblCountry.findMany()
    const restauratnLanguages = await restaurantEntities.getRestaurantLanguages(({ restaurantId: currentRestaurant.id }))
    const reservationStatues = await db.query.tblReserVationStatus.findMany()

    console.log(
        reservationStatues,'reservationStatues',
    )

    return (
        <MaxWidthWrapper>
            <GeneralSettings
                meals={meals}
                countries={countries}
                restaurantLanguages={restauratnLanguages}
                reservationStatues={reservationStatues}
            />
        </MaxWidthWrapper>

    )
}


export default Page