export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
  }
  
  export interface Tag {
    id: number;
    name: string;
  }
  
  export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: User;
  }
  
  export interface Attachment {
    id: number;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }
  
  export interface Subtask {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    user: User;
    tags: Tag[];
    assignee: User[];
    comments: Comment[];
  }
  
  export interface Task {
    id: number;
    title: string;
    description: string;
    section: string;
    status: string;
    priority: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    user: User;
    tags: Tag[];
    assignee: User[];
    comments: Comment[];
    attachments: Attachment[];
    subtasks: Subtask[];
  }
  
  export interface TaskCardProps {
    task: Task;
    onCardClick: () => void;
  }
  
  