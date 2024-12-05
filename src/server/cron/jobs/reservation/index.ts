import { activeJobs, jobsData } from "../config";
import { processPaymentCheckJobBatch } from "./payment-check";



export const reservationJobManager = {
    cancelReservationJobs(reservationId: number) {
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
        console.log('rescheduleReservationJobs')
        this.cancelReservationJobs(reservationId);
        processPaymentCheckJobBatch(reservationId-10)
    }
};      