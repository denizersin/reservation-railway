"use client";
import { EnumUserRole } from '@/server/db/schema/user';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import useAuth from '../providers/AuthProvider';
import { withAuth } from './AuthRequiredComponent';

interface IRoleRequiredComponentProps {
    children: React.ReactNode | React.ReactNode[];
    requiredRole: EnumUserRole
}

const RoleRequiredComponent = ({
    children,
    requiredRole

}: IRoleRequiredComponentProps) => {
    const router = useRouter();
    const { session } = useAuth();
    const role = session?.user.role

    useEffect(() => {
        if (!session) {
            router.push('/auth/login')
            alert('You are not authorized to view this page')
        }
    }, [role])
    

    if (role !== requiredRole) {
        return null
    }

    return children
}


export default withAuth(RoleRequiredComponent);