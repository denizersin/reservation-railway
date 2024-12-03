import * as cron from 'node-cron';
import * as schedule from 'node-schedule';
import { activeJobs, type JobType } from './config';
import { reservationService } from '../layer/service/reservation';

// Her 15 dakikada bir çalışacak cron
export const initializeReservationCron = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('Checking reservations...');
    await checkPendingReservations();
  });
};

async function checkPendingReservations() {
  try {
    // Ödeme bekleyen ve hatırlatma gereken rezervasyonları getir
    const pendingReservations = await reservationService.getPendingReservations();
    
    for (const reservation of pendingReservations) {
      const jobId = `${reservation.id}-${reservation.type}`;
      
      // Eğer bu rezervasyon için zaten bir job varsa, skip
      if (activeJobs.has(jobId)) continue;

      if (!reservation.isPaid) {
        schedulePaymentCheck({
          id: jobId,
          reservationId: reservation.id,
          restaurantId: reservation.restaurantId,
          deadlineHours: reservation.paymentDeadlineHours
        });
      }

      // Rezervasyon 2 saat öncesi hatırlatma
      scheduleReminder({
        id: `${reservation.id}-reminder`,
        reservationId: reservation.id,
        reservationDate: reservation.date
      });
    }
  } catch (error) {
    console.error('Error checking reservations:', error);
  }
}

function schedulePaymentCheck(params: {
  id: string;
  reservationId: string;
  restaurantId: string;
  deadlineHours: number;
}) {
  const executeAt = new Date();
  executeAt.setHours(executeAt.getHours() + params.deadlineHours);

  const job = schedule.scheduleJob(executeAt, async () => {
    try {
      await reservationService.cancelUnpaidReservation(params.reservationId);
    } finally {
      activeJobs.delete(params.id);
    }
  });

  activeJobs.set(params.id, job);
}

function scheduleReminder(params: {
  id: string;
  reservationId: string;
  reservationDate: Date;
}) {
  const reminderTime = new Date(params.reservationDate);
  reminderTime.setHours(reminderTime.getHours() - 2);

  const job = schedule.scheduleJob(reminderTime, async () => {
    try {
      await reservationService.sendReservationReminder(params.reservationId);
    } finally {
      activeJobs.delete(params.id);
    }
  });

  activeJobs.set(params.id, job);
} 