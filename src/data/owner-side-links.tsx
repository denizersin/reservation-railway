import {
    IconCalendarWeek,
    IconClock12,
    IconHexagonNumber1,
    IconHexagonNumber2,
    IconHexagonNumber3,
    IconLanguage,
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
        href: '/owner/reservations',
        icon: <IconCalendarWeek size={18} />,
    },
    {
        title: 'Guests',
        label: '',
        href: '/owner/guests',
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
                href: '/owner/settings/rooms',
                icon: <IconSquare size={18} />,
            },
            {
                title: 'General',
                label: '',
                href: '/owner/settings/general',
                icon: <IconHexagonNumber1 size={18} />,
            },
            {
                title: 'Tags',
                label: '',
                href: '/owner/settings/tags',
                icon: <IconTags size={18} />,
            },
            {
                title: 'Hours',
                label: '',
                href: '/owner/settings/hours',
                icon: <IconClock12 size={18} />,
            },
            {
                title: 'Personels',
                label: '',
                href: '/owner/settings/personels',
                icon: <IconUsers size={18} />,
            },
            {
                title: 'Languages',
                label: '',
                href: '/owner/settings/languages',
                icon: <IconLanguage size={18} />,
            },
        ],
    },


]
