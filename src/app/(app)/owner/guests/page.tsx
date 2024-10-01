import React from 'react'
import MainCards from './_components/main-cards'
import ListExample from './_components/list-example'

type Props = {}

const page = (props: Props) => {
    return (
        <div>
            <MainCards/>
            <ListExample/>
        </div>
    )
}

export default page