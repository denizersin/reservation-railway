import { jwtEntities } from '@/server/layer/entities/jwt';
import { EnumUserRole } from '@/shared/enums/predefined-enums';
import { redirect } from 'next/navigation';

export default async function RoleRequiredPage({
    children,
    role,
    redirectPath
}: {
    children: React.ReactElement,
    role: EnumUserRole,
    redirectPath: string
}): Promise<React.ReactElement> {

    const session = await jwtEntities.getServerSession();

    if (!session || session.user.userRole !== role) {
        redirect(redirectPath);
    }

    return children;
}