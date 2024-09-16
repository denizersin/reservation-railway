"use client"

import { TUser } from "@/server/db/schema/user"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/custom/button"
import { IconDotsVertical, IconMenu } from "@tabler/icons-react"
import { UserCurdModal } from "./user-crud-modal"
import { useState } from "react"

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
                            name: user.name!,
                            email: user.email,
                            role: user.role,
                            password:user.password
                        }}
                    />
                </>
            )
        }
    }
]
