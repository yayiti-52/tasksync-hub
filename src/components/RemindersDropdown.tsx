import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';

interface Reminder {
  id: string;
  task_id: string;
  sent_by: string;
  sent_to: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  task_title?: string;
}

export const RemindersDropdown = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  const fetchReminders = async () => {
    if (!profile) return;

    const { data: remindersData } = await supabase
      .from('task_reminders')
      .select('*')
      .eq('sent_to', profile.id)
      .order('created_at', { ascending: false });

    if (remindersData) {
      // Fetch sender names and task titles
      const enrichedReminders = await Promise.all(
        remindersData.map(async (r) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', r.sent_by)
            .maybeSingle();
          
          const { data: task } = await supabase
            .from('tasks')
            .select('title')
            .eq('id', r.task_id)
            .maybeSingle();

          return {
            ...r,
            sender_name: sender?.display_name || 'Unknown',
            task_title: task?.title || 'Unknown task',
          };
        })
      );
      setReminders(enrichedReminders);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchReminders();
    }
  }, [profile]);

  const markAsRead = async (reminderId: string) => {
    await supabase
      .from('task_reminders')
      .update({ is_read: true })
      .eq('id', reminderId);

    setReminders(prev =>
      prev.map(r => (r.id === reminderId ? { ...r, is_read: true } : r))
    );
  };

  const unreadCount = reminders.filter(r => !r.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-medium">Reminders</h4>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <ScrollArea className="max-h-80">
          {reminders.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No reminders yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-3 space-y-1 ${!reminder.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reminder.task_title}</p>
                      <p className="text-xs text-muted-foreground">
                        From {reminder.sender_name} • {format(parseISO(reminder.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!reminder.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => markAsRead(reminder.id)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80">{reminder.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
