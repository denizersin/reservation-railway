import { mysqlTable, varchar, boolean, int, mysqlEnum } from "drizzle-orm/mysql-core"
import { relations } from "drizzle-orm"
import { tblReservation } from "."
import { getEnumValues } from "@/server/utils/server-utils"
import { EnumInvoiceType } from "@/shared/enums/predefined-enums"
import { tblCountry } from "../predefined"
// invoiceType: z.enum(["individual", "corporate"]).optional(),
// invoiceFirstName: z.string().optional(),
// invoiceLastName: z.string().optional(),
// invoicePhoneCodeId: z.string().optional(),
// invoicePhone: z.string().optional(),
// city: z.string().optional(),
// district: z.string().optional(),
// neighbourhood: z.string().optional(),
// address: z.string().optional(),
// tin: z.string().optional(),
// taxOffice: z.string().optional(),
// companyName: z.string().optional(),
// isEInvoiceTaxpayer: z.boolean().optional(),
export const tblInvoice = mysqlTable("invoices", {
  id: int("id").primaryKey().autoincrement(),
  reservationId: int("reservation_id").notNull(),

  // Invoice type
  invoiceType: mysqlEnum('invoice_type', getEnumValues(EnumInvoiceType)),

  // Personal info
  invoiceFirstName: varchar("invoice_first_name", { length: 256 }),
  invoiceLastName: varchar("invoice_last_name", { length: 256 }),
  invoicePhoneCodeId: int("invoice_phone_code_id"),
  invoicePhone: varchar("invoice_phone", { length: 20 }),

  // Address info
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  neighbourhood: varchar("neighbourhood", { length: 100 }),
  address: varchar("address", { length: 500 }),

  // Company info
  companyName: varchar("company_name", { length: 256 }),
  tin: varchar("tax_identification_number", { length: 50 }), // Tax Identification Number
  taxOffice: varchar("tax_office", { length: 256 }),
  isEInvoiceTaxpayer: boolean("is_e_invoice_taxpayer").default(false),
})

export const invoicesRelations = relations(tblInvoice, ({ one }) => ({
  reservation: one(tblReservation, {
    fields: [tblInvoice.reservationId],
    references: [tblReservation.id],
  }),
  phoneCode: one(tblCountry, {
    fields: [tblInvoice.invoicePhoneCodeId],
    references: [tblCountry.id],
  }),
}))


export type TInvoiceSelect = typeof tblInvoice.$inferSelect
export type TInvoiceInsert = typeof tblInvoice.$inferInsert