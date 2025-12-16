import { Task, Profile, TaskComment } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

type Status = 'todo' | 'in-progress' | 'review' | 'done';

interface TaskColumnProps {
  title: string;
  status: Status;
  tasks: Task[];
  profiles: Profile[];
  comments: Record<string, TaskComment[]>;
  onTaskClick: (task: Task) => void;
}

const statusConfig: Record<Status, { color: string; bgColor: string }> = {
  'todo': { color: 'bg-status-todo', bgColor: 'bg-status-todo/10' },
  'in-progress': { color: 'bg-status-progress', bgColor: 'bg-status-progress/10' },
  'review': { color: 'bg-status-review', bgColor: 'bg-status-review/10' },
  'done': { color: 'bg-status-done', bgColor: 'bg-status-done/10' },
};

export const TaskColumn = ({ title, status, tasks, profiles, comments, onTaskClick }: TaskColumnProps) => {
  const config = statusConfig[status];
  
  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className={cn("rounded-xl p-4", config.bgColor)}>
        <div className="flex items-center gap-2 mb-4">
          <div className={cn("status-indicator", config.color)} />
          <h2 className="font-medium text-sm">{title}</h2>
          <span className="ml-auto text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={profiles.find(p => p.id === task.assignee_id)}
              commentCount={comments[task.id]?.length || 0}
              onClick={() => onTaskClick(task)}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
