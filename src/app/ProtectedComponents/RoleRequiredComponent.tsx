"use client";
import React, { useEffect } from 'react'
import useAuth from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { EnumUserRole } from '@/server/db/schema/user';

interface IRoleRequiredComponentProps {
    children: React.ReactNode | React.ReactNode[];
    requiredRole: EnumUserRole
}

const RoleRequiredComponent = ({
    children,
    requiredRole

}: IRoleRequiredComponentProps) => {
    const router = useRouter();

    const { isAuthenticated, isLoading, session } = useAuth();
    console.log('render',isAuthenticated,isLoading)
    const role = session?.user.role

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            router.push('/auth/login')
        }

        if (role !== requiredRole) {
            alert('You do not have permission to access this page')
            router.push('/home')
        }


    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!isAuthenticated) return null

    if (role !== requiredRole) {
        return null
    }

    return children



    
}
export default RoleRequiredComponent;