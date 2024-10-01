"use client";
import { RestaurantMealHours } from './restaurant-hours';
import RestaurantMealDays from './restaurant-meal-days';
import RestaurantMeals from './restaurant-meals';



const ReservationTimesTable = () => {


    return (
        <div>
            <RestaurantMealHours />
            <RestaurantMeals />
            <RestaurantMealDays />
        </div>

    );
};

export default ReservationTimesTable;