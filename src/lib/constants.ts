export const ROWS_PER_PAGE_OPTIONS = [1, 2, 30, 40, 50]
export const DEFAULT_ROWS_PER_PAGE = 1
export const rowsPerPageToSelectOptions = ROWS_PER_PAGE_OPTIONS.map((option) => ({
    label: option.toString(),
    value: option.toString()
}))