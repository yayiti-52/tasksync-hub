-- Create queries table for member-to-leader communication
CREATE TABLE public.queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_profile_id UUID NOT NULL,
  to_profile_id UUID NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- Members can create queries
CREATE POLICY "Members can create queries" 
ON public.queries 
FOR INSERT 
WITH CHECK (from_profile_id = get_profile_id(auth.uid()));

-- Users can view their own queries (sent or received)
CREATE POLICY "Users can view their queries" 
ON public.queries 
FOR SELECT 
USING (from_profile_id = get_profile_id(auth.uid()) OR to_profile_id = get_profile_id(auth.uid()));

-- Leaders can respond to queries sent to them
CREATE POLICY "Leaders can respond to queries" 
ON public.queries 
FOR UPDATE 
USING (to_profile_id = get_profile_id(auth.uid()) AND has_role(auth.uid(), 'leader'::app_role));