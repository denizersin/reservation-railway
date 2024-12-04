
import * as schedule from 'node-schedule';

export type JobType = {
  id: string;
  type: 'payment_check' | 'reminder';
  executeAt: Date;
  data: {
    reservationId: number;
    restaurantId: number;
    deadlineHours?: number;
    reservationDate?: Date;
  };
}

// Aktif jobları memory'de tutacağız
export const activeJobs = new Map<string, schedule.Job>();

// Job verilerini tutacağımız map
export const jobsData = new Map<string, JobType>();
