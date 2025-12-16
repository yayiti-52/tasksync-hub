import { Task, TeamMember, Status } from '@/types/task';
import { TaskColumn } from './TaskColumn';

interface TaskBoardProps {
  tasks: Task[];
  members: TeamMember[];
  onTaskClick: (task: Task) => void;
}

const columns: { title: string; status: Status }[] = [
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Review', status: 'review' },
  { title: 'Done', status: 'done' },
];

export const TaskBoard = ({ tasks, members, onTaskClick }: TaskBoardProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-6">
      {columns.map((column) => (
        <TaskColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={tasks.filter(t => t.status === column.status)}
          members={members}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};
