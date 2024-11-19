import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../data-table-column-header'
import { DataTableRowActions } from '../data-table-row-actions'

import { Button } from '@/components/custom/button'
import { useMutationCallback } from '@/hooks/useMutationCallback'
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal'
import { CounterOptions } from '@/hooks/useTimeCounter'
import { TReservationRow } from '@/lib/reservation'
import { cn } from '@/lib/utils'
import { api } from '@/server/trpc/react'
import { EnumReservationExistanceStatus } from '@/shared/enums/predefined-enums'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRightFromLine, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { statuses } from '../data'
import { ReservationStatusModal } from '../status-modal/reservation-status-modal'
import { ExistenceCounter } from './_components/existence-counter'
import { ReservationGridStatusModal } from './reservation-grid-status-modal'
import { UpdateReservationTmeModal } from './update-reservation-time-modal'


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


      const renderIcon = status.renderIcon()

      return (
        <div className=''
        >
          <div
            onClick={() => setIsOpen(true)}
            className='flex w-[100px] items-center cursor-pointer'
          >

            {
              renderIcon && <div className='p-1'>{renderIcon}</div>
            }
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
      <DataTableColumnHeader column={column} title='Area' />
    ),
    cell: ({ row, table, }) => {

      const area = row.original.room.translations[0]?.name
      const tables = row.original.tables.map(t => t.table.no).join(', ')
      const thisReservation = row.original
      const thisReservationId = row.original.id


      const linkedToThisTables = table.getRowModel().rows.map(r => r.original)
        .filter(t => t.id !== thisReservationId && t?.linkedReservationId && t?.linkedReservationId === thisReservationId).map(t => t.tables.map(t => t.table.no).join(', ')).join(', ')

      const isLinkedToOtherTables = Boolean(thisReservation.linkedReservationId)

      const thisLinkedWithOtherTables = table.getRowModel().rows.map(r => r.original)
        .filter(t => t.id !== thisReservationId && t?.id === thisReservation.linkedReservationId).map(t => t.tables.map(t => t.table.no).join(', ')).join(', ')




      const [isOpen, setIsOpen] = useState(false)

      return (
        <div

          className=''>
          <div
            onClick={() => {
              setIsOpen(true)
            }}
          >

            <div>{area} </div>
            <div className="text-gray-500 flex">
              {tables}
              <div>{linkedToThisTables ? `->(${linkedToThisTables})` : ''}</div>
              {isLinkedToOtherTables && <div className="text-gray-500">{'->'}({thisLinkedWithOtherTables})</div>}
            </div>
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
      <DataTableColumnHeader column={column} title='Existence' />
    ),
    cell: ({ row }) => {

      const reservation = row.original
      const queryClient = useQueryClient()

      const [isOpen, setIsOpen] = useState(false)

      const [countOptions, setCountOptions] = useState<CounterOptions | undefined>()
      const [mainTableCountOptions, setmainTableCountOptions] = useState<CounterOptions | undefined>(undefined)

      const waitingTables = row.original.waitingSession.tables.map(t => t.table.no).join(', ')

      const [isSurpassedTime, setIsSurpassedTime] = useState(false)

      const isInWaiting = reservation.waitingSession.isinWaiting
      const isInRestaurant = reservation.reservationExistenceStatus.status === EnumReservationExistanceStatus.inRestaurant

      const isCheckedin = reservation.isCheckedin
      const isCheckedout = Boolean(reservation.checkedoutAt)

      const { onSuccessReservationUpdate } = useMutationCallback()

      useEffect(() => {

        if (reservation.isCheckedin && reservation.waitingSession.isinWaiting && reservation.waitingSession.enteredAt) {
          const enteredAt = reservation.waitingSession.enteredAt
          const currentTime = new Date()
          const diff = currentTime.getTime() - new Date(enteredAt).getTime()
          const diffInMinutes = Math.round(diff / 1000 / 60)

          if (diffInMinutes >= 10) {
            setIsSurpassedTime(true)
          }

          setCountOptions({
            initialCount: diffInMinutes,
            interval: 1000,
            onComplete: () => {
              setIsSurpassedTime(true)
            },
            targetCount: 10
          })
        }

        if (!isInWaiting) {
          setCountOptions(undefined)
        }

        if (isInRestaurant) {
          setmainTableCountOptions({
            interval: 1000,
            initialCount: elapsedTimeOnMainTable,
            targetCount: 50000

          })
        }

        if (isCheckedout && mainTableCountOptions) {
          setmainTableCountOptions(undefined)
        }


      }, [reservation])

      const elapsedTimeOnMainTable = useMemo(() => {
        const enteredMainTableAt = reservation.enteredMainTableAt
        const checkedoutAt = reservation.checkedoutAt

        if (!enteredMainTableAt || !checkedoutAt) {
          return 0
        }

        return Math.round((checkedoutAt.getTime() - enteredMainTableAt.getTime()) / 1000 / 60)
      }, [reservation])

      const {
        mutate: takeReservationIn,
        isPending: isTakeReservationInPending,
      } = api.reservation.takeReservationIn.useMutation({
        onSuccess: () => {
          onSuccessReservationUpdate(reservation.id)
        },
      })

      const {
        mutate: makeReservationNotExist,
        isPending: isMakeReservationNotExistPending,
      } = api.reservation.makeReservationNotExist.useMutation({
        onSuccess: () => {
          onSuccessReservationUpdate(reservation.id)
          setCountOptions(undefined)
          setIsSurpassedTime(false)
        },
      })

      useShowLoadingModal([isTakeReservationInPending, isMakeReservationNotExistPending])

      console.log(mainTableCountOptions, 'mainTableCountOptions')

      return <div
        className={cn('p-2', {
          // 'cursor-pointer': true,
          'bg-red-300/20 h-full': isSurpassedTime && !isInRestaurant,

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
          <div>{waitingTables}</div>

          {mainTableCountOptions && <ExistenceCounter countOptions={mainTableCountOptions} />}
          {isCheckedout && <div>{elapsedTimeOnMainTable} dk</div>}

        </div>
        <div className='flex gap-2 justify-end'>

          {
            isCheckedin && isInWaiting &&
            <Button
              tooltip='içeri al'
              className=' bg-green-500 hover:bg-green-600'
              size={'xs-icon'}
              onClick={() => takeReservationIn({ reservationId: reservation.id })}
            >
              <ArrowRightFromLine className='size-4' />
            </Button>
          }
          {
            isCheckedin && isInRestaurant &&
            <Button

              onClick={() => makeReservationNotExist({ reservationId: reservation.id })}
              size={'xs-icon'}
              tooltip='gelmedi durumuna geri al'>
              <Undo2 className='size-4' />
            </Button>
          }
        </div>



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
      <DataTableColumnHeader column={column} title='Hour' />
    ),
    cell: ({ row }) => {

      const [isOpen, setIsOpen] = useState(false)

      return <div
      >
        <div
          onClick={() => setIsOpen(true)}>
          {row.original.hour}
        </div>
        {<UpdateReservationTmeModal
          reservation={row.original}
          isOpen={isOpen}
          setOpen={setIsOpen}
          key={isOpen.toString()}

        />}
      </div>
    },

  },
  {
    accessorKey: 'guests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Guest' />
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
