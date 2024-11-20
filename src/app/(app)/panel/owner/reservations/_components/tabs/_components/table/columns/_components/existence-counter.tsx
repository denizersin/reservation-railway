import useRealTimeCounter, { CounterOptions } from '@/hooks/useTimeCounter'
import { Clock } from 'lucide-react'
import React from 'react'


export const ExistenceCounter = (props: {
    countOptions: CounterOptions
}) => {

    const count = useRealTimeCounter(props.countOptions)

    return (
        <div className=' flex gap-x-2 items-center'>
            <div>
            {count} min
            </div>
            <Clock className='size-4'/>

        </div>
    )
}