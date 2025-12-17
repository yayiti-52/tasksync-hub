import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface TaskDocumentation {
  id: string;
  task_id: string;
  content: string;
  updated_at: string;
}

export const useTaskDocumentation = (taskId: string | null) => {
  const [documentation, setDocumentation] = useState<TaskDocumentation | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchDocumentation = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('task_documentation')
      .select('*')
      .eq('task_id', taskId)
      .maybeSingle();
    
    setDocumentation(data);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetchDocumentation();
  }, [fetchDocumentation]);

  const saveDocumentation = async (content: string) => {
    if (!taskId || !profile) return;

    if (documentation) {
      // Update existing
      const { error } = await supabase
        .from('task_documentation')
        .update({ content, updated_by: profile.id })
        .eq('id', documentation.id);

      if (error) {
        toast({
          title: 'Error saving documentation',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('task_documentation')
        .insert({ task_id: taskId, content, updated_by: profile.id });

      if (error) {
        toast({
          title: 'Error saving documentation',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Documentation saved',
      description: 'Your notes have been saved successfully.',
    });
    
    fetchDocumentation();
  };

  return {
    documentation,
    loading,
    saveDocumentation,
  };
};
