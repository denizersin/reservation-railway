import React from 'react'
import MainCards from './_components/main-cards'
import ListExample from './_components/list-example'
import GuestsList from './_components/guests-list'

type Props = {}

const page = (props: Props) => {
    return (
        <div>
            <MainCards/>
            {/* <ListExample/> */}
            <GuestsList />
        </div>
    )
}

export default page