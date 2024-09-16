"use client";
import useAuth from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

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

    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <></>
    }
    if (!isAuthenticated) return null


    return children
}

export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
    return function WithAuth(props: T) {
        const router = useRouter();
        const { isAuthenticated, isLoading } = useAuth();

        React.useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push('/auth/login');
            }
        }, [isAuthenticated, isLoading, router]);

        if (isLoading) {
            return <></>;
        }

        if (!isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}





export default AuthRequiredComponent;