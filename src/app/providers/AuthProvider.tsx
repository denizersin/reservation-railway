"use client";
import { TSession } from "@/layer/use-cases/user";
import { TUser } from "@/server/db/schema/user"
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import React, { useContext, useEffect } from "react";

type TAuthContext = {
    session: TSession | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
}

export const AuthContext = React.createContext<TAuthContext>({} as TAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, isSuccess } = api.user.getSession.useQuery()
    const isAuthenticated = Boolean(data && !isError)
    const session = isAuthenticated ? data as TSession : null

    console.log(isAuthenticated,'useauth');

    function logout() {
        localStorage.removeItem('token')
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.user.getSession)
        })
    }

    useEffect(() => {
        if (isError)
            localStorage.removeItem('token')
    }, [isError]);

    useEffect(() => {
        if (isSuccess && session) {
            localStorage.setItem('token', session?.token)
            
        }
    }, [isSuccess, session]);


    return (
        <AuthContext.Provider value={{ session, isAuthenticated, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext)
}