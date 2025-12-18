import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Query {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  task_id: string | null;
  subject: string;
  message: string;
  response: string | null;
  status: 'pending' | 'responded';
  created_at: string;
  responded_at: string | null;
}

export const useQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, role } = useAuth();
  const { toast } = useToast();

  const fetchQueries = async () => {
    if (!profile) return;
    
    const { data, error } = await supabase
      .from('queries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching queries:', error);
    } else {
      setQueries(data as Query[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchQueries();
    }
  }, [profile]);

  const createQuery = async (data: {
    to_profile_id: string;
    task_id?: string;
    subject: string;
    message: string;
  }) => {
    if (!profile) return { error: new Error('Not authenticated') };

    const { data: newQuery, error } = await supabase
      .from('queries')
      .insert({
        from_profile_id: profile.id,
        to_profile_id: data.to_profile_id,
        task_id: data.task_id || null,
        subject: data.subject,
        message: data.message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error sending query',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    setQueries(prev => [newQuery as Query, ...prev]);
    toast({ title: 'Query sent to team leader!' });
    return { error: null };
  };

  const respondToQuery = async (queryId: string, response: string) => {
    const { error } = await supabase
      .from('queries')
      .update({
        response,
        status: 'responded',
        responded_at: new Date().toISOString(),
      })
      .eq('id', queryId);

    if (error) {
      toast({
        title: 'Error responding',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    setQueries(prev =>
      prev.map(q =>
        q.id === queryId
          ? { ...q, response, status: 'responded' as const, responded_at: new Date().toISOString() }
          : q
      )
    );
    toast({ title: 'Response sent!' });
    return { error: null };
  };

  const getReceivedQueries = () => queries.filter(q => q.to_profile_id === profile?.id);
  const getSentQueries = () => queries.filter(q => q.from_profile_id === profile?.id);
  const getPendingCount = () => getReceivedQueries().filter(q => q.status === 'pending').length;

  return {
    queries,
    loading,
    createQuery,
    respondToQuery,
    getReceivedQueries,
    getSentQueries,
    getPendingCount,
    refetch: fetchQueries,
  };
};
