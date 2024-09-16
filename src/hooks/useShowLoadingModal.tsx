"use client";

import { LoadingModal } from "@/components/modal/loading"
import { useEffect } from "react"

export function useShowLoadingModal(loading: boolean[]) {

    const wilShow = loading.filter(Boolean).length > 0

    console.log(wilShow, 'wilShow', loading);

    useEffect(() => {

        console.log(LoadingModal.isOpen, 'LoadingModal.isOpen');
        if (!LoadingModal.isOpen && wilShow) {
            LoadingModal.show()
        }

        if (LoadingModal.isOpen && !wilShow) {
            console.log('HIDEEE')
            LoadingModal.hide()
        }

    }, [wilShow])



}