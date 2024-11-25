"use client";
import { useLayoutEffect, useState } from 'react';
import { RestaurantMealHours } from './restaurant-hours';
import RestaurantMealDays from './restaurant-meal-days';
import RestaurantMeals from './restaurant-meals';



const ReservationTimesTable = () => {

    return (
        <div className='flex flex-col gap-4'>
            <RestaurantMealHours />
            <RestaurantMeals />
            <RestaurantMealDays />
        </div>

    );
};

export default ReservationTimesTable;