import { useState } from 'react';
import { X, Calendar, User, Flag, MessageSquare, Send, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TeamMember, Status, Priority, Comment } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
  task: Task | null;
  members: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: Status) => void;
  onAddComment: (taskId: string, content: string) => void;
}

const statusOptions: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const priorityConfig: Record<Priority, { label: string; class: string }> = {
  high: { label: 'High Priority', class: 'text-destructive' },
  medium: { label: 'Medium Priority', class: 'text-warning' },
  low: { label: 'Low Priority', class: 'text-success' },
};

export const TaskDetailModal = ({
  task,
  members,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddComment,
}: TaskDetailModalProps) => {
  const [newComment, setNewComment] = useState('');

  if (!task) return null;

  const assignee = members.find(m => m.id === task.assigneeId);
  const creator = members.find(m => m.id === task.createdById);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pr-8">
          <div className="flex items-start gap-3">
            <div className={cn("mt-1", priorityConfig[task.priority].class)}>
              <Flag className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold leading-tight">
                {task.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created by {creator?.name} on {format(task.createdAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Task Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <Select value={task.status} onValueChange={(v) => onUpdateStatus(task.id, v as Status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{assignee?.name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{format(task.deadline, 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
              <div className={cn(
                "flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background",
                priorityConfig[task.priority].class
              )}>
                <Flag className="w-4 h-4" />
                <span className="text-sm">{priorityConfig[task.priority].label}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <p className="text-sm leading-relaxed text-foreground/90 bg-muted/30 rounded-lg p-4">
              {task.description}
            </p>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Discussion ({task.comments.length})
            </label>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {task.comments.map((comment) => {
                const author = members.find(m => m.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
                      {author?.avatar || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{author?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
              
              {task.comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Start the discussion!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="border-t border-border pt-4 flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-24 resize-none"
            rows={1}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
