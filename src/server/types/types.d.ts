import { TCtx, TOwnerProcedureCtx, TPublicProcedureCtx } from "../api/trpc"
import { TSession, TSessionWithRestaurat } from "../layer/use-cases/user/user"

export type TCtxWithUser = TCtx & {
    session: TSessionWithRestaurat
    restaurantId: string
}

export type TUseCaseOwnerLayer<T> = {
    input: T
    ctx: TOwnerProcedureCtx
}

export type TUseCasePublicLayer<T, C = {}> = {
    input: T
    ctx: TPublicProcedureCtx
} & C

export type TUseCaseClientLayer<T> = {
    input: T
    ctx: TClientProcedureCtx
} 

export type TPagination<T> = {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number

    }
}




