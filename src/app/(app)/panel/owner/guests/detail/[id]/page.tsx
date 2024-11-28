'use client'

import { api } from '@/server/trpc/react'
import { useParams } from 'next/navigation'
import React from 'react'
import { GuestGeneralInformation } from './_components/guest-general-information'
import GuestReservations from './_components/guest-reservations'

type Props = {}

const Page = (props: Props) => {
  const { id } = useParams()
  const guestId = Number(id)

  const { data: guestDetail, isLoading } = api.guest.getGuestDetail.useQuery({ guestId })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!guestDetail) {
    return <div>Guest not found</div>
  }

  return (
    <div className="space-y-4">
      <GuestGeneralInformation guestDetail={guestDetail} />
      <GuestReservations guestDetail={guestDetail} />
    </div>
  )
}

export default Page