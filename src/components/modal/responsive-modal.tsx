import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent
} from "@/components/ui/sheet";
import useIsMobile from '@/hooks/useMediaQueries';
import { cn } from '@/lib/utils';
import { RefObject, useImperativeHandle, useState } from 'react';

export type ResponsiveModalHandleRef = {
    openModal?: () => void
    closeModal?: () => void
}

type ResponsiveModalProps = {
    children: React.ReactNode
    modalContentClassName?: string
    sheetContentClassName?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    handleRef?: RefObject<ResponsiveModalHandleRef>
}

export const ResponsiveModal = ({ children, modalContentClassName, sheetContentClassName, open, onOpenChange, handleRef }: ResponsiveModalProps) => {

    const [currentOpen, setCurrentOpen] = useState(open)

    const isMobile = useIsMobile()

    useImperativeHandle(handleRef, () => ({
        openModal: () => {
            onOpenChange?.(true)
            setCurrentOpen(true)
        },
        closeModal: () => {
            onOpenChange?.(false)
            setCurrentOpen(false)
        }
    }))

    if (isMobile) {
        return <Sheet open={open ?? currentOpen} onOpenChange={onOpenChange ?? setCurrentOpen}>
            <SheetContent

                side={'bottom'}
                className={cn("w-full", sheetContentClassName)}>
                {children}
            </SheetContent>
        </Sheet>
    }

    return <Dialog open={open ?? currentOpen} onOpenChange={onOpenChange ?? setCurrentOpen}>
        <DialogContent
            className={cn("w-full", modalContentClassName)}>
            {children}
        </DialogContent>
    </Dialog>

}