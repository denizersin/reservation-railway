import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/server/trpc/react';

interface MealTabsProps {
    selectedMealId: number | undefined;
    setSelectedMealId: (mealId: number | undefined) => void;
    disabled?: boolean
}

const MealTabs: React.FC<MealTabsProps> = ({ disabled, selectedMealId, setSelectedMealId }) => {
    const { data: meals } = api.restaurant.getRestaurantMeals.useQuery();

    useEffect(() => {
        if (meals && !selectedMealId) {
            setSelectedMealId(meals[0]?.mealId)
        }
    }, [meals])

    return (
        <Tabs
            onValueChange={(value) => !disabled && setSelectedMealId(Number(value))}
            defaultValue={selectedMealId?.toString()}
            value={selectedMealId?.toString()}
            className="mt-0"
            
        >
            <TabsList>
                {meals?.map((meal) => (
                    <TabsTrigger key={meal.mealId} value={meal.mealId.toString()}>
                        {meal.meal.name}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};

export default MealTabs;
