import React from 'react'
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

interface ConfirmationDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    isLoading?: boolean
    type: 'confirm' | 'delete' | 'warning'
    onClickActionButton: () => void
    onClickCancelButton?: () => void
    title: string
    description: string
    actionButtonText?: string
    cancelButtonText?: string
}

export function ConfirmationDialog({
    open,
    setOpen,
    isLoading,
    type,
    onClickActionButton,
    onClickCancelButton,
    title,
    description,
    actionButtonText,
    cancelButtonText,
}: ConfirmationDialogProps) {

    const defaultActionTextMap: any = {
        confirm: 'Confirm',
        warning: 'Delete',
        delete: 'Delete'
    }
    const defaultCancelTextMap: any = {
        confirm: 'Cancel',
        warning: 'Close',
        delete: 'Cancel'
    }
    actionButtonText = actionButtonText || defaultActionTextMap[type]
    cancelButtonText = cancelButtonText || defaultCancelTextMap[type]

    return (
        <AlertDialog

            open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClickCancelButton}>
                        {cancelButtonText}
                    </AlertDialogCancel>
                    <Button
                        loading={isLoading}
                        onClick={onClickActionButton}
                        disabled={isLoading}
                        variant={type === 'delete' ? 'destructive' : 'default'}
                    >
                        {actionButtonText}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}