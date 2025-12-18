import { Task, Profile } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface CompletedTasksHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  profiles: Profile[];
}

export const CompletedTasksHistory = ({ isOpen, onClose, tasks, profiles }: CompletedTasksHistoryProps) => {
  const completedTasks = tasks.filter(t => t.status === 'done');
  
  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const profile = profiles.find(p => p.id === assigneeId);
    return profile?.display_name || 'Unknown';
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Completed Tasks History
          </DialogTitle>
        </DialogHeader>

        {completedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed tasks yet.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {completedTasks.map(task => (
              <div 
                key={task.id} 
                className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getAssigneeName(task.assignee_id)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Completed: {format(new Date(task.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </div>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
