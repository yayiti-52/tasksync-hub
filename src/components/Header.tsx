import { Search, Plus, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { RemindersDropdown } from './RemindersDropdown';

interface HeaderProps {
  onCreateTask: () => void;
}

export const Header = ({ onCreateTask }: HeaderProps) => {
  const { profile, role, signOut } = useAuth();

  return (
    <header className="h-18 border-b-2 border-double border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="art-frame">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="font-display font-bold text-lg text-primary">T</span>
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight">TaskHive</span>
              <p className="text-xs text-muted-foreground font-ornate italic -mt-0.5">Artful Collaboration</p>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search the archives..." 
              className="w-72 pl-9 bg-muted/50 border-border focus:border-primary/40 focus:bg-card font-serif"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RemindersDropdown />
          
          {role === 'leader' && (
            <Button onClick={onCreateTask} variant="gradient" className="gap-2 font-display">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Commission</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={signOut} className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-display font-semibold text-primary border border-primary/20">
              {profile?.avatar_initials || 'U'}
            </div>
            {role === 'leader' && (
              <Crown className="w-4 h-4 text-vintage-ochre" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};