import React from 'react'
import { ListViewCards } from './_components/list-view-cards'
import { DataTable } from './_components/table/data-table'
import { DATA } from './_components/table/data'
import { reservationColumns } from './_components/table/columns'

type Props = {}

const ListView = (props: Props) => {



    return (<div className='mb-10'>
        <ListViewCards />
        <DataTable data={DATA} columns={reservationColumns}/>
    </div>
    )
}

export default ListView