'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { IconLoader2 } from '@tabler/icons-react'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9',
                ['xs-icon']: 'h-6 w-6',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

interface ButtonPropsBase
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    tooltip?: string
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
}

type ButtonProps = ButtonPropsBase &
    (
        | { asChild: true }
        | {
            asChild?: false
            loading?: boolean
            leftSection?: JSX.Element
            rightSection?: JSX.Element
        }
    )

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, children, ...props }, ref) => {
        if (props.asChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Slot>
            )
        }

        const tooltipRef = React.useRef<HTMLDivElement>(null)
        const buttonRef = React.useRef<HTMLButtonElement>(null)

        React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement)

        const {
            loading = false,
            leftSection,
            rightSection,
            disabled,
            ...otherProps
        } = props

        return (

            <button
                className={cn(buttonVariants({ variant, size, className }), 'relative group')}
                disabled={loading || disabled}
                ref={buttonRef}
                {...otherProps}

                onMouseEnter={() => {
                    if (tooltipRef.current) {
                        tooltipRef.current.style.display = 'block'
                    }
                }}
                onMouseLeave={() => {
                    if (tooltipRef.current) {
                        tooltipRef.current.style.display = 'none'
                    }
                }}
            >
                {((leftSection && loading) ||
                    (!leftSection && !rightSection && loading)) && (
                        <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                {!loading && leftSection && <div className='mr-2'>{leftSection}</div>}
                {children}
                {!loading && rightSection && <div className='ml-2'>{rightSection}</div>}
                {rightSection && loading && (
                    <IconLoader2 className='ml-2 h-4 w-4 animate-spin' />
                )}

                {props.tooltip &&
                    !disabled && (
                        <div 
                            ref={tooltipRef}
                            className={cn('absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-sm hidden  transition-opacity', {
                                'left-0 translate-x-0': props.tooltipPosition === 'right',
                            })}>
                            {props.tooltip}
                        </div>
                    )
                }

            </button>
        )
    }
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
