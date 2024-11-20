import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TUserValidator, { userValidator } from '@/shared/validators/user'
import { EnumUserRole } from '@/shared/enums/predefined-enums'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/server/trpc/react'
import { Button } from '@/components/custom/button'
import { getQueryKey } from '@trpc/react-query'

export function UserCurdModal({
    isOpen,
    setOpen,
    user
}: {
    isOpen: boolean,
    setOpen: (value: boolean) => void,
    user?: TUserValidator.updateUserByAdminSchema
}) {

    const { mutate } = api.user.createUser.useMutation()

    const isUpdate = !!user
    const queryClient = useQueryClient()

    const onSuccessCrud = () => {
        queryClient.invalidateQueries({
            queryKey: getQueryKey(api.user.getAllUsers)

        })
        setOpen(false)
    }

    const createUserMutation = api.user.createUser.useMutation({
        onSuccess: onSuccessCrud
    })

    const updateUserMutation = api.user.updateUser.useMutation({
        onSuccess: onSuccessCrud
    })


    const form = useForm<TUserValidator.registerSchema>({
        resolver: zodResolver(userValidator.registerSchema),
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: user?.password ?? '',
            role: user?.role ?? EnumUserRole.user,
        },
    })

    const onSubmit = (data: TUserValidator.registerSchema) => {

        if (isUpdate && user) {
            updateUserMutation.mutate({
                id: user.id,
                ...data,
            })
        } else {
            createUserMutation.mutate({
                ...data,
            })
        }

    }

    useEffect(() => {
        if (!isOpen) {
            form.reset()
        }
    }, [isOpen])


    return (
        <Dialog
            open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register New User</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input  {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field}

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(EnumUserRole).map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            loading={createUserMutation.isPending || updateUserMutation.isPending}
                            type="submit">
                            {isUpdate ? 'Update User' : 'Create User'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}