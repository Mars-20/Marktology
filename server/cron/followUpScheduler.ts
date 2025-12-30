import cron from 'node-cron';
import { storage } from '../storage';
import * as mvpStorage from '../storage-mvp-additions';

/**
 * Follow-up Scheduler
 * Runs daily to check for due follow-ups and send notifications
 */
export function startFollowUpScheduler() {
  console.log('[CRON] Starting follow-up scheduler...');
  
  // Daily at 8:00 AM - Check for due follow-ups
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily follow-up check...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const dueTasks = await mvpStorage.getDueFollowUpTasks(today);
      
      console.log(`[CRON] Found ${dueTasks.length} due follow-up tasks`);
      
      // Create notifications for each due task
      for (const task of dueTasks) {
        await storage.createNotification({
          user_id: task.doctor_id,
          type: 'follow_up',
          title: 'متابعة مريض مستحقة',
          message: `لديك متابعة مستحقة للمريض: ${task.patient_name}`,
          related_id: task.id,
          related_type: 'follow_up_task',
          is_read: false,
        });
      }
      
      console.log('[CRON] Follow-up notifications sent successfully');
    } catch (error) {
      console.error('[CRON] Error in follow-up check:', error);
    }
  }, {
    timezone: 'Africa/Cairo'
  });
  
  // Daily at 6:00 PM - Check for overdue follow-ups
  cron.schedule('0 18 * * *', async () => {
    console.log('[CRON] Running overdue follow-ups check...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const overdueTasks = await mvpStorage.getOverdueFollowUpTasks(today);
      
      console.log(`[CRON] Found ${overdueTasks.length} overdue follow-up tasks`);
      
      // Create urgent notifications for overdue tasks
      for (const task of overdueTasks) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        await storage.createNotification({
          user_id: task.doctor_id,
          type: 'alert',
          title: 'تنبيه: متابعة متأخرة',
          message: `متابعة المريض ${task.patient_name} متأخرة بـ ${daysOverdue} يوم`,
          related_id: task.id,
          related_type: 'follow_up_task',
          is_read: false,
        });
      }
      
      console.log('[CRON] Overdue follow-up alerts sent successfully');
    } catch (error) {
      console.error('[CRON] Error in overdue follow-ups check:', error);
    }
  }, {
    timezone: 'Africa/Cairo'
  });
  
  // Every hour - Check for upcoming appointments
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running appointment reminders check...');
    
    try {
      const upcomingAppointments = await mvpStorage.getUpcomingAppointments(2);
      
      console.log(`[CRON] Found ${upcomingAppointments.length} upcoming appointments`);
      
      // Create notifications for doctors
      for (const appointment of upcomingAppointments) {
        await storage.createNotification({
          user_id: appointment.doctor_id,
          type: 'appointment',
          title: 'موعد قادم',
          message: `لديك موعد مع ${appointment.patient_name} في ${appointment.appointment_time}`,
          related_id: appointment.id,
          related_type: 'appointment',
          is_read: false,
        });
      }
      
      console.log('[CRON] Appointment reminders sent successfully');
    } catch (error) {
      console.error('[CRON] Error in appointment reminders:', error);
    }
  }, {
    timezone: 'Africa/Cairo'
  });
  
  console.log('[CRON] Follow-up scheduler started successfully');
  console.log('[CRON] - Daily follow-up check: 8:00 AM');
  console.log('[CRON] - Overdue follow-ups check: 6:00 PM');
  console.log('[CRON] - Appointment reminders: Every hour');
}
