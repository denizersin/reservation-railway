"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"
import * as React from "react"
import { FormControl } from "../ui/form"

import { Input } from '@/components/ui/input'
import { api, RouterOutputs } from "@/server/trpc/react"
import TGuestValidator from "@/shared/validators/guest"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"

type TGuestPagination = RouterOutputs['guest']['getGuestsPagination']


export interface ComboSelectOption {
    value: string;
    label: string;
}

interface SearchableGuestSelectProps {
    value?: string | null;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    placeholder?: string;
    buttonClass?: string;
    disabled?: boolean;
    isFormSelect?: boolean;
    onSearch?: (search: string) => void;
    searchValue?: string;
}


const defaultQueryInput: TGuestValidator.GuestsPaginationSchema = {
    pagination: {
        page: 1,
        limit: 20,
    },
    filters: {},
    global_search: undefined
}

export function SearchableGuestSelect({
    value,
    onValueChange,
    placeholder = "Select an option",
    buttonClass,
    disabled = false,
    isFormSelect = true,
}: SearchableGuestSelectProps) {
    const [open, setOpen] = React.useState(false)

    const queryClient = useQueryClient()
    const [search, setSearch] = React.useState("")

    const [queryInput, setQueryInput] = React.useState<TGuestValidator.GuestsPaginationSchema>(defaultQueryInput)

    const { data, isLoading } = api.guest.getGuestsPagination.useQuery(queryInput)

    const { data: selectedData, isLoading: isSelectedDataLoading } = api.guest.getGuestsPagination.useQuery({
        ...defaultQueryInput,
        filters: {
            guestId: Number(value)
        },
    }, {
        enabled: !!value,
        select: (data) => data.data[0]
    })


    const options = React.useMemo(() => {

        const newOptions = data?.data.map((guest) => ({
            value: guest.id.toString(),
            label: guest.name,
        })) || []


        if (value) {

            const isNewOptionsHasSelectedValue = newOptions.find((option) => option.value === value)

            if (isNewOptionsHasSelectedValue) {
                const newOptionsWithoutSelectedValue = newOptions.filter((option) => option.value !== value)
                newOptionsWithoutSelectedValue.unshift({
                    value: selectedData?.id.toString() ?? "",
                    label: selectedData?.name ?? "",
                })
                return newOptionsWithoutSelectedValue
            } else {
                newOptions.unshift({
                    value: selectedData?.id.toString() ?? "",
                    label: selectedData?.name ?? "",
                })
            }
        }



        return newOptions


    }, [search, data, selectedData])




    const handleSearch = (serachValue: string) => {
        setQueryInput((prev) => ({
            ...prev,
            global_search: serachValue
        }))
        setSearch(serachValue);
    }

    const onValueChangeHandler = (value: string) => {
        onValueChange?.(value)
        setOpen(false)
        const newSelectedData = data?.data.find((guest) => guest.id.toString() === value)

        if (newSelectedData) {
            console.log(value, 'value11')
            const queryKey = getQueryKey(api.guest.getGuestsPagination, {
                ...defaultQueryInput,
                filters: {
                    guestId: Number(value)
                },
            }, 'query')

            queryClient.setQueryData(queryKey, {
                data: [newSelectedData],
            } as TGuestPagination)
        }
    }




    return (
        <Popover open={open} onOpenChange={setOpen}>
            {isFormSelect ? (
                <FormControl>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn("w-[200px] justify-between", buttonClass)}
                            disabled={disabled}
                        >
                            {value
                                ? options?.find((option) => option.value === value)?.label
                                : placeholder}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                </FormControl>
            ) : (
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-[200px] justify-between", buttonClass)}
                        disabled={disabled}
                    >
                        {value
                            ? options?.find((option) => option.value === value)?.label
                            : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
            )}
            <PopoverContent className="w-[250px] p-0">
                <Command >
                    {/* <CommandInput placeholder="Search option..." /> */}
                    <div className="px-2 my-1 mt-2 flex items-center gap-2">
                        {
                            isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                : <Search />
                        }
                        <Input
                            className="h-8"
                            placeholder="Ad, Numara, Şirket "
                            value={search} onChange={(e) => handleSearch(e.target.value)} />
                    </div>
                    <CommandList>
                        {/* <CommandEmpty>No option found.</CommandEmpty> */}
                        <CommandGroup>
                            {options?.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onValueChangeHandler(currentValue)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}

                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
