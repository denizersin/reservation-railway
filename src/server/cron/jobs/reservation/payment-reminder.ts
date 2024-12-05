import { env } from '@/env';
import { TRestaurantPaymentSettingSelect } from '@/server/db/schema';
import { paymentSettingEntities } from '@/server/layer/entities/restaurant-setting';
import { notificationUseCases } from '@/server/layer/use-cases/reservation/notification';
import * as schedule from 'node-schedule';
import { activeJobs, jobsData, type JobType } from '../config';
import { getReservationsToRemind, getRestaurantPrepaymentSettingMap, TReminderReservationRecord } from '../queries/reservation';

let currentLastProcessedId = 0;

export async function processPaymentReminderJobBatch(
    lastProcessedId = currentLastProcessedId
) {
    try {
        const restaurantPrepaymentSettingMap = await getRestaurantPrepaymentSettingMap()

        const result = await getReservationsToRemind({
            date: new Date(),
            lastProcessedId: lastProcessedId,
            pageSize: 100
        });

        console.log(result.reservations.map((reservation) => reservation.reservation.id), 'cron result payment reminder')
        activeJobs.forEach((job) => {
            
        })

        for (const reservation of result.reservations) {
            const reminderJobId = `${reservation.reservation.id}-reminder`;

            // Reminder job scheduling
            if (!activeJobs.has(reminderJobId)) {
                const jobData = await getPaymentReminderJob({ record: reservation, restaurantPaymentSetting: restaurantPrepaymentSettingMap.get(reservation.restaurant.id)! })
                schedulePaymentReminder(jobData);
            }
        }

        currentLastProcessedId = result.hasMore
            ? result.lastProcessedId
            : 0;

    } catch (error) {
        console.error('Error processing reminder batch:', error);
        currentLastProcessedId = 0;
    }
}

function schedulePaymentReminder(jobData: JobType) {
    console.dir(jobData, 'reminder job scheduled')
    const job = schedule.scheduleJob(jobData.executeAt, async () => {
        try {
            await notificationUseCases.handleNotifyPrepayment({
                reservationId: jobData.data.reservationId,
                withEmail: true,
                withSms: true,
            });
        } finally {
            activeJobs.delete(jobData.id);
            jobsData.delete(jobData.id);
        }
    });

    activeJobs.set(jobData.id, job);
    jobsData.set(jobData.id, jobData);
}

export const getPaymentReminderJob = async ({ record, restaurantPaymentSetting }: {
    record: TReminderReservationRecord
    restaurantPaymentSetting?: TRestaurantPaymentSettingSelect
}): Promise<JobType> => {
    const { reservation, restaurant } = record;
    const reminderJobId = `${reservation.id}-reminder`;

    let paymentSetting = restaurantPaymentSetting;
    if (!paymentSetting) {
        paymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId: restaurant.id });
    }

    const reminderHoursBefore = paymentSetting.notifyPrepaymentReminderHoursBefore!;
    let reminderTime = new Date(reservation.createdAt.getTime() + (reminderHoursBefore) * 60 * 60 * 1000);

    const nowTest = new Date()
    let test = new Date(nowTest.getTime() + 1000 * 60 * 3) // 3 minutes for testing

    reminderTime = test

    return {
        id: reminderJobId,
        type: 'payemt_reminder',
        executeAt: reminderTime,
        data: {
            reservationId: reservation.id,
            restaurantId: restaurant.id,
        }
    }
}
