"use client"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import React, { forwardRef, useImperativeHandle, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '../custom/button'

export type ConfirmModalRef = {
    show: (options: ConfirmModalOptions) => void
    hide: () => void
    isOpen: boolean
}

interface ConfirmModalOptions {
    type: 'confirm' | 'delete' | 'warning'
    onConfirm: () => Promise<void>
    onCancel?: () => void
    title: string
    description?: string
    confirmButtonText?: string
    cancelButtonText?: string
}

const ConfirmModal = forwardRef<ConfirmModalRef, {}>((props, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmModalOptions | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useImperativeHandle(ref, () => ({
        show: (newOptions: ConfirmModalOptions) => {
            setOptions(newOptions)
            setIsOpen(true)
        },
        hide: () => setIsOpen(false),
        isOpen,
    }))

    if (!options) return null

    const {
        type,
        onConfirm,
        onCancel,
        title,
        description,
        confirmButtonText,
        cancelButtonText,
    } = options

    const defaultActionTextMap: Record<string, string> = {
        confirm: 'Confirm',
        warning: 'Proceed',
        delete: 'Delete'
    }
    const defaultCancelTextMap: Record<string, string> = {
        confirm: 'Cancel',
        warning: 'Cancel',
        delete: 'Cancel'
    }

    const handleConfirm = async () => {
        setIsLoading(true)
        await onConfirm()
            .then(() => {
                setIsLoading(false)
                setIsOpen(false)
            })
            .catch((err) => {
                setIsLoading(false)
            })
    }

    const handleCancel = () => {
        onCancel?.()
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogHeader>
                    {/* <AlertDialogDescription>{description}</AlertDialogDescription> */}
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant={'outline'}
                        onClick={handleCancel}>
                        {cancelButtonText || defaultCancelTextMap[type]}
                    </Button>
                    <Button
                        loading={isLoading}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        variant={type === 'delete' ? 'destructive' : 'default'}
                    >
                        {confirmButtonText || defaultActionTextMap[type]}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})

ConfirmModal.displayName = 'ConfirmModal'

export let ConfirmModalGlobal: ConfirmModalRef = {} as ConfirmModalRef

const ConfirmModalWrapper: React.FC = () => {
    const modalRef = React.useRef<ConfirmModalRef>(null)

    React.useEffect(() => {
        if (modalRef.current) {
            ConfirmModalGlobal = modalRef.current
        }
    }, [])

    return <ConfirmModal ref={modalRef} />
}

export default ConfirmModalWrapper

