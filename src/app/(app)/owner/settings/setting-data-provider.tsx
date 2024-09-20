"use client"
import { TCountry, TLanguage, TMeal, TReservationStatus } from '@/server/db/schema/predefined';
import { TRestaurantLanguages } from '@/server/db/schema/restaurant';
import { api } from '@/server/trpc/react';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the settings data
interface SettingsData {
    meals: TMeal[]
    countries: TCountry[]
    restaurantLanguages: TRestaurantLanguages
    reservationStatues: TReservationStatus[]
    languages:TLanguage[]
    // Add other settings fields as needed
}

// Create a context with a default value
const SettingDataContext = createContext<SettingsData | undefined>(undefined);

// Create a provider component
interface SettingDataProviderProps extends SettingsData {
    children: ReactNode;
}

export const SettingDataProvider: React.FC<SettingDataProviderProps> = ({ children, ...value }) => {

    const { meals, countries, restaurantLanguages, reservationStatues } = value;

    

    api.predefiend.getCountries.useQuery(void {}, {
        initialData: countries
    })

    api.reservation.getReservationSatues.useQuery(void {}, {
        initialData: reservationStatues
    })

    api.restaurant.getMeals.useQuery(void {}, {
        initialData: meals
    })

    api.restaurant.getLanguages.useQuery(void {}, {
        initialData: restaurantLanguages
    })

    return (
        <SettingDataContext.Provider value={value}>
            {children}
        </SettingDataContext.Provider>
    );
};

// Create a custom hook to use the settings data
export const useSettingData = (): SettingsData => {
    const context = useContext(SettingDataContext);
    if (context === undefined) {
        throw new Error('useSettingData must be used within a SettingDataProvider');
    }
    return context;
};