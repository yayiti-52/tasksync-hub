import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';
import { Query } from '@/hooks/useQueries';
import { Profile } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface QueriesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  receivedQueries: Query[];
  sentQueries: Query[];
  profiles: Profile[];
  isLeader: boolean;
  onRespond: (queryId: string, response: string) => Promise<{ error: Error | null }>;
}

export const QueriesPanel = ({
  isOpen,
  onClose,
  receivedQueries,
  sentQueries,
  profiles,
  isLeader,
  onRespond,
}: QueriesPanelProps) => {
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [response, setResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  const getProfileName = (profileId: string) => {
    return profiles.find(p => p.id === profileId)?.display_name || 'Unknown';
  };

  const handleRespond = async () => {
    if (!selectedQuery || !response.trim()) return;
    setIsResponding(true);
    const { error } = await onRespond(selectedQuery.id, response.trim());
    setIsResponding(false);
    if (!error) {
      setSelectedQuery(null);
      setResponse('');
    }
  };

  const QueryCard = ({ query, showFrom }: { query: Query; showFrom: boolean }) => (
    <div
      className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors cursor-pointer"
      onClick={() => setSelectedQuery(query)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{query.subject}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{query.message}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{showFrom ? `From: ${getProfileName(query.from_profile_id)}` : `To: ${getProfileName(query.to_profile_id)}`}</span>
            <span>•</span>
            <span>{format(new Date(query.created_at), 'MMM d, h:mm a')}</span>
          </div>
        </div>
        <Badge variant={query.status === 'pending' ? 'secondary' : 'default'} className="shrink-0">
          {query.status === 'pending' ? (
            <><Clock className="w-3 h-3 mr-1" /> Pending</>
          ) : (
            <><CheckCircle2 className="w-3 h-3 mr-1" /> Responded</>
          )}
        </Badge>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Queries
          </DialogTitle>
        </DialogHeader>

        {selectedQuery ? (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedQuery(null)}>
                ← Back to list
              </Button>
              
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={selectedQuery.status === 'pending' ? 'secondary' : 'default'}>
                    {selectedQuery.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(selectedQuery.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{selectedQuery.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  From: {getProfileName(selectedQuery.from_profile_id)}
                </p>
                <div className="mt-4 p-3 rounded bg-background">
                  <p className="text-sm whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>
              </div>

              {selectedQuery.response && (
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-sm font-medium text-primary mb-2">Response:</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedQuery.response}</p>
                  {selectedQuery.responded_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Responded: {format(new Date(selectedQuery.responded_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>
              )}

              {isLeader && selectedQuery.status === 'pending' && selectedQuery.to_profile_id !== selectedQuery.from_profile_id && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <Button onClick={handleRespond} disabled={!response.trim() || isResponding} className="gap-2">
                    <Send className="w-4 h-4" />
                    {isResponding ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Tabs defaultValue={isLeader ? 'received' : 'sent'} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">
                Received {receivedQueries.filter(q => q.status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {receivedQueries.filter(q => q.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="received" className="flex-1 overflow-y-auto mt-4">
              {receivedQueries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No queries received</p>
              ) : (
                <div className="space-y-3">
                  {receivedQueries.map(query => (
                    <QueryCard key={query.id} query={query} showFrom />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent" className="flex-1 overflow-y-auto mt-4">
              {sentQueries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No queries sent</p>
              ) : (
                <div className="space-y-3">
                  {sentQueries.map(query => (
                    <QueryCard key={query.id} query={query} showFrom={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
