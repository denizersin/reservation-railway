import { Input } from '@/components/ui/input'
import { useUpdateQueryParams } from '@/hooks/useUpdateQueryParams'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

type Props = {}

export const LocalNameFilter = (props: Props) => {

    const globalFilter = useSearchParams().get('globalFilter') || ''

    const [search, setSearch] = useState(globalFilter)

    const updateQueryParam = useUpdateQueryParams({ replace: true })

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        debounced(e.target.value)
    }

    const debounced = useDebouncedCallback((bounceValue) => {
        updateQueryParam({ globalFilter: bounceValue })
    }, 500)
    useEffect(() => {
        if (globalFilter !== search) {
            setSearch(globalFilter)
        }
    }, [globalFilter])

    return (
        <Input
            placeholder='Ad soyad, telefon, şirket...'
            value={search}
            onChange={onChange}
        />
    )
}