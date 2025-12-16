import { Users, Crown } from 'lucide-react';
import { Profile } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TeamSidebarProps {
  profiles: Profile[];
  taskCounts: Record<string, number>;
  getProfileRole: (profileId: string) => 'leader' | 'member' | null;
}

export const TeamSidebar = ({ profiles, taskCounts, getProfileRole }: TeamSidebarProps) => {
  const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
  
  return (
    <aside className="w-64 border-r border-border bg-card/30 h-[calc(100vh-4rem)] sticky top-16 hidden lg:block">
      <div className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Team Members</span>
        </div>
        
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No team members yet
          </p>
        ) : (
          <div className="space-y-1">
            {profiles.map((member) => {
              const role = getProfileRole(member.id);
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer group"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    role === 'leader' 
                      ? "bg-primary/15 text-primary ring-2 ring-primary/20" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {member.avatar_initials}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{member.display_name}</span>
                      {role === 'leader' && (
                        <Crown className="w-3 h-3 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {taskCounts[member.id] || 0} tasks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border mt-4">
        <div className="bg-accent/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-1">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalTasks}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{profiles.length}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
