import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../data-table-column-header'
import { DataTableRowActions } from '../data-table-row-actions'

import { labels, priorities, statuses } from '../data'
import { TReservationRow } from '@/lib/reservation'
import { ReservationGridStatusModal } from './reservation-grid-status-modal'
import { useEffect, useState } from 'react'
import { UpdateReservationTmeModal } from './update-reservation-time-modal'
import { ReservationStatusModal } from '../status-modal/reservation-status-modal'
import useRealTimeCounter, { CounterOptions } from '@/hooks/useTimeCounter'
import { ExistenceCounter } from './_components/existence-counter'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { api } from '@/server/trpc/react'
import { getQueryKey } from '@trpc/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'


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


export const reservationColumns: ColumnDef<TReservationRow>[] = [


  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.original.reservationStatus.status
      )

      const [isOpen, setIsOpen] = useState(false)

      if (!status) {
        return null
      }

      return (
        <div className=''
        >
          <div
            onClick={() => setIsOpen(true)}
            className='flex w-[100px] items-center cursor-pointer'
          >

            {status.icon && (
              <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
            )}
            <span>{status.label}</span>
          </div>

          <ReservationStatusModal
            isOpen={isOpen}
            setOpen={setIsOpen}
            reservation={row.original}
          />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "area",
    accessorKey: 'area',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='area' />
    ),
    cell: ({ row }) => {

      const area = row.original.room.translations[0]?.name
      const tables = row.original.tables.map(t => t.table.no).join(', ')

      const [isOpen, setIsOpen] = useState(false)

      return (
        <div

          className=''>
          <div
            onClick={() => {
              setIsOpen(true)
            }}
          >

            <div>{area}</div>
            <div className="text-gray-500">{tables}</div>
          </div>

          {<ReservationGridStatusModal
            isOpen={isOpen}
            setOpen={setIsOpen}
            reservation={row.original}
            key={isOpen?.toString()}
          />}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    id: 'exsitence',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mevcudiyet' />
    ),
    cell: ({ row }) => {

      const reservation = row.original
      const queryClient = useQueryClient()

      const [isOpen, setIsOpen] = useState(false)

      const [countOptions, setCountOptions] = useState<CounterOptions | undefined>()


      const waitingTables = row.original.waitingSession.tables.map(t => t.table.no).join(', ')

      const [isSurpassedTime, setIsSurpassedTime] = useState(false)

      const isInWaiting = reservation.waitingSession.isinWaiting

      useEffect(() => {

        if (reservation.isCheckedin && reservation.waitingSession.isinWaiting && reservation.waitingSession.enteredAt) {
          const enteredAt = reservation.waitingSession.enteredAt
          const currentTime = new Date()
          const diff = currentTime.getTime() - new Date(enteredAt).getTime()
          const diffInMinutes = Math.round(diff / 1000 / 60)

          if (diffInMinutes >= 1) {
            setIsSurpassedTime(true)
          }

          setCountOptions({
            initialCount: diffInMinutes,
            interval: 60000,
            // targetCount
          })
        }

        if (!isInWaiting) {
          setCountOptions(undefined)
        }


      }, [reservation])

      const {
        mutate: takeReservationIn,
        isPending: isTakeReservationInPending,
      } = api.reservation.takeReservationIn.useMutation({
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getReservations),
          })
          queryClient.invalidateQueries({
            queryKey: getQueryKey(api.reservation.getAllAvailableReservation2),
          })
        },
      })

      useShowLoadingModal([isTakeReservationInPending])

      return <div
        className={cn('p-2', {
          // 'cursor-pointer': true,
          'bg-red-300/20 h-full': isSurpassedTime,

        })}
      >
        <div
          onClick={() => {
            setIsOpen(true)
            console.log('click')
          }}
        >

          {row.original.reservationExistenceStatus.status}
          <div>
            {countOptions && <ExistenceCounter countOptions={countOptions} />}
          </div>
          <div>
            {waitingTables}
          </div>



        </div>
        {
          isInWaiting &&
          isSurpassedTime &&
          <div className='flex w-full justify-between mt-2'>
            <Badge variant={'destructive'}>Zaman Aşımı</Badge>

            <Button
              className=' '
              size={'sm'}
              onClick={() => takeReservationIn({ reservationId: reservation.id })}
            >İçeri al</Button>

          </div>
        }

        <ReservationGridStatusModal
          reservation={row.original}
          isOpen={isOpen}
          setOpen={setIsOpen}
        />
      </div>
    },
  },



  {
    accessorKey: 'time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Saat' />
    ),
    cell: ({ row }) => {

      const [isOpen, setIsOpen] = useState(false)

      return <div
      >
        <div
          onClick={() => setIsOpen(true)}>
          {row.original.hour}
        </div>
        <UpdateReservationTmeModal
          reservation={row.original}
          isOpen={isOpen}
          setOpen={setIsOpen}
        />
      </div>
    },

  },
  {
    accessorKey: 'guests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Misafir' />
    ),
    cell: ({ row }) => {

      return <div>
        <div>
          {row.original.guestCount} Kişi
        </div>
        <div>
          {row.original.guest.name}
        </div>
        <div>
          +{row.original.guest.phone}
        </div>
      </div>
    },
  },


  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },


]
