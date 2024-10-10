import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import React from 'react';

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    tooltip?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    infoIcon?: boolean,
    infoIconPlacement?: 'left' | 'right',
    infoIconColor?: 'black' | 'white',
}

export const TooltipText: React.FC<DivProps> = ({
    children,
    tooltip,
    tooltipPosition = 'top',
    infoIcon = false,
    infoIconPlacement = 'right',
    infoIconColor='black',
    ...props
}) => {
    return (
        <div className={cn('inline-flex items-center relative group', props.className)}>
            {children}
            {infoIcon && infoIconPlacement === 'right' && (
                <Info className={cn('w-4 h-4 text-primary-foreground ml-2',{
                    'text-white': infoIconColor === 'white',
                    'text-black': infoIconColor === 'black',
                })} />
            )}
            {tooltip &&
                (
                    <div className={cn('absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity', {
                        'left-0 translate-x-0': tooltipPosition === 'right',
                    })}>
                        {tooltip}
                    </div>
                )
            }
        </div>
    );
};
