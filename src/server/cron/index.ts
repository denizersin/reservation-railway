import * as cron from 'node-cron';
import { processPaymentCheckJobBatch } from './jobs/reservation/payment-check';
import { processPaymentReminderJobBatch } from './jobs/reservation/payment-reminder';


const initializePaymentCheckCron = () => {
    //5sn'de bir kontrol simdilik 
    console.log('payment check cron initialized89')
    cron.schedule('*/10 * * * * *', async () => {
        await processPaymentCheckJobBatch();
    });
    
};


const initializePaymentReminderCron = () => {
    //10sn'de bir kontrol simdilik 
    cron.schedule('*/10 * * * * *', async () => {
        await processPaymentReminderJobBatch();
    });
};




export const CRONS = {
    initializePaymentCheckCron,
    initializePaymentReminderCron
}

