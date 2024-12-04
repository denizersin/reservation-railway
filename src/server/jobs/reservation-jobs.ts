import * as cron from 'node-cron';
import * as schedule from 'node-schedule';
import { reservationService } from '../layer/service/reservation';
import { activeJobs, jobsData, type JobType } from './config';
import { getRestaurantPrepaymentSettingMap, getUnpaidReservationById, getUnpaidReservations } from './queries/reservation';
import { getUnpaidReservationJob } from './reservation';

// Global değişkeni process scope'una taşıyalım
const globalForJobs = global as unknown as {
    isCronInitialized: boolean;
};

let currentLastProcessedId = 0;

export const initializeReservationCron = () => {
    if (globalForJobs.isCronInitialized) {
        return;
    }

    console.log('cron initialized');
    globalForJobs.isCronInitialized = true;

    //5sn'de bir kontrol simdilik 
    cron.schedule('*/5 * * * * *', async () => {
        await processReservationBatch();
    });
};

async function processReservationBatch() {
    try {
        const restaurantPrepaymentSettingMap = await getRestaurantPrepaymentSettingMap()

        const result = await getUnpaidReservations({
            date: new Date(),
            lastProcessedId: currentLastProcessedId,
            pageSize: 100
        });

        console.log(result, 'cron result')

        for (const reservation of result.reservations) {
            const reminderJobId = `${reservation.reservation.id}-reminder`;
            const paymentJobId = `${reservation.reservation.id}-payment_check`;

            // Ödeme kontrolü için job
            if (!activeJobs.has(paymentJobId)) {
                const jobData = await getUnpaidReservationJob({ record: reservation, restaurantPaymentSetting: restaurantPrepaymentSettingMap.get(reservation.restaurant.id)! })
                schedulePaymentCheck(jobData);
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
    console.dir(jobData, 'payment job scheduled')
    const job = schedule.scheduleJob(jobData.executeAt, async () => {
        try {
            await reservationService.cancelUnpaidReservation(jobData.data.reservationId);
        } finally {
            activeJobs.delete(jobData.id);
            jobsData.delete(jobData.id);
        }
    });

    activeJobs.set(jobData.id, job);
    jobsData.set(jobData.id, jobData);
}

function scheduleReminder(jobData: JobType) {
    const job = schedule.scheduleJob(jobData.executeAt, async () => {
        try {
            // await reservationService.sendReservationReminder(jobData.data.reservationId);
        } finally {
            activeJobs.delete(jobData.id);
            jobsData.delete(jobData.id);
        }
    });

    activeJobs.set(jobData.id, job);
    jobsData.set(jobData.id, jobData);
}

// Job yönetimi için yardımcı fonksiyonlar
export const reservationJobManager = {
    cancelReservationJobs(reservationId: number) {
        console.log("cancelReservationJobs for reservationId:", reservationId)
        const paymentJobId = `${reservationId}-payment_check`;
        const reminderJobId = `${reservationId}-reminder`;

        [paymentJobId, reminderJobId].forEach(jobId => {
            if (activeJobs.has(jobId)) {
                activeJobs.get(jobId)?.cancel();
                activeJobs.delete(jobId);
                jobsData.delete(jobId);
            }
        });
    },

    async rescheduleReservationJobs({ reservationId }: {
        reservationId: number
    }) {
        // Önce eski jobları iptal et
        this.cancelReservationJobs(reservationId);


        const paymentReservation = await getUnpaidReservationById({ reservationId })

        if (paymentReservation.reservation) {
            const paymentJobData = await getUnpaidReservationJob({ record: paymentReservation.reservation, restaurantPaymentSetting: undefined })
            schedulePaymentCheck(paymentJobData);
        }

        // const reminderTime = new Date(reservation.reservationDate);
        // reminderTime.setHours(reminderTime.getHours() - 2);

        // const reminderJobData: JobType = {
        //     id: `${reservation.id}-reminder`,
        //     type: 'reminder',
        //     executeAt: reminderTime,
        //     data: {
        //         reservationId: reservation.id,
        //         restaurantId: reservation.restaurantId,
        //         reservationDate: reservation.reservationDate
        //     }
        // };
        // scheduleReminder(reminderJobData);
    }
}; 