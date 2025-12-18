import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, HelpCircle } from 'lucide-react';
import { Profile, Task } from '@/hooks/useTasks';

interface RaiseQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaders: Profile[];
  tasks: Task[];
  onSubmit: (data: {
    to_profile_id: string;
    task_id?: string;
    subject: string;
    message: string;
  }) => Promise<{ error: Error | null }>;
}

export const RaiseQueryModal = ({ isOpen, onClose, leaders, tasks, onSubmit }: RaiseQueryModalProps) => {
  const [leaderId, setLeaderId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderId || !subject.trim() || !message.trim()) return;

    setIsLoading(true);
    const { error } = await onSubmit({
      to_profile_id: leaderId,
      task_id: taskId || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });
    setIsLoading(false);

    if (!error) {
      setLeaderId('');
      setTaskId('');
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Raise a Query
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Send To (Team Leader)</Label>
            <Select value={leaderId} onValueChange={setLeaderId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select team leader" />
              </SelectTrigger>
              <SelectContent>
                {leaders.map(leader => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Related Task (Optional)</Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select task (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief subject of your query..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your query in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!leaderId || !subject.trim() || !message.trim() || isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send Query
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
