import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TeamSidebar } from '@/components/TeamSidebar';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { CompletedTasksHistory } from '@/components/CompletedTasksHistory';
import { ExpertiseEditor } from '@/components/ExpertiseEditor';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { role, profile } = useAuth();
  const { 
    tasks, 
    comments, 
    profiles, 
    loading, 
    createTask, 
    updateTaskStatus, 
    addComment,
    getMemberProfiles,
    getProfileRole,
    refetch,
  } = useTasks();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [expertise, setExpertise] = useState<string[]>([]);
  
  // Sync expertise when profiles are loaded
  useEffect(() => {
    const userProfile = profiles.find(p => p.id === profile?.id);
    if (userProfile?.expertise) {
      setExpertise(userProfile.expertise);
    }
  }, [profiles, profile?.id]);
  
  // Filter out completed tasks for the main board
  const activeTasks = tasks.filter(t => t.status !== 'done');

  const taskCountsByMember = tasks.reduce((acc, task) => {
    if (task.status !== 'done' && task.assignee_id) {
      acc[task.assignee_id] = (acc[task.assignee_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    updateTaskStatus(taskId, status);
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, status } : prev);
  };

  const handleAddComment = (taskId: string, content: string) => {
    addComment(taskId, content);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">T</span>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCreateTask={() => setIsCreateOpen(true)} 
        onViewHistory={() => setIsHistoryOpen(true)}
      />
      
      <div className="flex">
        <TeamSidebar 
          profiles={profiles} 
          taskCounts={taskCountsByMember}
          getProfileRole={getProfileRole}
        />
        
        <main className="flex-1 py-6 overflow-hidden">
          <div className="px-6 mb-6">
            <h1 className="text-2xl font-display font-bold">Project Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {role === 'leader' 
                ? 'Create and manage your team\'s tasks' 
                : 'Track and update your assigned tasks'}
            </p>
          </div>
          
          {/* Expertise editor for members */}
          {role === 'member' && (
            <div className="px-6 mb-6">
              <ExpertiseEditor 
                expertise={expertise}
                onUpdate={setExpertise}
              />
            </div>
          )}
          
          {activeTasks.length === 0 ? (
            <div className="px-6">
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-2xl">T</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">No active tasks</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {role === 'leader' 
                    ? 'Create your first task to get your team started. Click the "New Task" button above.'
                    : 'No tasks have been assigned to you yet. Check back later!'}
                </p>
              </div>
            </div>
          ) : (
            <TaskBoard 
              tasks={activeTasks} 
              profiles={profiles}
              comments={comments}
              onTaskClick={handleTaskClick}
            />
          )}
        </main>
      </div>

      <TaskDetailModal
        task={selectedTask}
        profiles={profiles}
        comments={selectedTask ? (comments[selectedTask.id] || []) : []}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
      />

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        memberProfiles={getMemberProfiles()}
        onCreateTask={createTask}
      />
      
      <CompletedTasksHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        tasks={tasks}
        profiles={profiles}
      />
    </div>
  );
};

export default Index;
