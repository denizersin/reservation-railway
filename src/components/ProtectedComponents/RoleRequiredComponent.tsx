"use client";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import useAuth from '../providers/AuthProvider';
import { withAuth } from './AuthRequiredComponent';
import { EnumUserRole } from '@/shared/enums/predefined-enums';

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
    const role = session?.user.userRole

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