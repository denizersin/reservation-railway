
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Sidebar from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Search } from "@/components/search";
import ThemeSwitch from "@/components/theme-switch";
import { UserNav } from "@/components/user-nav";
import { ownerSidelinks } from "@/data/owner-side-links";
import { db } from '@/server/db';
import { tblRestaurant } from '@/server/db/schema/restaurant';
import { jwtEntities } from '@/server/layer/entities/jwt';
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { restaurantEntities } from '@/server/layer/entities/restaurant';
import { eq } from 'drizzle-orm';
import { SettingDataProvider } from "./settings/setting-data-provider";
import LanguageDropDown from "@/components/language-drop-down";

export default async function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {

    // void api.post.getLatest.prefetch();

    const session = (await jwtEntities.getServerSession())!

    console.log(session,'sessoin123')

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
                <MaxWidthWrapper className="max-w-screen-2xl md:px-10 main h-screen overflow-y-scroll flex-1">
                    <div className="flex pt-5 pb-2">
                        {/* <TopNav links={topNav} /> */}

                        <div className='ml-auto flex items-center space-x-4'>
                            {/* <Search /> */}
                            <ThemeSwitch />
                            <LanguageDropDown/>
                            <UserNav />
                        </div>
                    </div>
                    {children}
                </MaxWidthWrapper>
            </div>
        </SettingDataProvider>

    );
}

const topNav = [
    {
        title: 'Overview',
        href: 'dashboard/overview',
        isActive: true,
    },
    {
        title: 'Customers',
        href: 'dashboard/customers',
        isActive: false,
    },
    {
        title: 'Products',
        href: 'dashboard/products',
        isActive: false,
    },
    {
        title: 'Settings',
        href: 'dashboard/settings',
        isActive: false,
    },
]