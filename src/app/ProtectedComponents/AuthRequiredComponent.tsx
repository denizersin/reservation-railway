"use client";
import React, { useEffect } from 'react'
import useAuth from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

interface IAuthRequiredComponentProps {
    children: React.ReactNode | React.ReactNode[];
}

const AuthRequiredComponent = ({
    children
}: IAuthRequiredComponentProps) => {

    const router = useRouter();

    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            router.push('/auth/login')
        }

    }, [isAuthenticated,isLoading]);

    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!isAuthenticated) return null


    return children
}
export default AuthRequiredComponent;