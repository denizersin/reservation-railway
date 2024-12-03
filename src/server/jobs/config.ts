import * as cron from 'node-cron';
import * as schedule from 'node-schedule';

export type JobType = {
  id: string;
  type: 'payment_check' | 'reminder';
  executeAt: Date;
  data: {
    reservationId: string;
    restaurantId: string;
    deadlineHours?: number;
  };
}

// Aktif jobları memory'de tutacağız
export const activeJobs = new Map<string, schedule.Job>(); 