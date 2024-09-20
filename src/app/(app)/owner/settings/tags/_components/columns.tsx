"use client"

import { Button } from "@/components/custom/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TRestaurantTagTranslation } from "@/server/db/schema/restaurant-tags"
import { IconDotsVertical } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { TagCreateModal } from "./tags-crud-modal"

export const columns: ColumnDef<TRestaurantTagTranslation>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const tag = row.original
            const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

            const [editTagId, setEditTagId] = useState<number | undefined>(undefined)


            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant={'secondary'} size="sm">
                                <IconDotsVertical stroke={2} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                setIsUpdateModalOpen(true)
                                setEditTagId(tag.tagId)
                            }}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <TagCreateModal
                        isOpen={isUpdateModalOpen}
                        setOpen={setIsUpdateModalOpen}
                        tagId={editTagId}
                    />
                </>
            )
        }
    }
]