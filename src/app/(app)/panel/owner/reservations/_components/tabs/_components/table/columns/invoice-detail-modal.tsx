import { TReservationRow } from '@/lib/reservation'
import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

type Props = {
    reservation: TReservationRow
    isOpen: boolean
    setOpen: (open: boolean) => void
}

export const InvoiceDetailModal = ({
    reservation,
    isOpen,
    setOpen
}: Props) => {
    const invoiceData = [
        { label: 'Invoice Type', value: reservation.invoice?.invoiceType },
        { label: 'First Name', value: reservation.invoice?.invoiceFirstName },
        { label: 'Last Name', value: reservation.invoice?.invoiceLastName },
        { 
            label: 'Phone', 
            value: reservation.invoice?.phoneCode && reservation.invoice?.invoicePhone ? 
                `${reservation.invoice.phoneCode.phoneCode} - ${reservation.invoice.invoicePhone}` : 
                undefined 
        },
        { label: 'City', value: reservation.invoice?.city },
        { label: 'District', value: reservation.invoice?.district },
        { label: 'Neighbourhood', value: reservation.invoice?.neighbourhood },
        { label: 'Address', value: reservation.invoice?.address },
        { label: 'Company Name', value: reservation.invoice?.companyName },
        { label: 'Tax ID Number', value: reservation.invoice?.tin },
        { label: 'Tax Office', value: reservation.invoice?.taxOffice },
        { 
            label: 'E-Invoice Taxpayer', 
            value: reservation.invoice?.isEInvoiceTaxpayer !== undefined ? 
                (reservation.invoice.isEInvoiceTaxpayer ? 'Yes' : 'No') : 
                undefined 
        },
    ]

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className='md:max-w-[60vw] max-h-[90vh] overflow-y-auto'>
                <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Invoice Details</h3>
                    <Table>
                        <TableBody>
                            {invoiceData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className='font-medium'>{item.label}</TableCell>
                                    <TableCell>{item.value || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
