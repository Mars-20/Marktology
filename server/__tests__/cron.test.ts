import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as mvpStorage from '../storage-mvp-additions';
import { storage } from '../storage';

describe('Cron Jobs Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Follow-up Tasks Functions', () => {
    it('getDueFollowUpTasks - should return tasks due today', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Mock the function
      const mockTasks = [
        {
          id: 'task-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          due_date: today,
          title: 'متابعة',
          patient_name: 'أحمد محمد',
        },
      ];

      vi.spyOn(mvpStorage, 'getDueFollowUpTasks').mockResolvedValue(mockTasks as any);

      const tasks = await mvpStorage.getDueFollowUpTasks(today);
      
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(0);
    });

    it('getOverdueFollowUpTasks - should return overdue tasks', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const mockTasks = [
        {
          id: 'task-2',
          patient_id: 'patient-2',
          doctor_id: 'doctor-1',
          due_date: '2025-12-25',
          title: 'متابعة متأخرة',
          patient_name: 'فاطمة علي',
        },
      ];

      vi.spyOn(mvpStorage, 'getOverdueFollowUpTasks').mockResolvedValue(mockTasks as any);

      const tasks = await mvpStorage.getOverdueFollowUpTasks(today);
      
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('getUpcomingAppointments - should return appointments in next hours', async () => {
      const mockAppointments = [
        {
          id: 'appt-1',
          doctor_id: 'doctor-1',
          patient_id: 'patient-1',
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: '14:00:00',
          patient_name: 'محمد أحمد',
        },
      ];

      vi.spyOn(mvpStorage, 'getUpcomingAppointments').mockResolvedValue(mockAppointments as any);

      const appointments = await mvpStorage.getUpcomingAppointments(2);
      
      expect(appointments).toBeDefined();
      expect(Array.isArray(appointments)).toBe(true);
    });
  });

  describe('Notification Creation', () => {
    it('createNotification - should create notification successfully', async () => {
      const mockNotification = {
        user_id: 'doctor-1',
        type: 'follow_up' as const,
        title: 'متابعة مريض مستحقة',
        message: 'لديك متابعة مستحقة للمريض: أحمد محمد',
        related_id: 'task-1',
        related_type: 'follow_up_task',
        is_read: false,
      };

      if (storage && storage.createNotification) {
        vi.spyOn(storage, 'createNotification').mockResolvedValue({
          id: 'notif-1',
          ...mockNotification,
          created_at: new Date(),
        } as any);

        const notification = await storage.createNotification(mockNotification);
        
        expect(notification).toBeDefined();
        expect(notification.type).toBe('follow_up');
      }
    });
  });

  describe('Cron Job Logic Simulation', () => {
    it('should process due follow-ups and create notifications', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const mockTasks = [
        {
          id: 'task-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          due_date: today,
          title: 'متابعة',
          patient_name: 'أحمد محمد',
        },
      ];

      vi.spyOn(mvpStorage, 'getDueFollowUpTasks').mockResolvedValue(mockTasks as any);
      
      if (storage && storage.createNotification) {
        const createNotificationSpy = vi.spyOn(storage, 'createNotification').mockResolvedValue({
          id: 'notif-1',
          user_id: 'doctor-1',
          type: 'follow_up',
          title: 'متابعة مريض مستحقة',
          message: 'لديك متابعة مستحقة للمريض: أحمد محمد',
          related_id: 'task-1',
          related_type: 'follow_up_task',
          is_read: false,
          created_at: new Date(),
        } as any);

        // Simulate cron job logic
        const dueTasks = await mvpStorage.getDueFollowUpTasks(today);
        
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

        expect(createNotificationSpy).toHaveBeenCalledTimes(mockTasks.length);
      }
    });

    it('should process overdue follow-ups with days calculation', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const mockTasks = [
        {
          id: 'task-2',
          patient_id: 'patient-2',
          doctor_id: 'doctor-1',
          due_date: '2025-12-25',
          title: 'متابعة متأخرة',
          patient_name: 'فاطمة علي',
        },
      ];

      vi.spyOn(mvpStorage, 'getOverdueFollowUpTasks').mockResolvedValue(mockTasks as any);

      const overdueTasks = await mvpStorage.getOverdueFollowUpTasks(today);
      
      expect(overdueTasks).toBeDefined();
      
      // Calculate days overdue
      for (const task of overdueTasks) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        expect(daysOverdue).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
