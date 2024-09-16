"use client";
import React, { useState } from 'react'
import { api } from '@/server/trpc/react';
import { UsersDataTable } from './_components/data-table';
import { columns } from './_components/colums';
import { Button } from '@/components/custom/button';
import { UserCurdModal } from './_components/user-crud-modal';



type Props = {}

const Page = (props: Props) => {


    const { data } = api.user.getAllUsers.useQuery({
        limit: 10,
        page: 1
    })

    const users = data?.data || []

    console.log(data, 'data')

    const [isOpenCreateUserModal, setIsOpenCreateUserModal] = useState(false)

    return (
        <div>
            <div className="">
                <Button
                    onClick={() => setIsOpenCreateUserModal(true)}
                >Create user</Button>
            </div>
            <UsersDataTable data={users} columns={columns}/>

            <UserCurdModal isOpen={isOpenCreateUserModal} setOpen={setIsOpenCreateUserModal}/>
        </div>
    )
}

export default Page