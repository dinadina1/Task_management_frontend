export type Id = string | number;

export type Section = {
    id: Id;
    title: string;
}

// tasks

type User = {
    id: Id;
    name: string;
    email: string;
    createdAt?: string;
    avatar: string;
};

type Tag = {
    id: Id;
    name: string;
};

type Comment = {
    id: Id;
    content: string;
    taskId: Id;
    createdAt: string;
    user: User;
};

type ActivityLog = {
    id: Id;
    activity: string;
    timestamp: string;
    details?: string;
    user: {
        id: string;
        name: string;
    };
};

type Attachment = {
    id: Id;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
};

type Subtask = {
    id: Id;
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
    comments?: Comment[];
    attachments: Attachment[];
    subtasks: Subtask[]; // recursive
};

export type Task = {
    id: Id;
    title: string;
    description: string;
    section: string;
    status: string;
    priority?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
    tags?: Tag[];
    assignee?: User[];
    comments?: Comment[];
    activityLog?: ActivityLog[];
    subtasks?: Subtask[];
    attachments?: Attachment[];
};
