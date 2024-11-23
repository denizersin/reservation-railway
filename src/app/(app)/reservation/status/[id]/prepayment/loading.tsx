"use client"

import { useShowLoadingModal } from "@/hooks/useShowLoadingModal"

export default function Loading() {

    useShowLoadingModal([true])
    return null
}
