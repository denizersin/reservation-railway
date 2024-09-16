import { env } from "@/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from "../schema/index";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});



async function initDb() {
    try {


        // restaurantEntities.createRestaurant({
        //     restaurant: {
        //         name: 'restaurant',
        //         phoneNumber: '123456789',
        //         translations: []
        //     }
        // })

        await restaurantEntities.setDefaultsToRestaurant({
            restaurantId:1
        })

        console.log('setting defaults to restaurant')



    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()