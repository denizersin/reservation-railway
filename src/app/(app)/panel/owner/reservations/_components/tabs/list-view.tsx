'use client'
import { ListViewCards } from './_components/list-view-cards'
import { ReservationDataTable } from './_components/table/data-table'

type Props = {}



const ListView = (props: Props) => {

    console.log('LISTT')

    return (<div className='mb-10'>
        <ListViewCards />
        <ReservationDataTable/>
    </div>
    )
}

export default ListView