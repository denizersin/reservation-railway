'use client'

import { api } from '@/server/trpc/react'
import { useParams } from 'next/navigation'
import React from 'react'


type Props = {}

const Page = (props: Props) => {

    const { id } = useParams()

    const guestId = Number(id)

    const { data: guestDetail, isLoading } = api.guest.getGuestDetail.useQuery({ guestId })

    console.log(guestDetail, 'guestDetail')

    return (
    <div>

        </div>
  )
}

export default Page