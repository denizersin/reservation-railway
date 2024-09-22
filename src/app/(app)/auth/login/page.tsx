"use client";
import useAuth from '@/components/providers/AuthProvider';
import { api } from '@/server/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { redirect, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/custom/button';
import { useForm } from 'react-hook-form';
import TUserValidator, { userValidator } from '@/shared/validators/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useShowLoadingModal } from '@/hooks/useShowLoadingModal';

interface IPageProps {
    children?: React.ReactNode | React.ReactNode[];
}

const Page = ({ }: IPageProps) => {

    const queryClient = useQueryClient()
    const {
        mutate: login,
        isPending: isLoggingIn
    } = api.user.login.useMutation({
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: getQueryKey(api.user.getSession)
            })
        },
    })
    const router = useRouter();




    const { register, handleSubmit, formState: { errors } } = useForm<TUserValidator.loginSchema>({
        resolver: zodResolver(userValidator.loginSchema),
    });

    const onSubmit = (data: TUserValidator.loginSchema) => {
        login(data)
    };

    useShowLoadingModal([isLoggingIn])

    const { isAuthenticated, isLoading, session } = useAuth()
    useEffect(() => {

        if (isLoading || !session) return
        const role = session.user.userRole
        router.replace('/')


    }, [isAuthenticated]);


    return (
        <div about='component' className='flex min-h-screen items-center justify-center bg-slate-200'>
            <Card className="mx-auto max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Enter your email and password to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <span>{errors.email.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                            />
                            {errors.password && <span>{errors.password.message}</span>}
                        </div>
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
export default Page;