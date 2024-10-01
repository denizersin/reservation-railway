"use clinet";

import { TRPCReactProvider } from '@/server/trpc/react';
import React from 'react'
import { AuthProvider } from './AuthProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import LoadingModalWrapper from '../modal/loading';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from '../ui/tooltip';


interface IProvidersProps {
    children: React.ReactNode | React.ReactNode[];
}

const Providers = ({ children }: IProvidersProps) => {
    return (
        <TRPCReactProvider>
            <ThemeProvider>
                <TooltipProvider>
                    <AuthProvider>
                        {children}
                        <ReactQueryDevtools initialIsOpen={false} />
                        <LoadingModalWrapper />
                    </AuthProvider>
                </TooltipProvider>
            </ThemeProvider>

        </TRPCReactProvider>
    )
}
export default Providers;