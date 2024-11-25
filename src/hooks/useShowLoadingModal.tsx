"use client";

import { LoadingModal } from "@/components/modal/loading"
import { useEffect } from "react"

export function useShowLoadingModal(loading: boolean[]) {

    const wilShow = loading.filter(Boolean).length > 0


    useEffect(() => {

        if (!LoadingModal.isOpen && wilShow) {
            LoadingModal.show()
        }

        if (LoadingModal.isOpen && !wilShow) {
            LoadingModal.hide()
        }

    }, [wilShow])

    console.log(wilShow,'wilShow11')

    useEffect(() => {
        return () => {
            if (wilShow) {
    console.log(wilShow,'wilShow22 UNMOUNT')

                console.log('HIDEEE')
                LoadingModal?.hide()
            }
        }
    }, [])


    return LoadingModal.isOpen

}