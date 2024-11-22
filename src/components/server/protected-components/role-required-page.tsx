import { jwtEntities } from '@/server/layer/entities/jwt';
import { EnumUserRole, TEnumUserRole } from '@/shared/enums/predefined-enums';
import { redirect } from 'next/navigation';

export default async function RoleRequiredPage({
    children,
    roles,
    redirectPath
}: {
    children: React.ReactElement,
    roles: EnumUserRole[],
    redirectPath: string
}): Promise<React.ReactElement> {

    const session = await jwtEntities.getServerSession();

    console.log('session321', session)


    if (!session || !roles.includes(session.user.userRole)) {
        redirect(redirectPath);
    }

    return children;
}