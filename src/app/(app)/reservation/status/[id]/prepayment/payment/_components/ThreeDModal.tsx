import { TPaymentResult } from '@/app/api/iyzipay/callback/route'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import React, { useEffect, useMemo, useRef } from 'react'

type Props = {
    threeDSContent: string
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onMessage: (data: TPaymentResult) => void
}

export const ThreeDModal = ({
    threeDSContent,
    isOpen,
    setIsOpen,
    onMessage
}: Props) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Iframe'den gelen mesajları dinle

        const handleIframeMessage = (event: any) => {
            console.log(event.data, 'event.data')
            console.log(event.data.from, 'event.data.from')
            if (event?.data?.from !== 'iyzipay') return
            console.log(event, 'event')
            console.log("Iframe'den gelen mesaj:", event.data);
            try {
                onMessage(event.data)
            } catch (error) {
                console.log(event.data, 'event.data')
                console.log(error, 'error23')
                onMessage({
                    status: 'error',
                    from: 'iyzipay'
                })

            }
        };
        window.addEventListener("message", handleIframeMessage);

        return () => {
            window.removeEventListener("message", handleIframeMessage);
        };
    }, []);

    const parsedHTML = useMemo(() => {
        if (atob && threeDSContent) {
            console.log(threeDSContent, 'threeDSContent')
            return atob(threeDSContent)
        }
    }, [threeDSContent])

    console.log(parsedHTML, 'parsedHTML')

    const bodyContent = useMemo(() => {
        if (parsedHTML) {
            
        }
    }, [parsedHTML])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='p-0 min-h-[500px]'>
                <iframe
                    className='w-full h-full'
                    ref={iframeRef}
                    srcDoc={parsedHTML}
                    id="threeDSContent"
                />

            </DialogContent>
        </Dialog>
    )
}