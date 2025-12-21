// src/types/index.ts
export interface Company {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  fullName: string;

  role: "admin" | "user";
}

export interface Workspace {
  id: number;
  createdBy: number;
  name: string;
  slug: string;
  description: string | null;
  creator?: {
    id: number;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface NoteVote {
  noteId: number;

  voteType: "upvote" | "downvote";
}

export interface Note {
  id: number;
  workspaceId: number;
  createdBy: number;
  title: string;
  content: string;
  type: "public" | "private";
  status: "draft" | "published";
  upvotesCount: number;
  downvotesCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workspace?: Workspace;
  userVote?: "upvote" | "downvote" | null;
  creator?: {
    id: number;
    fullName: string;
  };
  tags?: Tag[];
  votes?: NoteVote[];
}

export interface NoteHistory {
  id: number;
  noteId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: null | string;
    previousPageUrl: null | string;
  };
}
