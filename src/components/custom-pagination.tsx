import { TPagination } from '@/server/types/types'
import React from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { CustomSelect } from './custom/custom-select'
import { rowsPerPageToSelectOptions } from '@/lib/constants'
import { TBasePaginationSchema } from '@/shared/validators'
type Props = {
    paginationData: TPagination<any>['pagination']
    pagination: TBasePaginationSchema
    setPagination: (pagination: TBasePaginationSchema) => void
}

export const CustomPagination = ({
    paginationData,
    pagination,
    setPagination
}: Props) => {




    return (
        <div className='flex justify-center items-center'>
            <Pagination>
                <PaginationContent>
                    {paginationData.page > 3 && <PaginationItem>
                        <PaginationLink className='cursor-pointer'
                            onClick={() => setPagination({ ...pagination, page: 1 })}
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>}

                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPagination({ ...pagination, page: Math.max(pagination.page - 1, 1) })}
                        />
                    </PaginationItem>
                    {Array.from({ length: Math.min(3, paginationData.totalPages || 1) }).map((_, index) => {
                        const pageNumber = pagination.page + index;
                        if (pageNumber > paginationData.totalPages) return null;
                        return (
                            <PaginationItem
                                key={pageNumber}
                                onClick={() => setPagination({ ...pagination, page: pageNumber })}
                            >
                                <PaginationLink className='cursor-pointer' isActive={pageNumber === pagination.page}>
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPagination({ ...pagination, page: Math.min(pagination.page + 1, paginationData.totalPages || 1) })}
                        />
                    </PaginationItem>
                    {paginationData.totalPages > 3 && <PaginationItem>
                        <PaginationLink className='cursor-pointer'
                            onClick={() => setPagination({ ...pagination, page: paginationData.totalPages })}
                        >
                            {paginationData.totalPages}
                        </PaginationLink>
                    </PaginationItem>}
                </PaginationContent>

            </Pagination>

            <CustomSelect
                selectTriggerClass='h-8 w-[70px]'
                data={rowsPerPageToSelectOptions}
                value={paginationData.limit.toString()}
                onValueChange={(value) => {
                    setPagination({ ...pagination, limit: Number(value) })
                }}
                isFormSelect={false}
            />

        </div>
    )
}