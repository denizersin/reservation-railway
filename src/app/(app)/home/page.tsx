"use client";
import React, { useEffect } from 'react'
import useAuth from "@/app/providers/AuthProvider"
import { useRouter } from 'next/navigation';
import AuthRequiredComponent from '@/app/ProtectedComponents/AuthRequiredComponent';

interface IPageProps {
    children?: React.ReactNode | React.ReactNode[];
}

const Page = ({ }: IPageProps) => {

    const { session, isAuthenticated, isLoading, logout } = useAuth()
    return (
        <AuthRequiredComponent>
            <div about='component' className='' >
                <h1>Protecetd Home</h1>
                <p>{session?.user?.email}</p>
                <p>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                <button
                    onClick={() => { 
                        logout()
                    }}
                >logout</button>
            </div>
        </AuthRequiredComponent>

    )
}
export default Page;