import { env } from "@/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../schema/index";

import { TOwnerProcedureCtx } from "@/server/api/trpc";
import { guestEntities } from "@/server/layer/entities/guest";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { getRandom } from "@/server/utils/server-utils";
import { languagesData } from "@/shared/data/predefined";
import { EnumGender, EnumLanguage, EnumMealNumeric, EnumReservationPrepaymentNumeric, EnumTheme, EnumUserRole, EnumVipLevel } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { and, eq } from "drizzle-orm";

import { restaurantTagEntities } from "@/server/layer/entities/restaurant-tag";
import { RoomEntities } from "@/server/layer/entities/room";
import { tblUser } from "../../schema/user";
import { seedDatas } from "../seedData";
import { exit } from "process";



if (!env.DATABASE_URL)
    throw new Error("DATABASE_URL not found on .env.development");

const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

const reservationCount = 1
const guestCount = 5

const seedFunctions = [
    async function createUsers() {
        const result_admin = await db.insert(tblUser).values({
            email: 'admin@gmail.com',
            name: 'Admin',
            password: 'admin',
            role: EnumUserRole.admin
        }).$returningId()
        if (result_admin[0]?.id) console.log('Admin user created')

        const result = await db.insert(tblUser).values({
            email: 'user@gmail.com',
            name: 'User',
            password: 'user',
            role: EnumUserRole.user
        }).$returningId()
        if (result[0]?.id) console.log('User created')

        const result2 = await db.insert(tblUser).values({
            email: 'owner@gmail.com',
            name: 'Owner',
            password: 'owner',
            role: EnumUserRole.owner
        }).$returningId()

        const result2_2 = await db.insert(tblUser).values({
            email: 'owner2@gmail.com',
            name: 'Owner2',
            password: 'owner2',
            role: EnumUserRole.owner
        }).$returningId()

        if (result2[0]?.id) console.log('Owner2 created')
    },


    async function createGuests() {

        const brthdate=new Date();
        brthdate.setHours(0,0);

        console.log(brthdate, 'brthdate')

        for (let i = 1; i < guestCount; i++) {
            const createdAt = new Date()
            createdAt.setMinutes(getRandom(0, 59))
            const newGuest = await guestEntities.createGuest({
                guestData: {
                    name: `Guest ${i}`,
                    birthDate: brthdate,
                    countryId: 1,
                    email: `guest${i}@example.com`,
                    gender: EnumGender.male,
                    languageId: languagesData.find(a => a.languageCode === EnumLanguage.en)!.id,
                    restaurantId: 1,
                    surname: `Surname ${i}`,
                    phone: `5331234567`,
                    phoneCode: `+90`,
                    tagIds: [],
                    vipLevel: EnumVipLevel.goodSpender,
                    isSendReviewNotifs: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })
        }
        console.log('guests created')

    },
    async function createRestaurant() {
        console.log('createRestaurant started')
        const owner = await db.query.tblUser.findFirst({ where: eq(tblUser.email, 'owner@gmail.com') })
        const owner2 = await db.query.tblUser.findFirst({ where: eq(tblUser.email, 'owner2@gmail.com') })


        const restauran1Id = await restaurantEntities.createRestaurant({
            restaurant: {
                ...seedDatas.restaurant[0]!,
                ownerId: owner?.id!
            }
        })

        const restaurant1 = await db.query.tblRestaurant.findFirst({ where: eq(schema.tblRestaurant.id, restauran1Id) })

        await db.update(schema.tblRestaurantGeneralSetting).set({
            prePayemntPricePerGuest: 2000,
            restaurantId: restaurant1?.id!
        })

        await new Promise((resolve) => setTimeout(resolve, 1000))

        await restaurantEntities.createRestaurant({
            restaurant: {
                ...seedDatas.restaurant[1]!,
                ownerId: owner2?.id!
            }
        })


        await RoomEntities.createRoomWithTranslations({
            order: 1,
            restaurantId: 1,
            translations: [
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.tr)?.id!,
                    name: "Ana alan",
                    description: 'Ana alan description'
                },
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
                    name: "Main area",
                    description: 'Main area description'
                },
            ]
        })

        await RoomEntities.createRoomWithTranslations({
            order: 2,

            restaurantId: 1,
            translations: [
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.tr)?.id!,
                    name: "Sef",
                    description: 'Sef description'
                },
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
                    name: "Sef",
                    description: 'Sef description'
                },
            ]
        })

        await RoomEntities.createRoomWithTranslations({
            order: 3,
            restaurantId: 1,
            isWaitingRoom: true,
            translations: [
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.tr)?.id!,
                    name: "waiting room",
                    description: 'waiting room description'
                },
                {
                    languageId: languagesData.find(l => l.languageCode === EnumLanguage.en)?.id!,
                    name: "waiting room",
                    description: 'waiting room description'
                },
            ]
        })


        await RoomEntities.createTables({
            tables: new Array(20).fill(undefined).map((_, i) => ({
                maxCapacity: 2,
                minCapacity: 2,
                no: 'R1-' + i.toString(),
                order: i,
                roomId: 1,
                x: (i % 5),
                y: Math.floor(i / 5),
            })),
        })


        await RoomEntities.createTables({
            tables: new Array(2).fill(undefined).map((_, i) => ({
                maxCapacity: 2,
                minCapacity: 2,
                no: 'S-' + i.toString(),
                order: i,
                roomId: 2,
                x: (i % 5),
                y: Math.floor(i / 5),
            })),
        })

        const waitingRoom = await db.query.tblRoom.findFirst({ where: eq(schema.tblRoom.isWaitingRoom, true) })

        await RoomEntities.createTables({
            tables: new Array(10).fill(undefined).map((_, i) => ({
                maxCapacity: 2,
                minCapacity: 2,
                no: 'W-' + i.toString(),
                order: i,
                roomId: waitingRoom?.id!
            })),
        })


        seedDatas.hours.map(async (h) => {
            let hour = h
            await restaurantEntities.createMealHours({
                restaurantId: 1,
                mealHours: [
                    {
                        hour,
                        mealId: 3,
                        isOpen: true
                    }
                ]
            })

        })

        await Promise.all(
            seedDatas.reservationTags.map(async (tag) => {
                await restaurantTagEntities.createRestaurantTag({
                    tag: { restaurantId: 1 },
                    translations: tag.translations
                })
            })
        )







    },
    async function createNotificationsTables() {
        console.log('createNotificationsTables started')

        for (const language of languagesData) {

            await db.insert(schema.tblPrepaymentMessage).values({
                languageId: language.id,
                restaurantId: 1,
                prepaymentMessage: 'Prepayment message @Client @Date @Link @Restaurant ' + language.languageCode,
                prepaymentCancellationMessage: 'Prepayment cancellation message @Client @Date @Link @Restaurant ' + language.languageCode,
                prepaymentReminderMessage: 'Prepayment reminder message @Client @Date @Link @Restaurant ' + language.languageCode,
                prepaymentRefundMessage: 'Prepayment refund message @Client @Date @Link @Restaurant ' + language.languageCode,
                prepaymentReceivedMessage: 'Prepayment received message @Client @Date @Link @Restaurant ' + language.languageCode,
                accountPaymentRequestMessage: 'Account payment request message @Client @Date @Link @Restaurant ' + language.languageCode,
                accountPaymentSuccessMessage: 'Account payment success message @Client @Date @Link @Restaurant ' + language.languageCode,
            })


            await db.insert(schema.tblReservationMessage).values({
                languageId: language.id,
                restaurantId: 1,
                newReservationMessage: 'New reservation message @Client @Date @Link @Restaurant ' + language.languageCode,
                dateTimeChangeMessage: 'Date time change message @Client @Date @Link @Restaurant ' + language.languageCode,
                guestCountChangeMessage: 'Guest count change message @Client @Date @Link @Restaurant ' + language.languageCode,
                reservationCancellationMessage: 'Reservation cancellation message @Client @Date @Link @Restaurant ' + language.languageCode,
                reservationConfirmationRequestMessage: 'Reservation confirmation request message @Client @Date @Link @Restaurant ' + language.languageCode,
                reservationCancellationWithReasonMessage: 'Reservation cancellation with reason message @Client @Date @Link @Restaurant ' + language.languageCode,
                reservationReminderMessage: 'Reservation reminder message @Client @Date @Link @Restaurant ' + language.languageCode,
                reservationFeedbackRequestMessage: 'Reservation feedback request message @Client @Date @Link @Restaurant ' + language.languageCode,
                reservationConfirmedMessage: 'Reservation confirmed message @Client @Date @Link @Restaurant ' + language.languageCode,
            })

            await db.insert(schema.tblRestaurantTexts).values({
                restaurantId: 1,
                languageId: language.id,
                agreements: 'Agreements',
                dressCode: 'Dress code',
                reservationRequirements: 'Reservation requirements',
            })

            await db.insert(schema.tblWaitlistMessage).values({
                restaurantId: 1,
                languageId: language.id,
                addedToWaitlistMessage: 'Added to waitlist message @Client @Date @Link @Restaurant ' + language.languageCode,
                addedToWaitlistWalkinMessage: 'Added to waitlist walkin message @Client @Date @Link @Restaurant ' + language.languageCode,
                calledFromWaitlistMessage: 'Called from waitlist message @Client @Date @Link @Restaurant ' + language.languageCode,
            })
        }




    },
    async function createReservations() {
        console.log('createReservations started')
        const guestsData = await guestEntities.guestsPagination({
            paginationQuery: {
                pagination: {
                    page: 1,
                    limit: 20
                },
                filters: {}
            },
            restaurantId: 1
        })

        const guests = guestsData.data


        const nonWaitingRooms = await db.query.tblRoom.findFirst({
            where: and(
                eq(schema.tblRoom.restaurantId, 1),
                eq(schema.tblRoom.isWaitingRoom, false)
            ),
        })

        const firstNonWaitingRoomId = nonWaitingRooms?.id!

        const roomTables = (await db.query.tblTable.findMany({
            where: eq(schema.tblTable.roomId, firstNonWaitingRoomId)
        }))

        const mealId = EnumMealNumeric.dinner
        const mealHours = await restaurantEntities.getMealHours({ restaurantId: 1 })
        const dinnerMealHours = mealHours.find(m => m.meal.id == mealId)?.mealHours?.map(m => m.hour)!
        const ownerCtx: TOwnerProcedureCtx = {
            headers: new Headers(),
            session: {
                user: {
                    restaurantId: 1,
                    userId: 2, //owner
                    userRole: EnumUserRole.owner
                },
            },
            userPrefrences: {
                theme: EnumTheme.light,
                language: languagesData.find(l => l.languageCode === EnumLanguage.en)!
            },
            restaurantId: 1
        }


        const reservationCreateionCount = reservationCount / roomTables.length
        const firstReservationDate = new Date()

        for (let i = 0; i < reservationCreateionCount; i++) {
            const randomGuest = guests[getRandom(0, guests.length - 1)]
            const newDate = new Date(firstReservationDate)
            newDate.setDate(firstReservationDate.getDate() + i)
            const getNewDateYear = newDate.getFullYear()
            if (getNewDateYear === 2038) {
                newDate.setFullYear(2039)
            }
            const promises = roomTables.map(async (table, index) => {
                const tableId = table.id
                const hour = dinnerMealHours[getRandom(0, dinnerMealHours.length - 1)]!
                newDate.setHours(Number(hour.split(':')[0]!), Number(hour.split(':')[1]!))
                const input: TReservationValidator.createReservation = {
                    data: {
                        reservationTagIds: [],
                        tableIds: [tableId],
                    },
                    reservationData: {
                        guestCount: getRandom(1, 4),
                        guestId: randomGuest?.id!,
                        mealId: mealId,
                        prepaymentTypeId: EnumReservationPrepaymentNumeric.none,
                        reservationDate: newDate,
                        hour: hour,
                        isSendSms: false,
                        isSendEmail: false,
                        roomId: firstNonWaitingRoomId
                    }
                }


                await reservationUseCases.createReservation({
                    input,
                    ctx: ownerCtx
                })


            })

            await Promise.all(promises)


        }

        console.log('createReservations finished')

    },
]




async function seed() {
    for (const fn of seedFunctions) {
        await fn()
    }
    
    await connection.end()
    exit()
}

seed()