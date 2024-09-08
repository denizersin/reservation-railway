"use client";
import React, { useEffect } from 'react'
import useAuth from "@/app/providers/AuthProvider"
import { useRouter } from 'next/navigation';
import AuthRequiredComponent from '@/app/ProtectedComponents/AuthRequiredComponent';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface IPageProps {
    children?: React.ReactNode | React.ReactNode[];
}

const Page = ({ }: IPageProps) => {

    const { session, isAuthenticated, isLoading, logout } = useAuth()
    return (
        <AuthRequiredComponent>
            <nav className="bg-gray-800 p-4">
                <ul className="flex space-x-4">
                    <li><Link href="/home" className="text-white hover:text-gray-300">Home</Link></li>
                    <li><Link href="/admin" className="text-white hover:text-gray-300">Admin Panel</Link></li>
                    <li><button onClick={logout} className="text-white hover:text-gray-300">Logout</button></li>
                </ul>
            </nav>
            <Button children="qweqwe"/>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Welcome to Home</h1>
                <p>{session?.user?.email}</p>
                <p>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
            </div>
        </AuthRequiredComponent>

    )
}
export default Page;