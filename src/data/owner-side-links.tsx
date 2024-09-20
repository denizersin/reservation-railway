import {
    IconHexagonNumber1,
    IconHexagonNumber2,
    IconHexagonNumber3,
    IconSettings
} from '@tabler/icons-react'
import { SideLink } from './types'


export const ownerSidelinks: SideLink[] = [


    {
        title: 'Settings',
        label: '',
        href: '/resaurant-settings',
        icon: <IconSettings size={18} />,
        sub: [
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
                icon: <IconHexagonNumber2 size={18} />,
            },
            {
                title: 'Languages',
                label: '',
                href: '/owner/settings/languages',
                icon: <IconHexagonNumber3 size={18} />,
            },
        ],
    },


]
