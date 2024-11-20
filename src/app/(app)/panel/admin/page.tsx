import RoleRequiredPage from "@/components/server/protected-components/role-required-page"
import { EnumUserRole } from "@/shared/enums/predefined-enums"
import { Suspense } from "react"

type Props = {}

const Page = (props: Props) => {
    return (
        <div className='text-4xl text-red-400 h-[200vh]'>
            Admin Page
        </div>
    )
}


export default Page