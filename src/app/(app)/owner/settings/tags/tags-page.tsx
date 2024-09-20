"use client"
import { Button } from '@/components/custom/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/server/trpc/react'
import { useEffect, useState } from 'react'
import { columns } from './_components/columns'
import { TagsDataTable } from './_components/data-table'
import { TagCreateModal } from './_components/tags-crud-modal'
type Props = {
}

export const TagsPage = ({
}: Props) => {
    const {
        data: restaurantLanguagesData,
        isLoading: restaurantLanguagesIsLoading,
        error: restaurantLanguagesError,
    } = api.restaurant.getLanguages.useQuery()

    const [isOpenCreateTagModal, setIsOpenCreateTagModal] = useState(false)
    const [languageId, setLanguageId] = useState(restaurantLanguagesData?.[0]?.language.id || 0)

    console.log(languageId, 'languageId')

    console.log(restaurantLanguagesData, 'restaurantLanguagesData')

    const {
        data,
        isLoading,
        error,
    } = api.restaurant.getAllTags.useQuery({
        limit: 10,
        page: 1,
        languageId: languageId

    }, {
        enabled: Boolean(languageId)
    })

    useEffect(() => {
        if (!languageId) {
            setLanguageId(restaurantLanguagesData?.[0]?.language.id || 0)
        }
    }, [restaurantLanguagesData])




    return (
        <div>
            <div className="mb-4">
                <Button
                    onClick={() => setIsOpenCreateTagModal(true)}
                >Create Tag</Button>
            </div>
            <Select
                value={languageId?.toString()}
                onValueChange={(val) => setLanguageId(Number(val))} >
                <SelectTrigger className='max-w-[300px]'>
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                    {restaurantLanguagesData?.map((language) => (
                        <SelectItem key={language.id} value={language.language.id.toString()}>
                            {language.language.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <TagsDataTable data={data?.data || []} columns={columns} />

            <TagCreateModal
                isOpen={isOpenCreateTagModal}
                setOpen={setIsOpenCreateTagModal}
            />
        </div>

    )
}

