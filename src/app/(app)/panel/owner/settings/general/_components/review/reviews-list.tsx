import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRestaurantLanguagesSelectData } from '@/hooks/predefined/predfined'
import { TRestaurantReviewWithTranslations } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import { MoreVertical, Pencil } from "lucide-react"
import { useEffect, useState } from 'react'
import { ReviewCrudModal } from "./review-crud-modal"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CustomComboSelect } from "@/components/custom/custom-combo-select"

type Props = {}

export const ReviewsList = (props: Props) => {

    const { selectData: restaurantLanguagesSelectData } = useRestaurantLanguagesSelectData()
    const [languageIdFilter, setLanguageIdFilter] = useState<number | undefined>(undefined)

    const { data: reviews } = api.restaurantSetting.getAllReviews.useQuery()

    const [updateReviewData, setUpdateReviewData] = useState<TRestaurantReviewWithTranslations>()
    const [isUpdateReviewModalOpen, setIsUpdateReviewModalOpen] = useState(false)

    const [createNewReviewModalOpen, setCreateNewReviewModalOpen] = useState(false)

    const handleUpdateReviewModalOpen = (review: TRestaurantReviewWithTranslations) => {
        setUpdateReviewData(review)
        setIsUpdateReviewModalOpen(true)
    }


    const handleCreateNewReview = () => {
        setUpdateReviewData(undefined)
        setIsUpdateReviewModalOpen(true)
    }

    useEffect(() => {
        if (restaurantLanguagesSelectData && restaurantLanguagesSelectData.length > 0) {
            setLanguageIdFilter(Number(restaurantLanguagesSelectData[0]?.value))
        }
    }, [restaurantLanguagesSelectData])
    




    return (
        <div>

            <div className="flex justify-between">
                <CustomComboSelect
                    data={restaurantLanguagesSelectData}
                    value={languageIdFilter?.toString() ?? null}
                    onValueChange={(v) => {
                        setLanguageIdFilter(v ? parseInt(v) : undefined)
                    }}
                    isFormSelect={false}
                />
                <Button onClick={handleCreateNewReview}>Create New Review</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviews?.map((review) => (
                        <TableRow key={review.id}>
                            <TableCell>{review.translations.find(t => t.languageId === languageIdFilter)?.title}</TableCell>
                            <TableCell>{review.translations.find(t => t.languageId === languageIdFilter)?.description}</TableCell>
                            <TableCell>
                                {review.isActive ? 'Active' : 'Inactive'}
                            </TableCell>
                            <TableCell>
                                {review.order}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            handleUpdateReviewModalOpen(review)
                                        }}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Düzenle</span>
                                        </DropdownMenuItem>

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {isUpdateReviewModalOpen && (
                <ReviewCrudModal
                    isOpen={isUpdateReviewModalOpen}
                setOpen={setIsUpdateReviewModalOpen}
                    reviewData={updateReviewData}
                />
            )}

            {
                createNewReviewModalOpen && (
                    <ReviewCrudModal
                        isOpen={createNewReviewModalOpen}
                        setOpen={setCreateNewReviewModalOpen}
                    />
                )
            }
        </div>
    )
}

