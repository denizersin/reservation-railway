import { EnumGender, EnumLanguage, EnumVipLevel } from "@/shared/enums/predefined-enums"
import TRestaurantTagValidator from "@/shared/validators/restaurant-tag"
import { TGuestInsert, TPersonelInsert } from "../schema"
import { TCountryInsert, TLanguageInsert } from "../schema/predefined"
import { TRestaurantInsert } from "../schema/restaurant"
import { languagesData } from "@/shared/data/predefined"

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




export const seedDatas = {
    countries,
    languages,
    restaurant,
    getGuests,
    hours,
    reservationTags,
    getPersonels
}
