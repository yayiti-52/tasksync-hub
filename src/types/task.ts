export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member';
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assigneeId: string;
  createdById: string;
  deadline: Date;
  createdAt: Date;
  comments: Comment[];
  tags: string[];
}
