import { getEnumValues } from '@/server/utils/server-utils';
import { EnumGender, EnumVipLevel } from '@/shared/enums/predefined-enums';
import { relations } from 'drizzle-orm';
import { int, mysqlEnum, mysqlTable, uniqueIndex, varchar, serial, timestamp, unique, boolean, date } from 'drizzle-orm/mysql-core';
import { tblRestaurantTag } from './restaurant-tags';
import { tblRestaurant } from './restaurant';
import { tblCountry, tblLanguage, TCountry, TLanguage } from './predefined';




export const tblGuest = mysqlTable('guest', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    languageId: int('language_id').notNull(),
    countryId: int('country_id').notNull(),

    name: varchar('name', { length: 256 }).notNull(),
    surname: varchar('surname', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    phone: varchar('phone', { length: 256 }).notNull(),
    stablePhone: varchar('stable_phone', { length: 256 }),
    gender: mysqlEnum('gender', getEnumValues(EnumGender)).notNull(),
    birthDate: date('birth_date').notNull(),
    anniversaryDate: date('anniversary_date'),
    description: varchar('description', { length: 256 }),

    //assitan information
    assistantName: varchar('assistant_name', { length: 256 }),
    assistantPhone: varchar('assistant_phone', { length: 256 }),
    assistantEmail: varchar('assistant_email', { length: 256 }),

    //company information
    companyId: int('company_id'),
    position: varchar('position', { length: 256 }),
    department: varchar('department', { length: 256 }),

    //vip information
    isVip: boolean('is_vip').notNull().default(false),
    vipLevel: mysqlEnum('vip_level', getEnumValues(EnumVipLevel)).notNull(),

    //notification information
    isSendSmsAndEmail: boolean('is_send_sms_and_email').notNull().default(true),
    isSendConfirmationNotifs: boolean('is_send_confirmation_notifs').notNull().default(true),
    isClaimProvision: boolean('is_claim_provision').notNull().default(true),

    isSendReviewNotifs: boolean('is_send_review_notifs').notNull().default(true),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const tblGuestRelations = relations(tblGuest, ({ one, many }) => ({
    company: one(tblGusetCompany, { fields: [tblGuest.companyId], references: [tblGusetCompany.id] }),
    restaurant: one(tblRestaurant, { fields: [tblGuest.restaurantId], references: [tblRestaurant.id] }),
    language: one(tblLanguage, { fields: [tblGuest.languageId], references: [tblLanguage.id] }),
    country: one(tblCountry, { fields: [tblGuest.countryId], references: [tblCountry.id] }),

    tags: many(tblGuestTags),
}));




export const tblGusetCompany = mysqlTable('guest_company', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    companyName: varchar('company_name', { length: 256 }).notNull(),
    phone: varchar('phone', { length: 256 }),
    email: varchar('email', { length: 256 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type TGusetCompanyInsert = typeof tblGusetCompany.$inferInsert;
export type TGusetCompany = typeof tblGusetCompany.$inferSelect;

export const tblGuestTags = mysqlTable('guest_tags', {
    id: int('id').autoincrement().primaryKey(),
    guestId: int('guest_id').notNull(),
    tagId: int('tag_id').notNull(),
});

export const tblGuestTagsRelations = relations(tblGuestTags, ({ one }) => ({
    guest: one(tblGuest, { fields: [tblGuestTags.guestId], references: [tblGuest.id] }),
    tag: one(tblRestaurantTag, { fields: [tblGuestTags.tagId], references: [tblRestaurantTag.id] }),
}));


type Guest = typeof tblGuest.$inferSelect;
type GuestInsert = typeof tblGuest.$inferInsert;


type GuestTag = typeof tblGuestTags.$inferSelect;



export type TGuestInsert = GuestInsert & {
    tagIds: number[]
};


export type TGuest = Guest & {
    tags: GuestTag[]
    country: TCountry
    language: TLanguage
    company: TGusetCompany | null
};



export const tblPersonel = mysqlTable('personel', {
    id: int('id').autoincrement().primaryKey(),
    restaurantId: int('restaurant_id').notNull(),
    fullName: varchar('full_name', { length: 256 }).notNull(),
    phone: varchar('phone', { length: 256 }),
    email: varchar('email', { length: 256 }),
    birthDate: date('birth_date'),
    specialId: varchar('special_id', { length: 256 }),
});

export type TPersonelInsert = typeof tblPersonel.$inferInsert;
export type TPersonel = typeof tblPersonel.$inferSelect;