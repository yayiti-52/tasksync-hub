import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useReminders = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const sendReminder = async (taskId: string, assigneeId: string, message: string) => {
    if (!profile) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('task_reminders')
      .insert({
        task_id: taskId,
        sent_by: profile.id,
        sent_to: assigneeId,
        message,
      });

    if (error) {
      toast({
        title: 'Error sending reminder',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Reminder sent',
      description: 'The team member has been notified.',
    });

    return { error: null };
  };

  return { sendReminder };
};
