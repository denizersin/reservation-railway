"use clinet";

import { TRPCReactProvider } from '@/server/trpc/react';
import React from 'react'
import { AuthProvider } from './AuthProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import LoadingModalWrapper from '../modal/loading';
import { ThemeProvider } from './theme-provider';
import { TooltipProvider } from '../ui/tooltip';
import ConfirmModalWrapper from '../modal/confirm-modal';
import { InferTailwind } from './InferTailwind';
import { AppProvider } from './AppProcider';
import { Toaster } from '../ui/toaster';


interface IProvidersProps {
    children: React.ReactNode | React.ReactNode[];
}

const Providers = ({ children }: IProvidersProps) => {
    return (
        <TRPCReactProvider>
            <AppProvider>
                <ThemeProvider>
                    <TooltipProvider>
                        <AuthProvider>
                            {children}
                            <ReactQueryDevtools initialIsOpen={false} />
                            <LoadingModalWrapper />
                            <ConfirmModalWrapper />
                            <InferTailwind />
                            <Toaster />
                        </AuthProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </AppProvider>
        </TRPCReactProvider>
    )
}
export default Providers;