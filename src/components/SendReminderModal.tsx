import { useState } from 'react';
import { Bell, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Profile } from '@/hooks/useTasks';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  assignee: Profile | undefined;
  onSend: (message: string) => Promise<void>;
}

export const SendReminderModal = ({ isOpen, onClose, taskTitle, assignee, onSend }: SendReminderModalProps) => {
  const [message, setMessage] = useState(`Hi ${assignee?.display_name || 'there'}, this is a reminder about the task "${taskTitle}". Please update the status when possible.`);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await onSend(message.trim());
      onClose();
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Send Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Send a reminder to <span className="font-medium text-foreground">{assignee?.display_name || 'Unknown'}</span> about:
            </p>
            <p className="text-sm font-medium">{taskTitle}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your reminder message..."
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
