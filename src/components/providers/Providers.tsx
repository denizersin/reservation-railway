"use clinet";

import { TRPCReactProvider } from '@/server/trpc/react';
import React from 'react'
import { AuthProvider } from './AuthProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import LoadingModalWrapper from '../modal/loading';
import { ThemeProvider } from './theme-provider';


interface IProvidersProps {
    children: React.ReactNode | React.ReactNode[];
}

const Providers = ({ children }: IProvidersProps) => {
    return (
        <TRPCReactProvider>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                    <ReactQueryDevtools initialIsOpen={false} />
                    <LoadingModalWrapper />
                </AuthProvider>
            </ThemeProvider>

        </TRPCReactProvider>
    )
}
export default Providers;