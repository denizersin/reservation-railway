import { EnumGender, EnumLanguage, EnumMealNumeric, EnumReservationStatusNumeric, EnumVipLevel } from "@/shared/enums/predefined-enums"
import TRestaurantTagValidator from "@/shared/validators/restaurant-tag"
import { TGuestCompanyInsert, TGuestInsert, TPersonelInsert, TReservationInsert } from "../schema"
import { TCountryInsert, TLanguageInsert } from "../schema/predefined"
import { TRestaurantInsert } from "../schema/restaurant"
import { languagesData } from "@/shared/data/predefined"
import { restaurantEntities } from "@/server/layer/entities/restaurant"
import { RoomEntities } from "@/server/layer/entities/room"
import { guestEntities } from "@/server/layer/entities/guest"

const countries = [
    {
        name: 'turkey',
        code: 'tr',
        phoneCode: '+90'
    }, {
        name: 'usa',
        code: 'us',
        phoneCode: '+1'
    },
    {
        name: 'germany',
        code: 'de',
        phoneCode: '+49'
    }
] as TCountryInsert[]

const languages = [
    {
        languageCode: 'tr',
        name: 'turkish',
        isRtl: false
    },
    {
        languageCode: 'en',
        name: 'english',
        isRtl: false
    },
    {
        languageCode: 'de',
        name: 'german',
        isRtl: false
    }
] as TLanguageInsert[]

export const restaurant = [
    {
        name: 'burger-king',
        phoneNumber: '+905555555555',
        id: 1
    }, {
        name: 'kfc',
        phoneNumber: '+905555555555',
        id: 2
    }

] as TRestaurantInsert[]

const getGuestCompanies = (restaurantId: number) => new Array(10).fill(0).map((_, index) => ({
    companyName: `guestCompany${index}`,
    restaurantId
})) as TGuestCompanyInsert[]

export const getGuests = (restaurantId: number) => new Array(40).fill(0).map((_, index) => ({
    name: `guest${index}`,
    surname: `guest${index}`,
    countryId: 1,
    birthDate: new Date(),
    email: `guest${index}@gmail.comz`,
    languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.en)!.id,
    phone: '123',
    gender: EnumGender.male,
    restaurantId,
})) as TGuestInsert[]


export const getPersonels = (restaurantId: number) => new Array(8).fill(0).map((_, index) => ({
    fullName: `personel${index}`,
    restaurantId,
})) as TPersonelInsert[]

export const reservationTags = [
    {
        translations: [
            {
                name: 'Dogum gunu',
                code: 'dgm',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.tr)!.id
            },
            {
                name: 'Birthday',
                code: 'bday',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.en)!.id
            }

        ]
    },
    {
        translations: [
            {
                name: 'Anniversary',
                code: 'anv',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.en)!.id
            },
            {
                name: 'Yildonumu',
                code: 'yld',
                languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.tr)!.id
            }
        ]
    },
] as TRestaurantTagValidator.createRestaurantTagFormSchema[]


// [{
//     name: 'guest1',
//     countryId: 1,
//     gender: EnumGender.male,
//     languageId: 1,
//     phone: '123',
//     restaurantId: 2,
//     surname: 'guest1',
//     tagIds: [],
//     vipLevel: EnumVipLevel.goodSpender,
//     birthDate: new Date(),
//     email: 'guest1@gmail.com',

// }] as unknown as TGuestInsert[]

const hours = [
    "18:00",
    "18:30",
    "18:45",
    "19:00",
]


async function f() {

    const mealHoursData = await restaurantEntities.getMealHours({ restaurantId: 1 })
    const mealHours = mealHoursData.find(mealHour => mealHour.meal.id === EnumMealNumeric.dinner)?.mealHours?.map(mealHour => mealHour.hour)

    const roomIdsData = await RoomEntities.getRooms({ restaurantId: 1, languageId: languagesData.find(lang => lang.languageCode === EnumLanguage.tr)!.id })
    const roomIds = roomIdsData.map(room => room.id)

    const roomTables: { roomId: number, tableId: number }[] = []

    for (const roomId of roomIds) {
        const tables = await RoomEntities.getTablesByRoomId({ roomId })
        roomTables.push(...tables.map(table => ({ roomId, tableId: table.id })))
    }

    const guests = await guestEntities.guestsPagination({
        restaurantId: 1,
        paginationQuery: {
            pagination: {
                page: 1,
                limit: 100
            },
            filters: {}
        }
    })


    const newReservations: TReservationInsert = {
        guestCount: 2,
        guestId: 1,
        restaurantId: 1,
        roomId: 1,
        mealId: EnumMealNumeric.dinner,
        reservationStatusId: EnumReservationStatusNumeric.reservation,
        hour: mealHours?.[0]!,
        isSendEmail: true,
        isSendSms: true,
        reservationDate: new Date(),
        waitingSessionId: 1,
        prePaymentTypeId: 1,
        tableIds: [roomTables?.[0]?.tableId!],
    }

    



}



export const seedDatas = {
    countries,
    languages,
    restaurant,
    getGuests,
    hours,
    reservationTags,
    getPersonels,
    getGuestCompanies
}
