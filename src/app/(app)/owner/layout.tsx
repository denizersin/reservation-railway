
import RoleRequiredPage from "@/components/server/protected-components/role-required-page";
import { EnumUserRole } from "@/shared/enums/predefined-enums";
import OwnerLayout from "./owner-layout";

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {



    return (
        <RoleRequiredPage
            roles={[EnumUserRole.owner, EnumUserRole.admin]}
            redirectPath="/">
            <OwnerLayout>
                {children}
            </OwnerLayout>
        </RoleRequiredPage>

    );
}
