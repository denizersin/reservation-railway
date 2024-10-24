"use client";

import { LoadingModal } from "@/components/modal/loading"
import { useEffect } from "react"

export function useShowLoadingModal(loading: boolean[]) {

    const wilShow = loading.filter(Boolean).length > 0


    useEffect(() => {

        console.log(LoadingModal.isOpen, 'LoadingModal.isOpen');
        if (!LoadingModal.isOpen && wilShow) {
            LoadingModal.show()
        }

        if (LoadingModal.isOpen && !wilShow) {
            LoadingModal.hide()
        }

    }, [wilShow])

    return LoadingModal.isOpen

}