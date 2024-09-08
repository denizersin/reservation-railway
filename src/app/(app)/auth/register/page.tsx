"use client";
import useAuth from '@/app/providers/AuthProvider';
import { api } from '@/server/trpc/react';
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
    const [name, setName] = useState("");
    const queryClient = useQueryClient()

    const {
        mutate: register,
        isPending: isRegistering
    } = api.user.register.useMutation({
        onSuccess(data, variables, context) {
            if (data.token) {
                localStorage.setItem('token', data.token);
                queryClient.invalidateQueries({
                    queryKey: getQueryKey(api.user.getSession)
                })
            }
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
                <h1 className='text-center text-xl font-normal'>Register</h1>
                <input 
                placeholder='name'
                className='p-4 border-b-2' type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <input
                placeholder='email'
                className='p-4 border-b-2' type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input 
                placeholder='password'
                className='p-4 border-b-2' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button
                    disabled={isRegistering}
                    className='bg-slate-500 py-4 text-white rounded-lg' onClick={() => { 
                        register({ email, password,name })
                    }}>
                    {isRegistering ? 'Registering...' : 'Register'}
                </button>
                <span className='text-blue-400 text-center mt-3'
                    onClick={() => router.push('/auth/login')}
                >Login</span>

            </div>


        </div>
    )
}
export default Page;