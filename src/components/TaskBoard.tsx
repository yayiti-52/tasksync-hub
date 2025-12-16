import { Task, Profile, TaskComment } from '@/hooks/useTasks';
import { TaskColumn } from './TaskColumn';

type Status = 'todo' | 'in-progress' | 'review' | 'done';

interface TaskBoardProps {
  tasks: Task[];
  profiles: Profile[];
  comments: Record<string, TaskComment[]>;
  onTaskClick: (task: Task) => void;
}

const columns: { title: string; status: Status }[] = [
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Review', status: 'review' },
  { title: 'Done', status: 'done' },
];

export const TaskBoard = ({ tasks, profiles, comments, onTaskClick }: TaskBoardProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-6">
      {columns.map((column) => (
        <TaskColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={tasks.filter(t => t.status === column.status)}
          profiles={profiles}
          comments={comments}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};
