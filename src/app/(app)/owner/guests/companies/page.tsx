import { api } from '@/server/trpc/react'
import TGuestValidator, { guestValidator } from '@/shared/validators/guest'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { GuestCompaniesList } from './_components./guest-companies-list'

type Props = {}

const Page = (props: Props) => {







    return (
        <div>
            <h1>Guest Companies</h1>
            <GuestCompaniesList />
        </div>
    )
}

export default Page