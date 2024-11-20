import { EnumReservationStatus } from '@/shared/enums/predefined-enums';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons'
import { IconCalendarPlus, IconCashRegister, IconChecks, IconCircleCheck, IconCircleCheckFilled, IconCircleXFilled, IconCopyCheckFilled, IconHelpHexagonFilled } from '@tabler/icons-react';

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]



export const statuses = [
  // {
  //   value: EnumReservationStatus.draft,
  //   label: 'Draft',
  //   icon: QuestionMarkCircledIcon,
  // },
  {
    value: EnumReservationStatus.reservation,
    label: 'Reservation',
    icon: IconCalendarPlus,
    renderIcon: () => <IconCalendarPlus className='w-4 h-4 text-primary' />
  },
  {
    value: EnumReservationStatus.prepayment,
    label: 'Prepayment',
    icon: IconCashRegister,
    renderIcon: () => <IconCashRegister className='w-4 h-4 text-primary' />
  },

  {
    value: EnumReservationStatus.confirmed,
    label: 'Confirmed',
    icon: IconCircleCheckFilled,
    renderIcon: () => <IconCircleCheckFilled className='w-4 h-4 text-primary' />
  },
  {
    value: EnumReservationStatus.cancel,
    label: 'Cancel',
    icon: IconCircleXFilled,
    renderIcon: () => <IconCircleXFilled className='w-4 h-4  text-destructive' />
  },
  {
    value: EnumReservationStatus.confirmation,
    label: 'Confirmation',
    icon: IconHelpHexagonFilled,
    renderIcon: () => <IconHelpHexagonFilled className='w-4 h-4 text-primary' />
  },
  {
    value: EnumReservationStatus.completed,
    label: 'Completed',
    icon: IconCopyCheckFilled,
    renderIcon: () => <IconCopyCheckFilled className='w-4 h-4 text-primary' />
  },
];
export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: ArrowDownIcon,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: ArrowRightIcon,
  },
  {
    label: 'High',
    value: 'high',
    icon: ArrowUpIcon,
  },
]


