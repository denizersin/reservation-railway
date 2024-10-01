"use client";
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCheck, IconEyeX, IconUsersGroup, IconX } from '@tabler/icons-react';
import GuestsModal from './guests-modal';
import ConfirmationsModal from './confirmations-modal';

type Props = {}

export const ListViewCards = (props: Props) => {

    const [isGuestsModalOpen, setIsGuestsModalOpen] = useState(false)
    const [isConfitmationsMdaolOpen, setIsConfitmationsMdaolOpen] = useState(false)

    const toggleGuestsModal = () => {
        console.log('asd')
        setIsGuestsModalOpen(!isGuestsModalOpen)
    }

    const toggleConfitmationsMdaol = () => {
        setIsConfitmationsMdaolOpen(!isConfitmationsMdaolOpen)
    }


    return (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card
                onClick={toggleGuestsModal}
                className='hover:bg-card-foreground/5 cursor-pointer'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                    <CardTitle className='text-sm font-medium'>
                        Misafir
                    </CardTitle>
                    <IconUsersGroup className='text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>38</div>
                    <p className='text-xs text-muted-foreground'>
                        38 adet rezervasyon
                    </p>
                </CardContent>
            </Card>
            <Card
                onClick={toggleConfitmationsMdaol}
            className='hover:bg-card-foreground/5 cursor-pointer'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                    <CardTitle className='text-sm font-medium'>
                        Konfirme
                    </CardTitle>
                    <IconCheck className='text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>38</div>
                    <p className='text-xs text-muted-foreground'>
                        Konfirm edilen rezervasyon
                    </p>
                </CardContent>
            </Card>
            <Card className='hover:bg-card-foreground/5 cursor-pointer'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                    <CardTitle className='text-sm font-medium'>No Show</CardTitle>
                    <IconEyeX className='text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>10</div>
                    <p className='text-xs text-muted-foreground'>
                        No Show Masa durumu
                    </p>
                </CardContent>
            </Card>
            <Card className='hover:bg-card-foreground/5 cursor-pointer'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
                    <CardTitle className='text-sm font-medium'>
                        Iptal
                    </CardTitle>
                    <IconX className='text-muted-foreground' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>3</div>
                    <p className='text-xs text-muted-foreground'>
                        İptal edilen rezervasyon
                    </p>
                </CardContent>
            </Card>


            <GuestsModal open={isGuestsModalOpen} toggleDialog={toggleGuestsModal} />
            <ConfirmationsModal open={isConfitmationsMdaolOpen} toggleDialog={toggleConfitmationsMdaol} />
        </div>
    )
}