-- Create task documentation table for assignee notes
CREATE TABLE public.task_documentation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id)
);

-- Create task reminders table
CREATE TABLE public.task_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES public.profiles(id),
  sent_to UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;

-- Task documentation policies
CREATE POLICY "Anyone can view task documentation"
ON public.task_documentation FOR SELECT
USING (true);

CREATE POLICY "Assignee can insert documentation"
ON public.task_documentation FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_id 
    AND tasks.assignee_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Assignee can update documentation"
ON public.task_documentation FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_id 
    AND tasks.assignee_id = get_profile_id(auth.uid())
  )
);

-- Task reminders policies
CREATE POLICY "Leaders can send reminders"
ON public.task_reminders FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'leader') AND sent_by = get_profile_id(auth.uid())
);

CREATE POLICY "Users can view their reminders"
ON public.task_reminders FOR SELECT
USING (
  sent_to = get_profile_id(auth.uid()) OR sent_by = get_profile_id(auth.uid())
);

CREATE POLICY "Users can mark their reminders as read"
ON public.task_reminders FOR UPDATE
USING (sent_to = get_profile_id(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_task_documentation_updated_at
BEFORE UPDATE ON public.task_documentation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();