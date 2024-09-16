import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

const FullWidthWrapper = ({
    className,
    children,
}: {
    className?: string
    children: ReactNode
}) => {
    return (
        <div className={cn('w-full', className)}>
            {children}
        </div>
    )
}

export default FullWidthWrapper
