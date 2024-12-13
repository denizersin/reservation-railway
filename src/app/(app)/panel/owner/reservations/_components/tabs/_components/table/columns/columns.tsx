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
import { EnumPrepaymentStatus, EnumReservationExistanceStatus } from '@/shared/enums/predefined-enums'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRightFromLine, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { existenceStatuses, statuses } from '../data'
import { ReservationStatusModal } from '../status-modal/reservation-status-modal'
import { ExistenceCounter } from './_components/existence-counter'
import { ReservationGridStatusModal } from './reservation-grid-status-modal'
import { ReservationNoteModal } from './reservation-note-modal'
import { Badge } from '@/components/ui/badge'
import { IconCashRegister, IconClipboardText } from '@tabler/icons-react'
import { UpdateReservationTimeModal } from './update-reservation-time-modal'
import { UpdateGuestCountModal } from './update-guest-count-modal'


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
            className='flex flex-col w-[100px] items-center cursor-pointer'
          >

            {
              status.icon && <div className='p-1'>
                <status.icon className='size-12 text-primary/80' />

              </div>
            }
            <span className='text-sm text-primary/70'>{status.label}</span>
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
      return value.includes(row.original.reservationStatus.status)
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
    accessorKey: 'existence',
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

      const existenceStatus = existenceStatuses.find(s => s.value === reservation.reservationExistenceStatus.status)!

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
          <div className='flex items-center gap-x-1'>
            <existenceStatus.icon className='size-4' />
            {existenceStatus?.label}
          </div>

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
    filterFn: (row, id, value) => {
      return value.includes(row.original.reservationExistenceStatus.status)
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
        {<UpdateReservationTimeModal
          reservation={row.original}
          isOpen={isOpen}
          setOpen={setIsOpen}
          key={isOpen.toString()}

        />}
      </div>
    },

  },
  {
    accessorKey: 'guestCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Guest' />
    ),
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false)

      return (
        <div>
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer hover:bg-accent p-2 rounded-md"
          >
            {row.original.guestCount}
          </div>

          <UpdateGuestCountModal
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
    accessorKey: 'guests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name Surname' />
    ),
    cell: ({ row }) => {

      const [isOpen, setIsOpen] = useState(false)

      return <div
      >
        <div
          onClick={() => setIsOpen(true)}

        >
          <div>
            {row.original.guest.name} {row.original.guest.surname}
          </div>
          <div>
            {row.original.guest.company?.companyName}
          </div>
          {row.original.guestNote && <div className='flex gap-1 '>
            <IconClipboardText stroke={2} className=' size-4 text-black' />
            <div className='text-xs font-bold'>

              {row.original.guestNote}
            </div>
          </div>}
          <div className='flex gap-1'>
            <div>
              {/* {row.original.guest.country?.name} */}
            </div>
            <div className='flex gap-1 items-center  '>
              <span className='text-xs max-w-[100px]  truncate'>
                {row.original.guest.phoneCodeCountry.name}
              </span>
              <span className='text-sm'>
                ({row.original.guest.phoneCodeCountry.phoneCode})
              </span>
            </div>
            <div>
              {row.original.guest.phone}
            </div>
          </div>
          <div className='flex gap-1 flex-col'>
            {row.original.tags.map(t => <div>
              <Badge className={cn('text-white ', {
                [`bg-${t.tag.color}`]: t.tag.color
              })}>
                {t.tag.translations?.[0]?.name}
              </Badge>
            </div>)}
          </div>
        </div>

        <ReservationNoteModal
          reservation={row.original}
          isOpen={isOpen}
          setOpen={setIsOpen}
        />
      </div>
    },
  },

  {
    id: 'guest-status',
    cell: ({ row }) => {
      const reservation = row.original

      const badgeContent = reservation.guestReservationCount > 1 ? `${reservation.guestReservationCount}` : 'First Reservation'
      return <div className='w-full flex justify-center'>
        <Badge className='text-xs'>{badgeContent}</Badge>
      </div>
    },
  },
  {
    id: 'is-vip',
    cell: ({ row }) => {
      const reservation = row.original
      return <div className='w-full flex justify-center'>
        {reservation?.guest.isVip && <Badge className='text-xs bg-orange-600 text-white'>VIP</Badge>}
      </div>
    },
  },
  {
    accessorKey: 'prepaymentStatus',
    header: "",
    cell: ({ row }) => {
      const isWaitingPrepayment = row.original.currentPrepayment?.status === EnumPrepaymentStatus.pending
      const isPrepaymentCompleted = row.original.currentPrepayment?.status === EnumPrepaymentStatus.success

      const hasPrepayment = Boolean(row.original.currentPrepayment)
      return <div className='flex justify-center'>

        {hasPrepayment && <IconCashRegister className={cn('size-8', {
          'text-muted-foreground': isWaitingPrepayment,
          'text-green-700': isPrepaymentCompleted
        })} />}

      </div>
    },
  },
  {
    id: 'createdAt',
    cell: ({ row }) => {

      const created = row.original.isCreatedByOwner ? 'Owner' : 'System'

      return <div>
        <div>
          {created}
        </div>
        <div>{row.original.createdAt.toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', weekday: 'long' })}</div>

      </div>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },





]
