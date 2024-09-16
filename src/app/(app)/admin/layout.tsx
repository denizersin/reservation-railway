
import Sidebar from "@/components/layout/sidebar";
import RoleRequiredPage from "@/components/server/protected-components/role-required-page";
import { adminSidelinks } from "@/data/admin-side-links";
import { sidelinks } from "@/data/sidelinks";
import { EnumUserRole } from "@/shared/enums/predefined-enums";

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {

    // void api.post.getLatest.prefetch();




    return (
        <RoleRequiredPage
            role={EnumUserRole.admin}
            redirectPath="/">
            <div className='relative h-full overflow-hidden bg-background flex'>
                <Sidebar
                    sidelinks={adminSidelinks}
                />
                <div className="main h-screen overflow-y-scroll flex-1">
                    {children}
                </div>
            </div>
        </RoleRequiredPage>

    );
}
