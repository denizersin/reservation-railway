"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "../ui/form"

export interface ComboSelectOption {
  value: string;
  label: string;
}

interface CustomComboSelectProps {
  value?: string | null;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  buttonClass?: string;
  data: ComboSelectOption[];
  disabled?: boolean;
  isFormSelect?: boolean;
}

export function CustomComboSelect({
  value,
  onValueChange,
  defaultValue,
  placeholder = "Select an option",
  buttonClass,
  data,
  disabled = false,
  isFormSelect = true,
}: CustomComboSelectProps) {
  const [open, setOpen] = React.useState(false)

  const valueLabelMap: Record<string, string> = React.useMemo(() => {
    return data.reduce((acc: Record<string, string>, option) => {
      acc[option.value] = option.label
      return acc
    }, {} as Record<string, string>)
  }, [data])



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
                ? data.find((option) => option.value === value)?.label
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
              ? data.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent className="w-[200px] p-0">
        <Command
          filter={(value, search, keywords) => {
            return valueLabelMap[value]?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {data.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? "" : currentValue)
                    setOpen(false)
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
