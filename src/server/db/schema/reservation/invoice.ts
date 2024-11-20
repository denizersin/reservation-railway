import { mysqlTable, varchar, boolean, int } from "drizzle-orm/mysql-core"
import { relations } from "drizzle-orm"
import { tblReservation } from "."

export const tblInvoice = mysqlTable("invoices", {
  id: int("id").primaryKey().autoincrement(),
  reservationId: int("reservation_id").notNull(),
  
  // Invoice type
  invoiceType: varchar("invoice_type", { length: 20 }).notNull(), // "individual" or "corporate"
  
  // Personal info
  invoiceFirstName: varchar("invoice_first_name", { length: 256 }),
  invoiceLastName: varchar("invoice_last_name", { length: 256 }),
  invoicePhoneCode: varchar("invoice_phone_code", { length: 10 }),
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
}))
