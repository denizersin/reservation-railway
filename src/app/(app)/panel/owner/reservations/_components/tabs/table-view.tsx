import React from 'react'
import TableViewCards from './_components/table-view-cards'
import TablesView from './_components/tables/tables'

type Props = {}

export const TableView = (props: Props) => {
    return (
        <div className=''>
            <TableViewCards/>
            <TablesView/>
        </div>
    )
}

export default TableView