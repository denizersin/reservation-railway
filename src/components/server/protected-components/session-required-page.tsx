import { jwtEntities } from '@/server/layer/entities/jwt';
import { redirect } from 'next/navigation';

export default async function SessionRequiredPage({ children }: {
    children: React.ReactElement
}): Promise<React.ReactElement> {

    const session = await jwtEntities.getServerSession();

    if (!session) {
        redirect('/auth/login');
    }

    return children;
}