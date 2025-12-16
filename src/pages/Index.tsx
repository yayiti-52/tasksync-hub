import { useState } from 'react';
import { Header } from '@/components/Header';
import { TeamSidebar } from '@/components/TeamSidebar';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { teamMembers, initialTasks } from '@/data/mockData';
import { Task, Status, Comment } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const taskCountsByMember = tasks.reduce((acc, task) => {
    if (task.status !== 'done') {
      acc[task.assigneeId] = (acc[task.assigneeId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (taskId: string, status: Status) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status } : t
    ));
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, status } : prev);
    
    toast({
      title: "Status updated",
      description: `Task moved to ${status.replace('-', ' ')}`,
    });
  };

  const handleAddComment = (taskId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      authorId: '1', // Current user
      content,
      createdAt: new Date(),
    };

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
    ));
    setSelectedTask(prev => 
      prev?.id === taskId ? { ...prev, comments: [...prev.comments, newComment] } : prev
    );
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `${Date.now()}`,
      createdAt: new Date(),
      comments: [],
    };

    setTasks(prev => [newTask, ...prev]);
    
    toast({
      title: "Task created",
      description: `"${taskData.title}" has been assigned`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateTask={() => setIsCreateOpen(true)} />
      
      <div className="flex">
        <TeamSidebar members={teamMembers} taskCounts={taskCountsByMember} />
        
        <main className="flex-1 py-6 overflow-hidden">
          <div className="px-6 mb-6">
            <h1 className="text-2xl font-display font-bold">Project Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your team's progress
            </p>
          </div>
          
          <TaskBoard 
            tasks={tasks} 
            members={teamMembers} 
            onTaskClick={handleTaskClick}
          />
        </main>
      </div>

      <TaskDetailModal
        task={selectedTask}
        members={teamMembers}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
      />

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        members={teamMembers}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};

export default Index;
