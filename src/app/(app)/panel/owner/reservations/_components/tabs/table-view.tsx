import React from 'react'
import TablesView from './_components/tables/tables'
import TableViewCards from './_components/tables/table-view-cards'

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