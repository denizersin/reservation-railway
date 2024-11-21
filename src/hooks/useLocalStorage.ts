"use client";

import { useEffect, useState } from 'react';
import useClientLocalStorage from './useClientLocalStorage';

interface LocalStorageProps<T> {
    key: string
    defaultValue: T
}

export default function useLocalStorage<T>({
    key,
    defaultValue,
}: LocalStorageProps<T>) {

    const localStorage = useClientLocalStorage()

    if (typeof window === 'undefined') {
        return [defaultValue, () => { }] as const
    }

    const [value, setValue] = useState<T>(() => {
        const storedValue = localStorage?.getItem(key)
        return storedValue !== null ? (JSON.parse(storedValue) as T) : defaultValue
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage?.setItem(key, JSON.stringify(value))
        }
    }, [value, key])

    return [value, setValue] as const
}
