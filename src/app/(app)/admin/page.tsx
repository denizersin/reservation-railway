import RoleRequiredComponent from '@/app/ProtectedComponents/RoleRequiredComponent'
import { EnumUserRole } from '@/server/db/schema/user'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
    return (
        <RoleRequiredComponent
            requiredRole={EnumUserRole.admin}
        >
            <div className='text-4xl text-red-400'>
                Admin Page
            </div>
        </RoleRequiredComponent>
    )
}


export default Page