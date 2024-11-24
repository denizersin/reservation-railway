import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

const FrontMaxWidthWrapper = ({
    className,
    children,
}: {
    className?: string
    children: ReactNode
}) => {
    return (
        <div className={cn('mx-auto w-full max-w-[630px] max-sm:px-3 ', className)}>
            {children}
        </div>
    )
}

export default FrontMaxWidthWrapper
