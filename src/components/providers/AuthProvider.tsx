"use client";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";
import { TSession } from "@/server/layer/use-cases/user/user";
import { api } from "@/server/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
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

    const logoutMutation = api.user.logout.useMutation({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getQueryKey(api.user.getSession) })
        }
    });

    function logout() {
        logoutMutation.mutate()
    }

    const pathname = usePathname();
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !pathname?.includes('auth')) {
            router.push('/auth/login')
        }
    }, [isAuthenticated, isLoading])




    useShowLoadingModal([isLoading,logoutMutation.isPending])


    return (
        <AuthContext.Provider value={{ session, isAuthenticated, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext)
}