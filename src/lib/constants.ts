import { EnumLanguage } from "@/shared/enums/predefined-enums"

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 30, 40, 50]
export const DEFAULT_ROWS_PER_PAGE = 5

export const DEFAULT_LANGUAGE: EnumLanguage = EnumLanguage.en

export const rowsPerPageToSelectOptions = ROWS_PER_PAGE_OPTIONS.map((option) => ({
    label: option.toString(),
    value: option.toString()
}))

export const COLORS = [
    {
        label: 'Red',
        value: 'red-500'
    },
    {
        label: 'Blue', 
        value: 'blue-500'
    },
    {
        label: 'Green',
        value: 'green-500'
    },
    {
        label: 'Yellow',
        value: 'yellow-500'
    },
    {
        label: 'Purple',
        value: 'purple-500'
    }
] 