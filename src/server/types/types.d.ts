import { TCtx } from "../api/trpc"
import { TSession, TSessionWithRestaurat } from "../layer/use-cases/user/user"

export type TCtxWithUser = TCtx & {
    session: TSessionWithRestaurat
}

export type TUseCaseOwnerLayer<T> = {
    input: T
    ctx: TCtxWithUser
}

export type TUseCasePublicLayer<T, C = {}> = {
    input: T
} & C

export type TPagination<T> = {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number

    }
}




