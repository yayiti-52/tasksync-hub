import { Calendar, MessageSquare } from 'lucide-react';
import { Task, Profile, TaskComment } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { format, isPast, isToday, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  assignee: Profile | undefined;
  commentCount: number;
  onClick: () => void;
}

const priorityConfig = {
  high: { label: 'High', class: 'priority-high' },
  medium: { label: 'Medium', class: 'priority-medium' },
  low: { label: 'Low', class: 'priority-low' },
};

export const TaskCard = ({ task, assignee, commentCount, onClick }: TaskCardProps) => {
  const deadline = parseISO(task.deadline);
  const isOverdue = isPast(deadline) && task.status !== 'done';
  const isDueToday = isToday(deadline);

  return (
    <div
      onClick={onClick}
      className="task-card p-4 cursor-pointer animate-fade-in"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={cn('priority-badge', priorityConfig[task.priority].class)}>
          {priorityConfig[task.priority].label}
        </span>
        {commentCount > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-xs">{commentCount}</span>
          </div>
        )}
      </div>

      <h3 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h3>
      
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          isOverdue ? "text-destructive" : isDueToday ? "text-warning" : "text-muted-foreground"
        )}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(deadline, 'MMM d')}</span>
        </div>

        {assignee && (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
            {assignee.avatar_initials}
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
