import { TCountryInsert, TLanguageInsert } from "../schema/predefined"
import { TRestaurantInsert } from "../schema/restaurant"

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
    }, {
        name: 'kfc',
        phoneNumber: '+905555555555',
    }

] as TRestaurantInsert[]




export const seedDatas = {
    countries,
    languages,
    restaurant
}