
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/server/trpc/react';
import { TRestaurantMeal } from '@/server/db/schema';

interface MealTabsProps {
    selectedMeal: TRestaurantMeal | undefined;
    setSelectedMeal: (meal: TRestaurantMeal) => void;
}

const MealTabs: React.FC<MealTabsProps> = ({ selectedMeal, setSelectedMeal }) => {
    const { data: meals } = api.restaurant.getRestaurantMeals.useQuery();

    return (
        <Tabs
            onValueChange={(value) => setSelectedMeal(meals?.find((meal) => meal.id.toString() === value)!)}
            defaultValue={selectedMeal?.id.toString()}
            value={selectedMeal?.id.toString()}
            className="mt-0"
        >
            <TabsList>
                {meals?.map((meal) => (
                    <TabsTrigger key={meal.id} value={meal.id.toString()}>
                        {meal.meal.name}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};

export default MealTabs;
