import { COLORS } from "@/lib/constants";
import { languagesData } from "@/shared/data/predefined";
import TRestaurantTagValidator from "@/shared/validators/restaurant-tag";
import { getRandom } from "../utils/server-utils";
import { EnumLanguage } from "@/shared/enums/predefined-enums";

export const reservationTags = [
    {
        color: COLORS[getRandom(0, COLORS.length - 1)]!.value,
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
        color: COLORS[getRandom(0, COLORS.length - 1)]!.value,
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
