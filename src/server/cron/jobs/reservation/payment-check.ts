import { env } from '@/env';
import { TRestaurantPaymentSettingSelect } from '@/server/db/schema';
import { paymentSettingEntities } from '@/server/layer/entities/restaurant-setting';
import * as schedule from 'node-schedule';
import { reservationService } from '../../../layer/service/reservation';
import { activeJobs, jobsData, type JobType } from '../config';
import { getRestaurantPrepaymentSettingMap, getUnpaidReservations, TUnpaidReservationRecord } from '../queries/reservation';

let currentLastProcessedId = 0;


//payment and reminder jobs
export async function processPaymentCheckJobBatch(
    lastProcessedId = currentLastProcessedId
) {
    try {
        const restaurantPrepaymentSettingMap = await getRestaurantPrepaymentSettingMap()

        const result = await getUnpaidReservations({
            date: new Date(),
            lastProcessedId: lastProcessedId,
            pageSize: 100
        });

        console.log('Processing reservations:', result.reservations.length);

        for (const reservation of result.reservations) {
            const paymentJobId = `${reservation.reservation.id}-payment_check`;
            
            // Add check if job already exists in jobsData
            if (!activeJobs.has(paymentJobId) && !jobsData.has(paymentJobId)) {
                console.log(`Scheduling new job for reservation: ${reservation.reservation.id}`);
                const jobData = await getUnpaidReservationJob({ 
                    record: reservation, 
                    restaurantPaymentSetting: restaurantPrepaymentSettingMap.get(reservation.restaurant.id)! 
                });
                schedulePaymentCheck(jobData);
            } else {
                console.log(`Job already exists for reservation: ${reservation.reservation.id}`);
            }
        }

        // Eğer daha fazla kayıt varsa, son ID'yi güncelle
        // Yoksa baştan başla
        currentLastProcessedId = result.hasMore
            ? result.lastProcessedId
            : 0;

    } catch (error) {
        console.error('Error processing reservation batch:', error);
        // Hata durumunda baştan başla
        currentLastProcessedId = 0;
    }
}

function schedulePaymentCheck(jobData: JobType) {
    console.log(`Scheduling payment check for job ID: ${jobData.id}`);
    
    // First set the job data before scheduling
    jobsData.set(jobData.id, jobData);
    
    const job = schedule.scheduleJob(jobData.executeAt, async () => {
        try {
            console.log(`Executing payment check for job ID: ${jobData.id}`);
            await reservationService.cancelUnpaidReservation(jobData.data.reservationId);
        } finally {
            activeJobs.delete(jobData.id);
            jobsData.delete(jobData.id);
        }
    });

    activeJobs.set(jobData.id, job);
}



export const getUnpaidReservationJob = async ({ record, restaurantPaymentSetting }: {
    record: TUnpaidReservationRecord
    restaurantPaymentSetting?: TRestaurantPaymentSettingSelect
}): Promise<JobType> => {

    const { reservation, restaurant } = record;
    const paymentJobId = `${reservation.id}-payment_check`;

    let paymentSetting = restaurantPaymentSetting;
    if (!paymentSetting) {
        paymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId: restaurant.id });
    }

    const paymentDeadlineHours = paymentSetting.prepaymentCancellationHours
    let prepaymentDeadline = new Date(reservation.createdAt.getTime() + paymentDeadlineHours * 60 * 60 * 1000)


    const nowTest = new Date()
    let test = new Date(nowTest.getTime() + 1000 * 60 * 5)

    prepaymentDeadline = test


    return {
        id: paymentJobId,
        type: 'payment_check',
        // executeAt: isDeadlinePassed ? now : prepaymentDeadline,
        executeAt: prepaymentDeadline,
        data: {
            reservationId: reservation.id,
            restaurantId: restaurant.id,
        }
    }
}
