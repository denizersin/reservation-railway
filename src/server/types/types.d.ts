import { TCtx } from "../api/trpc"
import { TSession } from "../layer/use-cases/user/user"

export type TCtxWithUser = TCtx & {
    session:TSession
}

export type TUseCaseLayer<T> = {
    input?: T
    ctx: TCtxWithUser
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