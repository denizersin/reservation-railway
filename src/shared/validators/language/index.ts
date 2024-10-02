import { z } from 'zod';

// Reservation Messages
const reservationMessagesFormSchema = z.object({
    newReservationMessage: z.string().optional().nullable(),
    dateTimeChangeMessage: z.string().optional().nullable(),
    guestCountChangeMessage: z.string().optional().nullable(),
    reservationCancellationMessage: z.string().optional().nullable(),
    reservationCancellationWithReasonMessage: z.string().optional().nullable(),
    reservationConfirmationRequestMessage: z.string().optional().nullable(),
    reservationConfirmedMessage: z.string().optional().nullable(),
    reservationReminderMessage: z.string().optional().nullable(),
    reservationFeedbackRequestMessage: z.string().optional().nullable(),
    cakeReceivedMessage: z.string().optional().nullable(),
    flowerReceivedMessage: z.string().optional().nullable(),
});

const updateReservationMessagesSchema = z.object({
    languageId: z.number().int().positive(),
    reservationMessages: reservationMessagesFormSchema
});

// Provision Messages

const provisionMessagesFormSchema = z.object({
    provisionMessage: z.string().optional().nullable(),
    provisionReminderMessage: z.string().optional().nullable(),
    provisionReceivedMessage: z.string().optional().nullable(),
    provisionCancellationMessage: z.string().optional().nullable(),
    provisionRefundMessage: z.string().optional().nullable(),
    provisionChargeMessage: z.string().optional().nullable(),
    chargeRefundMessage: z.string().optional().nullable(),
});

const updateProvisionMessagesSchema = z.object({
    languageId: z.number(),
    provisionMessage: provisionMessagesFormSchema,
});

// Add this new schema
const waitlistMessagesFormSchema = z.object({
    addedToWaitlistMessage: z.string().optional().nullable(),
    addedToWaitlistWalkinMessage: z.string().optional().nullable(),
    calledFromWaitlistMessage: z.string().optional().nullable(),
});

const updateWaitlistMessagesSchema = z.object({
    languageId: z.number(),
    waitlistMessage: waitlistMessagesFormSchema,
});

// Prepayment Messages
const prepaymentMessagesFormSchema = z.object({
    prepaymentMessage: z.string().optional().nullable(),
    prepaymentCancellationMessage: z.string().optional().nullable(),
    prepaymentReminderMessage: z.string().optional().nullable(),
    prepaymentRefundMessage: z.string().optional().nullable(),
    prepaymentReceivedMessage: z.string().optional().nullable(),
    accountPaymentRequestMessage: z.string().optional().nullable(),
    accountPaymentSuccessMessage: z.string().optional().nullable(),
});

const updatePrepaymentMessagesSchema = z.object({
    languageId: z.number(),
    prepaymentMessage: prepaymentMessagesFormSchema,
});

const restaurantTextsFormSchema = z.object({
    reservationRequirements: z.string().nullable().optional(),
    dressCode: z.string().nullable().optional(),
    agreements: z.string().nullable().optional(),
});


const updateRestaurantTextsSchema = z.object({
    languageId: z.number(),
    restaurantTexts: restaurantTextsFormSchema,
});


export const restaurantMessagesValidators = {
    // Reservation Messages
    updateReservationMessagesSchema,
    reservationMessagesFormSchema,
    // Provision Messages
    updateProvisionMessagesSchema,
    provisionMessagesFormSchema,

    // Waitlist Messages
    updateWaitlistMessagesSchema,
    waitlistMessagesFormSchema,

    // Prepayment Messages
    updatePrepaymentMessagesSchema,
    prepaymentMessagesFormSchema,


    updateRestaurantTextsSchema,
    restaurantTextsFormSchema,
}

// Update the TRestaurantMessagesValidator namespace
namespace TRestaurantMessagesValidator {

    export type reservationMessagesFormSchema = z.infer<typeof reservationMessagesFormSchema>
    export type updateReservationMessagesSchema = z.infer<typeof updateReservationMessagesSchema>

    export type provisionMessagesFormSchema = z.infer<typeof provisionMessagesFormSchema>
    export type updateProvisionMessagesSchema = z.infer<typeof updateProvisionMessagesSchema>

    // ... existing types
    export type updateWaitlistMessagesSchema = z.infer<typeof updateWaitlistMessagesSchema>
    export type waitlistMessagesFormSchema = z.infer<typeof waitlistMessagesFormSchema>

    // Prepayment Messages
    export type updatePrepaymentMessagesSchema = z.infer<typeof updatePrepaymentMessagesSchema>
    export type prepaymentMessagesFormSchema = z.infer<typeof prepaymentMessagesFormSchema>

    export type restaurantTextsFormSchema = z.infer<typeof restaurantTextsFormSchema>;
    export type TUpdateRestaurantTexts = z.infer<typeof updateRestaurantTextsSchema>;
}

export default TRestaurantMessagesValidator

