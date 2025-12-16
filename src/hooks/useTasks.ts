import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee_id: string | null;
  created_by_id: string;
  deadline: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'leader' | 'member';
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Record<string, TaskComment[]>>({});
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, role } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name');
      
      if (profilesData) {
        setProfiles(profilesData);
      }

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesData) {
        setUserRoles(rolesData as UserRole[]);
      }

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksData) {
        setTasks(tasksData as Task[]);
        
        // Fetch comments for all tasks
        const taskIds = tasksData.map(t => t.id);
        if (taskIds.length > 0) {
          const { data: commentsData } = await supabase
            .from('task_comments')
            .select('*')
            .in('task_id', taskIds)
            .order('created_at', { ascending: true });
          
          if (commentsData) {
            const commentsByTask: Record<string, TaskComment[]> = {};
            commentsData.forEach((comment) => {
              if (!commentsByTask[comment.task_id]) {
                commentsByTask[comment.task_id] = [];
              }
              commentsByTask[comment.task_id].push(comment as TaskComment);
            });
            setComments(commentsByTask);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createTask = async (taskData: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    assignee_id: string;
    deadline: Date;
    tags: string[];
  }) => {
    if (!profile) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'todo',
        assignee_id: taskData.assignee_id,
        created_by_id: profile.id,
        deadline: taskData.deadline.toISOString(),
        tags: taskData.tags,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    setTasks(prev => [data as Task, ...prev]);
    toast({
      title: 'Task created',
      description: `"${taskData.title}" has been assigned`,
    });
    return { error: null };
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    toast({
      title: 'Status updated',
      description: `Task moved to ${status.replace('-', ' ')}`,
    });
  };

  const addComment = async (taskId: string, content: string) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        author_id: profile.id,
        content,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error adding comment',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), data as TaskComment],
    }));
  };

  const getMemberProfiles = () => {
    return profiles.filter(p => {
      const userRole = userRoles.find(r => r.user_id === p.user_id);
      return userRole?.role === 'member';
    });
  };

  const getProfileRole = (profileId: string) => {
    const prof = profiles.find(p => p.id === profileId);
    if (!prof) return null;
    const userRole = userRoles.find(r => r.user_id === prof.user_id);
    return userRole?.role || null;
  };

  return {
    tasks,
    comments,
    profiles,
    userRoles,
    loading,
    createTask,
    updateTaskStatus,
    addComment,
    getMemberProfiles,
    getProfileRole,
    refetch: fetchData,
  };
};