export const DATA = [
  {
    id: 1,
    location: {
      area: "Main Table",
      tableNo: 3
    },
    time: '20:00',
    guests: 4,
    guestInfo: {
      fullName: 'John Doe',
      phone: '1234567890',
      note: 'Shellfish allergy for one guest',
      tag: 'Anniversary',
      reservationCount: 2
    },
    assignedPerson: "Personel1",
    status: "draft",
    registeredAt: '2021-09-01T20:00:00',
    registeredBy: 'Personel2',
    isGuestHere: false
  },
  {
    id: 2,
    location: {
      area: "Outdoor Patio",
      tableNo: 7
    },
    time: '18:30',
    guests: 2,
    guestInfo: {
      fullName: 'Jane Smith',
      phone: '0987654321',
      note: 'Vegetarian',
      tag: 'Birthday',
      reservationCount: 1
    },
    assignedPerson: "Personel3",
    status: "reservation",
    registeredAt: '2021-09-02T15:30:00',
    registeredBy: 'Personel1',
    isGuestHere: true
  },
  {
    id: 3,
    location: {
      area: "Main Table",
      tableNo: 12
    },
    time: '19:45',
    guests: 6,
    guestInfo: {
      fullName: 'Michael Johnson',
      phone: '5555555555',
      note: 'High chair needed',
      tag: 'Family Dinner',
      reservationCount: 3
    },
    assignedPerson: "Personel2",
    status: "cancel",
    registeredAt: '2021-09-03T12:00:00',
    registeredBy: 'Personel3',
    isGuestHere: false
  },
  {
    id: 4,
    location: {
      area: "Bar Area",
      tableNo: 1
    },
    time: '21:15',
    guests: 2,
    guestInfo: {
      fullName: 'Emily Davis',
      phone: '1112223333',
      note: 'Gluten-free',
      tag: 'Business Lunch',
      reservationCount: 1
    },
    assignedPerson: "Personel1",
    status: "reservation",
    registeredAt: '2021-09-04T09:45:00',
    registeredBy: 'Personel2',
    isGuestHere: true
  },
  {
    id: 5,
    location: {
      area: "Outdoor Patio",
      tableNo: 5
    },
    time: '17:30',
    guests: 3,
    guestInfo: {
      fullName: 'David Lee',
      phone: '4447778888',
      note: 'Nut allergy',
      tag: 'Anniversary',
      reservationCount: 2
    },
    assignedPerson: "Personel3",
    status: "draft",
    registeredAt: '2021-09-05T14:00:00',
    registeredBy: 'Personel1',
    isGuestHere: false
  },
  {
    id: 6,
    location: {
      area: "Main Table",
      tableNo: 9
    },
    time: '19:00',
    guests: 4,
    guestInfo: {
      fullName: 'Sarah Thompson',
      phone: '2223334444',
      note: 'Vegan',
      tag: 'Birthday',
      reservationCount: 1
    },
    assignedPerson: "Personel2",
    status: "reservation",
    registeredAt: '2021-09-06T11:30:00',
    registeredBy: 'Personel3',
    isGuestHere: true
  },
  {
    id: 7,
    location: {
      area: "Bar Area",
      tableNo: 2
    },
    time: '20:30',
    guests: 2,
    guestInfo: {
      fullName: 'Robert Wilson',
      phone: '5556667777',
      note: 'Dairy allergy',
      tag: 'Business Dinner',
      reservationCount: 3
    },
    assignedPerson: "Personel1",
    status: "cancel",
    registeredAt: '2021-09-07T16:15:00',
    registeredBy: 'Personel2',
    isGuestHere: false
  },
  {
    id: 8,
    location: {
      area: "Outdoor Patio",
      tableNo: 11
    },
    time: '18:00',
    guests: 6,
    guestInfo: {
      fullName: 'Jessica Brown',
      phone: '8889990000',
      note: 'High chair needed',
      tag: 'Family Dinner',
      reservationCount: 2
    },
    assignedPerson: "Personel3",
    status: "reservation",
    registeredAt: '2021-09-08T13:30:00',
    registeredBy: 'Personel1',
    isGuestHere: true
  },
  {
    id: 9,
    location: {
      area: "Main Table",
      tableNo: 6
    },
    time: '19:30',
    guests: 3,
    guestInfo: {
      fullName: 'William Chen',
      phone: '1234098765',
      note: 'Peanut allergy',
      tag: 'Birthday',
      reservationCount: 1
    },
    assignedPerson: "Personel2",
    status: "draft",
    registeredAt: '2021-09-09T10:00:00',
    registeredBy: 'Personel3',
    isGuestHere: false
  },
  {
    id: 10,
    location: {
      area: "Bar Area",
      tableNo: 4
    },
    time: '21:00',
    guests: 2,
    guestInfo: {
      fullName: 'Olivia Martinez',
      phone: '5678901234',
      note: 'Gluten-free',
      tag: 'Business Lunch',
      reservationCount: 2
    },
    assignedPerson: "Personel1",
    status: "reservation",
    registeredAt: '2021-09-10T15:00:00',
    registeredBy: 'Personel2',
    isGuestHere: true
  },
  {
    id: 11,
    location: {
      area: "Outdoor Patio",
      tableNo: 8
    },
    time: '17:00',
    guests: 4,
    guestInfo: {
      fullName: 'Ethan Rodriguez',
      phone: '9012345678',
      note: 'Vegetarian',
      tag: 'Anniversary',
      reservationCount: 1
    },
    assignedPerson: "Personel3",
    status: "draft",
    registeredAt: '2021-09-11T12:30:00',
    registeredBy: 'Personel1',
    isGuestHere: false
  },
  {
    id: 12,
    location: {
      area: "Main Table",
      tableNo: 15
    },
    time: '19:15',
    guests: 6,
    guestInfo: {
      fullName: 'Sophia Hernandez',
      phone: '3456789012',
      note: 'Nut allergy',
      tag: 'Family Dinner',
      reservationCount: 3
    },
    assignedPerson: "Personel2",
    status: "cancel",
    registeredAt: '2021-09-12T09:45:00',
    registeredBy: 'Personel3',
    isGuestHere: false
  },
  {
    id: 13,
    location: {
      area: "Bar Area",
      tableNo: 3
    },
    time: '20:45',
    guests: 2,
    guestInfo: {
      fullName: 'Lucas Gonzalez',
      phone: '6789012345',
      note: 'Dairy allergy',
      tag: 'Business Dinner',
      reservationCount: 1
    },
    assignedPerson: "Personel1",
    status: "reservation",
    registeredAt: '2021-09-13T14:00:00',
    registeredBy: 'Personel2',
    isGuestHere: true
  },
  {
    id: 14,
    location: {
      area: "Outdoor Patio",
      tableNo: 13
    },
    time: '17:45',
    guests: 3,
    guestInfo: {
      fullName: 'Isabella Ramirez',
      phone: '0123456789',
      note: 'Vegan',
      tag: 'Birthday',
      reservationCount: 2
    },
    assignedPerson: "Personel3",
    status: "draft",
    registeredAt: '2021-09-14T11:30:00',
    registeredBy: 'Personel1',
    isGuestHere: false
  },
  {
    id: 15,
    location: {
      area: "Main Table",
      tableNo: 2
    },
    time: '18:30',
    guests: 4,
    guestInfo: {
      fullName: 'Alexander Diaz',
      phone: '9876543210',
      note: 'Shellfish allergy',
      tag: 'Anniversary',
      reservationCount: 1
    },
    assignedPerson: "Personel2",
    status: "reservation",
    registeredAt: '2021-09-15T16:15:00',
    registeredBy: 'Personel3',
    isGuestHere: true
  },
  {
    id: 16,
    location: {
      area: "Bar Area",
      tableNo: 7
    },
    time: '20:00',
    guests: 2,
    guestInfo: {
      fullName: 'Mia Sanchez',
      phone: '7890123456',
      note: 'Gluten-free',
      tag: 'Business Lunch',
      reservationCount: 3
    },
    assignedPerson: "Personel1",
    status: "cancel",
    registeredAt: '2021-09-16T13:30:00',
    registeredBy: 'Personel2',
    isGuestHere: false
  },
  {
    id: 17,
    location: {
      area: "Outdoor Patio",
      tableNo: 10
    },
    time: '19:00',
    guests: 6,
    guestInfo: {
      fullName: 'Daniel Fernandez',
      phone: '2109876543',
      note: 'High chair needed',
      tag: 'Family Dinner',
      reservationCount: 2
    },
    assignedPerson: "Personel3",
    status: "reservation",
    registeredAt: '2021-09-17T10:00:00',
    registeredBy: 'Personel1',
    isGuestHere: true
  },
  {
    id: 18,
    location: {
      area: "Main Table",
      tableNo: 1
    },
    time: '19:45',
    guests: 3,
    guestInfo: {
      fullName: 'Avery Morales',
      phone: '6543210987',
      note: 'Peanut allergy',
      tag: 'Birthday',
      reservationCount: 1
    },
    assignedPerson: "Personel2",
    status: "draft",
    registeredAt: '2021-09-18T15:00:00',
    registeredBy: 'Personel3',
    isGuestHere: false
  },
  {
    id: 19,
    location: {
      area: "Bar Area",
      tableNo: 5
    },
    time: '21:15',
    guests: 2,
    guestInfo: {
      fullName: 'Emma Reyes',
      phone: '0987654321',
      note: 'Vegetarian',
      tag: 'Business Dinner',
      reservationCount: 2
    },
    assignedPerson: "Personel1",
    status: "reservation",
    registeredAt: '2021-09-19T12:30:00',
    registeredBy: 'Personel2',
    isGuestHere: true
  },
  {
    id: 20,
    location: {
      area: "Outdoor Patio",
      tableNo: 14
    },
    time: '17:30',
    guests: 4,
    guestInfo: {
      fullName: 'Noah Castillo',
      phone: '1098765432',
      note: 'Dairy allergy',
      tag: 'Anniversary',
      reservationCount: 1
    },
    assignedPerson: "Personel3",
    status: "draft",
    registeredAt: '2021-09-20T09:45:00',
    registeredBy: 'Personel1',
    isGuestHere: false
  },
  {
    id: 21,
    location: {
      area: "Main Table",
      tableNo: 11
    },
    time: '19:30',
    guests: 6,
    guestInfo: {
      fullName: 'Isabela Jimenez',
      phone: '3210987654',
      note: 'Vegan',
      tag: 'Family Dinner',
      reservationCount: 3
    },
    assignedPerson: "Personel2",
    status: "cancel",
    registeredAt: '2021-09-21T14:00:00',
    registeredBy: 'Personel3',
    isGuestHere: false
  },
  {
    id: 22,
    location: {
      area: "Bar Area",
      tableNo: 8
    },
    time: '20:30',
    guests: 2,
    guestInfo: {
      fullName: 'Liam Ortiz',
      phone: '7654321098',
      note: 'Gluten-free',
      tag: 'Business Lunch',
      reservationCount: 1
    },
    assignedPerson: "Personel1",
    status: "reservation",
    registeredAt: '2021-09-22T11:30:00',
    registeredBy: 'Personel2',
    isGuestHere: true
  },
  {
    id: 23,
    location: {
      area: "Outdoor Patio",
      tableNo: 4
    },
    time: '18:00',
    guests: 3,
    guestInfo: {
      fullName: 'Olivia Arellano',
      phone: '5432109876',
      note: 'Nut allergy',
      tag: 'Birthday',
      reservationCount: 2
    },
    assignedPerson: "Personel3",
    status: "draft",
    registeredAt: '2021-09-22T16:15:00',
    registeredBy: 'Personel1',
    isGuestHere: false
  }
]