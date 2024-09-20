"use client";
import { TUser } from "@/server/db/schema/user"
import { api } from "@/server/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import React, { useContext, useEffect } from "react";
import { useShowLoadingModal } from "@/hooks/useShowLoadingModal";
import { TSession } from "@/server/layer/use-cases/user/user";

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

    const logoutMutation = api.user.logout.useMutation();

    function logout() {
        logoutMutation.mutate()
    }

    
    console.log(session?.user,'USERR')
 

    useShowLoadingModal([isLoading])


    return (
        <AuthContext.Provider value={{ session, isAuthenticated, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default function useAuth() {
    return useContext(AuthContext)
}