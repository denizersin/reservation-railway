import {
    IconCalendarClock,
    IconCalendarWeek,
    IconClock12,
    IconHexagonNumber1,
    IconHexagonNumber2,
    IconHexagonNumber3,
    IconLanguage,
    IconMessageCircle,
    IconSettings,
    IconSquare,
    IconTags,
    IconUsers,
    IconUsersGroup
} from '@tabler/icons-react'
import { SideLink } from './types'


export const ownerSidelinks: SideLink[] = [

    {
        title: 'Reservations',
        label: '',
        href: '/panel/owner/reservations',
        icon: <IconCalendarWeek size={18} />,
    },
    {
        title: 'Waitlist',
        label: '',
        href: '/panel/owner/waitlist',
        icon: <IconCalendarClock  size={18} />
    },
    {
        title: 'Reviews',
        label: '',
        href: '/panel/owner/reviews',
        icon: <IconMessageCircle  size={18} />
    },
    {
        title: 'Guests',
        label: '',
        href: '/panel/owner/guests',
        icon: <IconUsersGroup size={18} />,
    },
    {
        title: 'Settings',
        label: '',
        href: '',
        icon: <IconSettings size={18} />,
        sub: [
            {
                title: 'Rooms',
                label: '',
                href: '/panel/owner/settings/rooms',
                icon: <IconSquare size={18} />,
            },
            {
                title: 'General',
                label: '',
                href: '/panel/owner/settings/general',
                icon: <IconHexagonNumber1 size={18} />,
            },
            {
                title: 'Tags',
                label: '',
                href: '/panel/owner/settings/tags',
                icon: <IconTags size={18} />,
            },
            {
                title: 'Hours',
                label: '',
                href: '/panel/owner/settings/hours',
                icon: <IconClock12 size={18} />,
            },
            {
                title: 'Personels',
                label: '',
                href: '/panel/owner/settings/personels',
                icon: <IconUsers size={18} />,
            },
            {
                title: 'Languages',
                label: '',
                href: '/panel/owner/settings/languages',
                icon: <IconLanguage size={18} />,
            },
        ],
    },


]
