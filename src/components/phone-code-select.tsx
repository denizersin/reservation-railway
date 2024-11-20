"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { cn } from "@/lib/utils"
import codeData from "@/shared/data/country-code.json"

interface PhoneCodeSelectProps {
  phoneCode: string
  onValueChange: (value: string) => void
  className?: string
}

export default function PhoneCodeSelect({ phoneCode, onValueChange, className }: PhoneCodeSelectProps) {
  const [open, setOpen] = React.useState(false)

  const countryCodeData = codeData as {
    name: string
    phoneCode: string
    code: string
  }[]


  const selectedCountry = countryCodeData.find((item) => item.phoneCode === phoneCode)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger  asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[110px] justify-between", className)}
        >
          {selectedCountry
            ? selectedCountry.name + " " + selectedCountry.phoneCode
            : "Country Code"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryCodeData.map((item) => (
                <CommandItem
                  key={item.code}
                  value={item.name}
                  onSelect={() => {
                    onValueChange(item.phoneCode)
                    setOpen(false)
                  }}
                >
                  <span>{item.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    {item.phoneCode}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      phoneCode === item.phoneCode ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}