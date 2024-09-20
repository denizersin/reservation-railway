import { TRestaurantLanguages } from '@/server/db/schema/restaurant';
import { createContext, ReactNode, useContext } from 'react';

type TagsPageDataProvider = {
    restaurantLanguages: TRestaurantLanguages;
};

const TagsPageDataContext = createContext<TagsPageDataProvider | undefined>(undefined);

export function useTagsPageData() {
    const context = useContext(TagsPageDataContext);
    if (context === undefined) {
        throw new Error('useTagsPageData must be used within a TagsPageDataProvider');
    }
    return context;
}

type TagsPageDataProviderProps = {
    children: ReactNode;
    restaurantLanguages: TRestaurantLanguages;
};

export function TagsPageDataProvider({
    children,
    restaurantLanguages
}: TagsPageDataProviderProps) {

    const value = {
        restaurantLanguages: restaurantLanguages || [],
    };

    return (
        <TagsPageDataContext.Provider value={value}>
            {children}
        </TagsPageDataContext.Provider>
    );
}