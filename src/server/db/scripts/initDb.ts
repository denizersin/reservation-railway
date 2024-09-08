import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from "../schema";
import { env } from "@/env";
import { EnumUserRole, tblUser } from "../schema/user";
import { tblMeal, tblMealTranslations } from "../schema/restaurant-setting";
import { eq } from "drizzle-orm";
import { tblRestaurantTranslations, tblResturant } from "../schema/restaurant";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

const seedFunctions = [
    async function createAdmin() {
        const result = await db.insert(tblUser).values({
            email: 'admin@gmail.com',
            password: 'admin',
            role: EnumUserRole.admin
        }).$returningId()
        if (result[0]?.id) console.log('Admin user created')
    },

    async function createUser() {

        const result = await db.insert(tblUser).values({
            email: 'user@gmail.com',
            password: 'user',
            role: EnumUserRole.user
        }).$returningId()
        if (result[0]?.id) console.log('User created')
    },

    async function createMeals() {
        const meals = ["Kahvaltı", "Öğle Yemeği", "Akşam Yemeği", "Bar"]
        for (const mealName of meals) {
            const [r1] = await db.insert(tblMeal).values({}).$returningId()
            if (!r1?.id) return;
            const meal = await db.query.tblMeal.findFirst({ where: eq(tblMeal.id, r1.id) })
            if (!meal) return
            await db.insert(tblMealTranslations).values({
                mealId: meal.id,
                name: mealName,
                languageCode: 'tr',
                description: 'desc'
            })
        }
        console.log(' meals created')
    },
    // async function createRestaurant() {
    //     const [r1] = await db.insert(tblResturant).values({
    //         phoneNumber: '1234567890',
    //         name: 'Restaurant'
    //     }).$returningId()
    //     if (!r1?.id) return;
    //     const restaurant = await db.query.tblResturant.findFirst({ where: eq(tblResturant.id, r1.id) })
    //     if (!restaurant) return
    //     await db.insert(tblRestaurantTranslations).values({
    //         restaurantId: restaurant.id,
    //         languageCode: 'tr',
    //         description: 'desc'
    //     })
    // }
].filter(Boolean)

async function initDb() {
    try {
        //seed data
        for (const func of seedFunctions) {
            await func()
        }
    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()