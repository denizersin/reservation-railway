
import Sidebar from "@/components/layout/sidebar";
import { ownerSidelinks } from "@/data/owner-side-links";
import { db } from '@/server/db';
import { tblRestaurant } from '@/server/db/schema/restaurant';
import { jwtEntities } from '@/server/layer/entities/jwt';
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { restaurantEntities } from '@/server/layer/entities/restaurant';
import { eq } from 'drizzle-orm';
import { SettingDataProvider } from "./settings/setting-data-provider";

export default async function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {

    // void api.post.getLatest.prefetch();

    const session = (await jwtEntities.getServerSession())!

    const currentRestaurant = (await db.query.tblRestaurant.findFirst({
        where: eq(tblRestaurant.ownerId, session.user.userId)
    }))!


    const meals = await db.query.tblMeal.findMany()
    const countries = await db.query.tblCountry.findMany()
    const restauratnLanguages = await restaurantEntities.getRestaurantLanguages(({ restaurantId: currentRestaurant.id }))
    const reservationStatues = await db.query.tblReserVationStatus.findMany()
    const languages = await predefinedEntities.getLanguages()

    return (
        <SettingDataProvider
            countries={countries}
            meals={meals}
            restaurantLanguages={restauratnLanguages}
            reservationStatues={reservationStatues}
            languages={languages}
        >
            <div className='relative h-full overflow-hidden bg-background flex'>
                <Sidebar
                    sidelinks={ownerSidelinks}
                />
                <div className="main h-screen overflow-y-scroll flex-1 mt-10 px-10">
                    {children}
                </div>
            </div>
        </SettingDataProvider>
    );
}
