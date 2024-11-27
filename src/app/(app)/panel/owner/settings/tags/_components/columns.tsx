"use client"

import { Button } from "@/components/custom/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TRestaurantTagTranslation, TRestaurantTagWithTranslations } from "@/server/db/schema/restaurant-tags"
import { IconDotsVertical } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { TagCreateModal } from "./tags-crud-modal"
import { cn } from "@/lib/utils"

export const columns: ColumnDef<TRestaurantTagWithTranslations>[] = [
    {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
            const tagTrns = row.original.translations?.[0]
            if (!tagTrns) return null
            return tagTrns.name
        }
    },
    {   
        id: "code",
        header: "Code",
        cell: ({ row }) => {
            const tagTrns = row.original.translations?.[0]
            if (!tagTrns) return null
            return tagTrns.code
        }
    },
    {
        id: "color",
        header: "Color",
        cell: ({ row }) => {
            return <div className={cn(`w-max px-2 py-px rounded-full text-white bg-${row.original.color}`)}>
                {row.original.translations?.[0]?.name}
            </div>
        }
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
                    <DropdownMenu
                        modal={false}
                    >
                        <DropdownMenuTrigger>
                            <Button variant={'secondary'} size="sm">
                                <IconDotsVertical stroke={2} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                setIsUpdateModalOpen(true)
                                setEditTagId(tag.id)
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