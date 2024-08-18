"use client";
import useAuth from '@/app/providers/AuthProvider';
import { api } from '@/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface IPageProps {
    children?: React.ReactNode | React.ReactNode[];
}

const Page = ({ }: IPageProps) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const queryClient = useQueryClient()
    const {
        mutate: login,
        isPending: isLoggingIn
    } = api.user.login.useMutation({
        onSuccess(data, variables, context) {
            localStorage.setItem('token', data.token);
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.user.getSession)
            })
        },
    })
    const router = useRouter();

    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        if (isLoading) return
        if (isAuthenticated) {
            router.push('/home')
        }
    }, [isAuthenticated]);




    return (
        <div about='component' className='flex min-h-screen items-center justify-center bg-slate-200' >

            <div className="p-6 border rounded-lg w-[400px] mx-auto bg-slate-100 flex flex-col gap-y-3">
                <h1 className='text-center text-xl font-normal'>Login</h1>
                <input className='p-4 border-b-2' type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className='p-4 border-b-2' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button



                    disabled={isLoggingIn}
                    className='bg-slate-500 py-4 text-white rounded-lg'
                    onClick={() => {
                        login({ email, password })
                    }}>
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
                <span className='text-blue-400 text-center mt-3'
                    onClick={() => router.push('/auth/register')}
                >Register</span>

            </div>


        </div>
    )
}
export default Page;