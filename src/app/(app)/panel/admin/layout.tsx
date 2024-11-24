
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import Sidebar from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Search } from "@/components/search";
import RoleRequiredPage from "@/components/server/protected-components/role-required-page";
import ThemeSwitch from "@/components/theme-switch";
import { UserNav } from "@/components/user-nav";
import { adminSidelinks } from "@/data/admin-side-links";
import { ownerSidelinks } from "@/data/owner-side-links";
import { EnumUserRole } from "@/shared/enums/predefined-enums";

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {

    // void api.post.getLatest.prefetch();



    return (
        <RoleRequiredPage
            roles={[EnumUserRole.admin]}
            redirectPath="/">
            <div className='relative h-full overflow-hidden bg-background flex'>
                <Sidebar
                    sidelinks={adminSidelinks}
                />
                <MaxWidthWrapper className="max-w-screen-2xl md:px-10 main h-screen overflow-y-scroll flex-1">
                    <div className="flex py-8">
                        {/* <TopNav links={topNav} /> */}
                        <div className='ml-auto flex items-center space-x-4'>
                            {/* <Search /> */}
                            <ThemeSwitch />
                            <UserNav />
                        </div>
                    </div>
                    {children}
                </MaxWidthWrapper>
            </div>
        </RoleRequiredPage>

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
