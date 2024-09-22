export type TPagination<T> = {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number

    }
}