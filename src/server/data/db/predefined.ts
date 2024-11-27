import { TCountryInsert, TLanguageInsert } from "@/server/db/schema"
import codeData from "@/shared/data/country-code.json"

const countryCodeData = codeData as {
    name: string
    phoneCode: string
    code: string
  }[]

const countries = countryCodeData as TCountryInsert[]

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













export const predefinedData = {
    countries,
    languages,
}
