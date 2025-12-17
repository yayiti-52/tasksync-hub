import { useState, useEffect } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TaskDocumentationProps {
  taskId: string;
  content: string;
  canEdit: boolean;
  onSave: (content: string) => Promise<void>;
}

export const TaskDocumentation = ({ taskId, content, canEdit, onSave }: TaskDocumentationProps) => {
  const [docContent, setDocContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setDocContent(content);
    setHasChanges(false);
  }, [content, taskId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(docContent);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setDocContent(value);
    setHasChanges(value !== content);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Documentation Notes
        </label>
        {canEdit && hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs gap-1">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
        )}
      </div>
      
      {canEdit ? (
        <Textarea
          value={docContent}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your notes, progress updates, and documentation here..."
          className="min-h-[120px] resize-none bg-muted/30"
        />
      ) : (
        <div className="min-h-[80px] p-3 rounded-md bg-muted/30 text-sm">
          {docContent || (
            <span className="text-muted-foreground italic">No documentation yet.</span>
          )}
        </div>
      )}
      
      {canEdit && (
        <p className="text-xs text-muted-foreground">
          Only you (the assignee) can edit this documentation. Others can view it.
        </p>
      )}
    </div>
  );
};
