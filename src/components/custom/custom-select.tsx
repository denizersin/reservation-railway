import React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string;
    label: string;
}



interface CustomSelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    placeholder?: string;
    selectTriggerClass?: string;
    data: SelectOption[];
    disabled?: boolean;
    required?: boolean;
}

export function CustomSelect({
    value,
    onValueChange,
    defaultValue,
    placeholder = "Select an option",
    selectTriggerClass,
    data,
    disabled = false,
    required = false,
}: CustomSelectProps) {
    return (
        <Select
            value={value}
            onValueChange={onValueChange}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
        >
            <SelectTrigger className={cn('w-full', selectTriggerClass)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {data.map((item, index) => (
                    <SelectItem key={index} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}