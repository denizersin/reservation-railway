"use client"

import { TUser } from "@/server/db/schema/user"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Button } from "@/components/custom/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { IconDotsVertical } from "@tabler/icons-react"
import { useState } from "react"
import { UserCurdModal } from "./user-crud-modal"

export const columns: ColumnDef<TUser>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original
            const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant={'secondary'} size="sm">
                                <IconDotsVertical stroke={2} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setIsUpdateModalOpen(true)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <UserCurdModal
                        isOpen={isUpdateModalOpen}
                        setOpen={setIsUpdateModalOpen}
                        user={{
                            id: user.id,
                            name: user.name ,
                            email: user.email,
                            role: user.role,
                            password: user.password
                        }}
                    />
                </>
            )
        }
    }
]
