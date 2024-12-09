import { db } from "@/server/db";
import { tblInvoice, TInvoiceInsert } from "@/server/db/schema/reservation/invoice";
import { eq } from "drizzle-orm";
import { ReservationEntities } from ".";

const createInvoice = async (invoiceData: TInvoiceInsert) => {
    const invoice = await db.insert(tblInvoice).values(invoiceData).$returningId()
    if (!invoice[0]) throw new Error("Invoice not created")
    const invoiceId = invoice[0].id
    await ReservationEntities.updateReservation({
        reservationId: invoiceData.reservationId,
        data: {
            invoiceId
        }
    })
    return invoiceId
}

const getInvoiceById = async (id: number) => {
    const invoice = await db.query.tblInvoice.findFirst({
        where: eq(tblInvoice.id, id)
    })
    if (!invoice) throw new Error("Invoice not found")
    return invoice
}

const deleteInvoice = async (id: number) => {
    const invoice = await db.delete(tblInvoice).where(eq(tblInvoice.id, id))
    if (!invoice) throw new Error("Invoice not deleted")
    return invoice
}


export const invoiceEntity = {
    createInvoice,
    getInvoiceById,
    deleteInvoice
}