import { db } from '@/server/db'
import { tblRestaurant } from '@/server/db/schema/restaurant'
import { jwtEntities } from '@/server/layer/entities/jwt'
import { restaurantEntities } from '@/server/layer/entities/restaurant'
import { eq } from 'drizzle-orm'
import React from 'react'
import { TagsPage } from './tags-page'

type Props = {}

const Page = async (props: Props) => {


    return (
        <TagsPage/>
    )
}

export default Page