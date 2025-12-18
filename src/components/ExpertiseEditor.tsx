import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ExpertiseEditorProps {
  expertise: string[];
  onUpdate: (expertise: string[]) => void;
}

export const ExpertiseEditor = ({ expertise, onUpdate }: ExpertiseEditorProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (expertise.includes(newSkill.trim())) {
      toast({ title: 'Skill already added', variant: 'destructive' });
      return;
    }
    const updated = [...expertise, newSkill.trim()];
    onUpdate(updated);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = expertise.filter(s => s !== skill);
    onUpdate(updated);
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ expertise })
      .eq('id', profile.id);
    
    setIsSaving(false);
    
    if (error) {
      toast({ title: 'Error saving expertise', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Expertise saved!' });
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-medium">My Expertise</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {expertise.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expertise added yet. Click edit to add your skills.</p>
          ) : (
            expertise.map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-medium">Edit Expertise</h3>
      </div>
      
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Add a skill (e.g., React, Design)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
        />
        <Button variant="outline" size="icon" onClick={handleAddSkill}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {expertise.map(skill => (
          <Badge key={skill} variant="secondary" className="pr-1">
            {skill}
            <button 
              onClick={() => handleRemoveSkill(skill)}
              className="ml-1 hover:bg-destructive/20 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
