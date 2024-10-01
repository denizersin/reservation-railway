import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

import { labels, priorities, statuses } from './data'


// data
// {
//     id: 23,
//     location: {
//       area: "Outdoor Patio",
//       tableNo: 4
//     },
//     time: '18:00',
//     guests: 3,
//     guestInfo: {
//       fullName: 'Olivia Arellano',
//       phone: '5432109876',
//       note: 'Nut allergy',
//       tag: 'Birthday',
//       reservationCount: 2
//     },
//     assignedPerson: "Personel3",
//     status: "draft",
//     registeredAt: '2021-09-22T16:15:00',
//     registeredBy: 'Personel1',
//     isGuestHere: false
//   }


export const reservationColumns: ColumnDef<any>[] = [


  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id:"area",
    accessorKey: 'area',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='area' />
    ),
    cell: ({ row }) => {
        const area=row.original?.location?.area
        const tabeNumber=row?.original?.location?.tableNo

      return (
        <div className=''>
            <div>{area}</div>
            <div className="text-gray-500">{tabeNumber}</div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },




  {
    accessorKey: 'time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Saat' />
    ),
    cell: ({ row }) => <div>{row.getValue('time')}</div>,
  },
  {
    accessorKey: 'guests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Misafir' />
    ),
    cell: ({ row }) => <div>{row.getValue('guests')}</div>,
  },






  {
    accessorKey: 'guestInfo.fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ad Soyad' />
    ),
    cell: ({ row }) => {
      const fullName = row.original.guestInfo.fullName
      const phone = row.original.guestInfo.phone
      const tableNo = row.original.location.tableNo
      return (
        <div>
          <div>{fullName}</div>
          <div className="text-gray-500">{phone}</div>
          <div className="text-gray-500">A-{tableNo}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'registeredAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Kayıt Zamanı' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('registeredAt'))
      return <div>{date.toLocaleString('tr-TR')}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },


]
