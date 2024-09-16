import RoleRequiredComponent from '@/components/ProtectedComponents/RoleRequiredComponent'
import { EnumUserRole } from '@/server/db/schema/user'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
    return (
        <div className='text-4xl text-red-400'>
            Owner Page
        </div>
    )
}


export default Page