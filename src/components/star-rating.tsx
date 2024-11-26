import React from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { StarIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { Star } from 'lucide-react'

interface StarRatingProps<T extends FieldValues> {
    field?: ControllerRenderProps<T, any>;
    defaultValue?: string;
    onRatingChange?: (value: string) => void;
    value?: string;
    disabled?: boolean;
    className?: string;
    name?: string;
}

const StarRating = <T extends FieldValues>({
    onRatingChange,
    disabled = false,
    className,
    value,
    name
}: StarRatingProps<T>) => {
    const ratings = [1, 2, 3, 4, 5]

    const handleValueChange = (newValue: string) => {
        if (onRatingChange) {
            onRatingChange(newValue)
        }
    }

    return (
        <div className={cn("", className)}>
            <RadioGroup
                aria-label="Rating"
                disabled={disabled}
                value={value}
                onValueChange={handleValueChange}
                className="flex items-center gap-2"
                name={name}
            >
                {ratings.map((rating) => (
                    <div key={rating} className="relative">
                        <RadioGroupItem
                            value={rating.toString()}
                            id={`rating-${rating}-${name}`}
                            className="peer sr-only"
                        />
                        <Label
                            htmlFor={`rating-${rating}-${name}`}
                            className="cursor-pointer"
                            title={`${rating} star${rating === 1 ? '' : 's'}`}
                        >
                            <Star stroke={'2'} className={cn(
                                "size-8 transition-colors",
                                value && Number(value) >= rating ? " fill-front-primary stroke-front-primary" : "fill-transparent stroke-front-primary"
                            )} />
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    )
}

export { StarRating }
export type { StarRatingProps }